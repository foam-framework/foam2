/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'DefaultDaggerService',

  implements: [
    'foam.nanos.medusa.DaggerService',
    'foam.nanos.NanoService'
  ],

  axioms: [
    foam.pattern.Singleton.create()
  ],

  documentation: `Manage global indexes and hashes`,

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'static foam.mlang.MLang.*',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PM',
    'foam.util.SafetyUtil',
    'java.nio.charset.StandardCharsets',
    'java.security.MessageDigest',
    'java.util.ArrayList',
    'java.util.List'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  public static String byte2Hex(byte[] bytes) {
    StringBuffer stringBuffer = new StringBuffer();
    String temp = null;
    for ( int i=0; i<bytes.length; i++ ) {
      temp = Integer.toHexString(bytes[i] & 0xFF);
      if ( temp.length() == 1 ) {
        stringBuffer.append("0");
      }
      stringBuffer.append(temp);
    }
    return stringBuffer.toString();
  }
          `
        }));
      }
    }
  ],

  properties: [
    {
      documentation: 'Starting index.',
      name: 'bootstrapIndex',
      class: 'Long',
      value: 0
    },
    {
      documentation: 'Number of manually created entries to prime the system.',
      name: 'numBootstrapEntries',
      class: 'Long',
      value: 2
    },
    {
      documentation: `When false don't use a MessageDigest to calculate a hash. Provided for testing purposes only.`,
      name: 'hashingEnabled',
      class: 'Boolean',
      value: true
    },
    {
      name: 'algorithm',
      class: 'String',
      value: 'SHA-256'
    },
    {
      documentation: 'Current max promoted index',
      name: 'index',
      label: 'Global Index',
      class: 'Long',
      visibility: 'RO'
    },
    {
      documentation: `Current links[] index to use. linksIndex flips back forth between 0 and 1.`,
      name: 'linksIndex',
      class: 'Int',
      value: 1,
      visibility: 'HIDDEN'
    },
    {
      name: 'links',
      class: 'Array',
      javaFactory: 'return new foam.nanos.medusa.DaggerLink[2];',
      visibility: 'HIDDEN'
    },
    {
      name: 'initialized',
      class: 'Boolean',
      value: false,
      visibility: 'HIDDEN'
    },
    {
      name: 'dao',
      class: 'foam.dao.DAOProperty',
      javaFactory: `
      return (DAO) getX().get("internalMedusaDAO");
      `,
      visibility: 'HIDDEN'
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      transient: true,
      visibility: 'HIDDEN',
      javaFactory: `
      return new PrefixLogger(new Object[] {
        this.getClass().getSimpleName()
      }, (Logger) getX().get("logger"));
      `
    }
  ],

  methods: [
    {
      name: 'start',
      javaCode: `
      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      setHashingEnabled(support.getHashingEnabled());

      ClusterConfig config = support.getConfig(getX(), support.getConfigId());
      if ( config == null ||
           config.getType() == MedusaType.NODE ||
           config.getZone() > 0L ) {
        getLogger().debug("start", "exit");
        return;
      }

      for ( int i = 0; i < getLinks().length; i++ ) {
        getLinks()[i] = new MedusaEntry.Builder(getX()).setIndex(getBootstrapIndex()).setHash(getBootstrapHash(getX())).build();
      }

      DAO dao = getDao();

      for ( int i = 0; i < getNumBootstrapEntries(); i++ ) {
        MedusaEntry entry = new MedusaEntry();
        entry = link(getX(), entry);
        entry = hash(getX(), entry);
        entry.setNSpecName("daggerService");
        entry.setNode(support.getConfigId());
        entry.setPromoted(true);
        entry = (MedusaEntry) dao.put_(getX(), entry);
        updateLinks(getX(), entry);
      }
     `
    },
    {
      documentation: `Initial hash to prime the system. Provide via:
    - JAVA_OPTS property:  -DBOOTSTRAP_HASH=
    - Explicitly set in DaggerService NSpec
    - // TODO: HSM`,
      name: 'getBootstrapHash',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'String',
      javaCode: `
      return System.getProperty(
                "BOOTSTRAP_HASH",
                "466c58623cd600209e95a981bad03e5d899ea6d6905cebee5ea0746bf16e1534"
             );
      `
    },
    {
      name: 'link',
      javaCode: `
      DaggerLinks links = getNextLinks(x);
      entry.setIndex(links.getGlobalIndex());
      entry.setIndex1(links.getLink1().getIndex());
      entry.setHash1(links.getLink1().getHash());
      entry.setIndex2(links.getLink2().getIndex());
      entry.setHash2(links.getLink2().getHash());
      return entry;
      `
    },
    {
      name: 'hash',
      javaCode: `
      PM pm = PM.create(x, DefaultDaggerService.getOwnClassInfo(), "hash");
      try {
        if ( ! getHashingEnabled() ) {
          entry.setHash(byte2Hex(Long.toString(entry.getIndex()).getBytes(StandardCharsets.UTF_8)));
          entry.setAlgorithm("NONE");
          return entry;
        }

        MessageDigest md = MessageDigest.getInstance(getAlgorithm());
        md.update(Long.toString(entry.getIndex1()).getBytes(StandardCharsets.UTF_8));
        md.update(entry.getHash1().getBytes(StandardCharsets.UTF_8));
        md.update(Long.toString(entry.getIndex2()).getBytes(StandardCharsets.UTF_8));
        md.update(entry.getHash2().getBytes(StandardCharsets.UTF_8));
        if ( ! SafetyUtil.isEmpty(entry.getData()) ) {
          md.update(entry.getData().getBytes(StandardCharsets.UTF_8));
        }
        String hash = byte2Hex(md.digest());
        entry.setHash(hash);
        entry.setAlgorithm(getAlgorithm());
        return entry;
      } finally {
        pm.log(x);
      }
      `
    },
    {
      documentation: 'Verify entry hash, and compare hashes of parent indexes.',
      name: 'verify',
      javaCode: `
      PM pm = PM.create(x, DefaultDaggerService.getOwnClassInfo(), "verify");
      try {
        if ( ! getHashingEnabled() ) {
          return;
        }

        DAO dao = getDao();
        MedusaEntry parent1 = (MedusaEntry) dao.find(EQ(MedusaEntry.INDEX, entry.getIndex1()));
        if ( parent1 == null ) {
          if ( entry.getIndex1() <= getLinks().length &&
               entry.getIndex2() <= getLinks().length &&
               entry.getIndex() <= getLinks().length ) {
             // ok - bootstrapping non zone 0 mediator
            getLogger().info("verify", "bootstrap", entry.getIndex());
            return;
          }
          getLogger().error("Hash Verification Failed", "verify", entry.getIndex(), "parent not found", entry.getIndex1(), "entry", entry.toSummary(), entry.getNode());
          throw new DaggerException("Hash Verification Failed on: "+entry.toSummary()+" from: "+entry.getNode());
        }
        MedusaEntry parent2 = (MedusaEntry) dao.find(EQ(MedusaEntry.INDEX, entry.getIndex2()));
        if ( parent2 == null ) {
          if ( entry.getIndex1() <= getLinks().length &&
               entry.getIndex2() <= getLinks().length &&
               entry.getIndex() <= getLinks().length ) {
            // ok - bootstrapping non zone 0 mediator
            getLogger().info("verify", "bootstrap", entry.getIndex());
            return;
          }
          getLogger().error("Hash verification failed", "verify", entry.getIndex(), "parent not found", entry.getIndex2(), "entry", entry.toSummary(), entry.getNode());
          throw new DaggerException("Hash verification failed on: "+entry.toSummary()+" from: "+entry.getNode());
        }

        try {
          MessageDigest md = MessageDigest.getInstance(entry.getAlgorithm());
          md.update(Long.toString(parent1.getIndex()).getBytes(StandardCharsets.UTF_8));
          md.update(parent1.getHash().getBytes(StandardCharsets.UTF_8));
          md.update(Long.toString(parent2.getIndex()).getBytes(StandardCharsets.UTF_8));
          md.update(parent2.getHash().getBytes(StandardCharsets.UTF_8));
          if ( entry.getData() != null ) {
            md.update(entry.getData().getBytes(StandardCharsets.UTF_8));
          }
          String calculatedHash = byte2Hex(md.digest());
          if ( ! calculatedHash.equals(entry.getHash()) ) {
            getLogger().error("Hash verification failed", "verify", entry.getIndex(), "hash", "fail", entry.toSummary());
            throw new DaggerException("Hash verification failed on: "+entry.toSummary());
          }
        } catch ( java.security.NoSuchAlgorithmException e ) {
          getLogger().error(e);
          throw new DaggerException(e);
        }
      } finally {
        pm.log(x);
      }
      `
    },
    {
      name: 'sign',
      javaCode: `
      return null;
      `
    },
    {
      name: 'getNextLinks',
      synchronized: true,
      type: 'foam.nanos.medusa.DaggerLinks',
      javaCode: `
      return new DaggerLinks(
        x,
        getNextGlobalIndex(x),
        (DaggerLink)getLinks()[0],
        (DaggerLink)getLinks()[1]
      );
      `
    },
    {
      name: 'updateLinks',
      synchronized: true,
      javaCode: `
      DaggerLink other = (DaggerLink) getLinks()[linksIndex_];
      // ensure links remain different.
      if ( other != null &&
           other.getIndex() == link.getIndex() ) {
        return;
      }
      linksIndex_ ^= 1;
      getLinks()[linksIndex_] = link;
      `
    },
    {
      name: 'setGlobalIndex',
      synchronized: true,
      javaCode: `
      if ( index > getIndex() ) {
        setIndex(index);
      }
      return getIndex();
      `
    },
    {
      name: 'getGlobalIndex',
      javaCode: `
      return getIndex();
      `
    },
    {
      name: 'getNextGlobalIndex',
      synchronized: true,
      javaCode: `
      setIndex(getIndex() + 1);
      return getIndex();
      `
    }
  ]
});
