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
//    'foam.nanos.NanoService',
  ],

  documentation: `Manage global indexes and hashes`,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'java.nio.charset.StandardCharsets',
    'java.security.MessageDigest',
    'java.time.Instant',
    'java.util.concurrent.atomic.AtomicLong',
    'java.util.Date'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  // TODO/REVIEW - don't think we need AtomicLong - see get/set methods below.
  private volatile AtomicLong globalIndex_ = new AtomicLong(0);
  private int linksIndex_ = 1;

  public static String byte2Hex(byte[] bytes) {
    StringBuffer stringBuffer = new StringBuffer();
    String temp = null;
    for (int i=0;i<bytes.length;i++){
      temp = Integer.toHexString(bytes[i] & 0xFF);
      if (temp.length()==1){
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
      name: 'links',
      class: 'Array',
      javaFactory: 'return new foam.nanos.medusa.DaggerLink[2];'
    },
    {
      name: 'replayIndex',
      class: 'Long'
    },
    {
      name: 'hashingAlgorithm',
      class: 'String',
      value: 'SHA-256'
    },
    {
      name: 'initialized',
      class: 'Boolean',
      value: false
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
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
      // TODO: get initial hashes from HSM for new deployment
//      name: 'start',
      name: 'initialize',
      synchronized: true,
      javaCode: `
      if ( getInitialized() ) {
        return;
      }
      getLogger().debug("initialize");
    try {
      DAO dao = (DAO) getX().get("internalMedusaEntryDAO");
      Date date = Date.from(Instant.parse("2017-04-03T11:00:00.000Z")); // Kevin's first day

      MedusaEntry entry = new MedusaEntry();
      entry.setIndex(getNextGlobalIndex(getX()));
      entry.setIndex1(-1L);
      entry.setHash1("466c58623cd600209e95a981bad03e5d899ea6d6905cebee5ea0746bf16e1534");
      entry.setIndex2(-1L);
      entry.setHash2("9232622261b1df4dff84067b2df22ecae387162742626326216bf9b4d0d29a3f");
      entry.setHash(hash(getX(), entry));
      entry.setHasConsensus(true);
      entry.setCreated(date);
      entry.setLastModified(date);
      entry.setLastModifiedBy(2L);
      entry = (MedusaEntry) dao.put_(getX(), entry);
      getLogger().debug("start", "entry1", entry.getId());
      updateLinks(getX(), entry);

      entry = new MedusaEntry();
      entry.setIndex(getNextGlobalIndex(getX()));
      entry.setIndex1(-1L);
      entry.setHash1("a651071e965f3c0e07cf9d09761e124a57f27dd75316a4c18079bc0e5accf9d2");
      entry.setIndex2(-1L);
      entry.setHash2("50c1071e836bdd4f2d4b5907bb6090fae6891d6cacdb70dcd72770bfd43dc814");
      entry.setHash(hash(getX(), entry));
      entry.setHasConsensus(true);
      entry.setCreated(date);
      entry.setLastModified(date);
      entry.setLastModifiedBy(2L);
      entry = (MedusaEntry) dao.put_(getX(), entry);
      getLogger().debug("start", "entry2", entry.getId());
      updateLinks(getX(), entry);

      dao.select(new foam.dao.Sink() {
        public void put(Object obj, foam.core.Detachable sub) {
          getLogger().debug("select", obj);
        }

        public void remove(Object obj, foam.core.Detachable sub) {
          // nop
        }

        public void eof() {
          // nop
        }

        public void reset(foam.core.Detachable sub) {
          // nop
        }
      });
      setInitialized(true);
    } catch (java.security.DigestException | java.security.NoSuchAlgorithmException e) {
      getLogger().error(e);
    }
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
      // TODO: also getProvider
      MessageDigest md = MessageDigest.getInstance(getHashingAlgorithm());
      md.update(Long.toString(entry.getIndex1()).getBytes(StandardCharsets.UTF_8));
      md.update(entry.getHash1().getBytes(StandardCharsets.UTF_8));
      md.update(Long.toString(entry.getIndex2()).getBytes(StandardCharsets.UTF_8));
      md.update(entry.getHash2().getBytes(StandardCharsets.UTF_8));
      if ( entry.getData() != null ) {
        return byte2Hex(entry.getData().hash(md));
      } else {
        return byte2Hex(md.digest());
      }
      `
    },
    {
      name: 'verify',
      javaCode: `
        // verify hash itself
        // and compare hashes of parent indexes.
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
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'foam.nanos.medusa.DaggerLinks',
      javaCode: `
      initialize();
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
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'link',
          type: 'foam.nanos.medusa.DaggerLink'
        }
      ],
      javaCode: `
      try {
      linksIndex_ ^= 1;
      getLogger().debug("updateLinks", linksIndex_, link.getIndex(), link.getHash());
      getLinks()[linksIndex_] = link;
      } catch (Throwable t) {
        getLogger().error(t);
      }
      `
    },
    {
      name: 'setGlobalIndex',
      synchronized: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'index',
          type: 'Long'
        }
      ],
      type: 'Long',
      javaCode: `
      initialize();
      if ( index > globalIndex_.get() ) {
        return globalIndex_.getAndSet(index);
      }
      return globalIndex_.get();
      `
    },
    {
      name: 'getGlobalIndex',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
      ],
      type: 'Long',
      javaCode: `
      return globalIndex_.get();
      `
    },
    {
      name: 'getNextGlobalIndex',
      synchronized: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'Long',
      javaCode: `
      synchronized ( globalIndex_ ) {
        return globalIndex_.incrementAndGet();
      }
      `
    }
  ]
});
