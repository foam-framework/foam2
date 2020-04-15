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
    'foam.dao.DAO',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'java.nio.charset.StandardCharsets',
    'java.security.MessageDigest',
    'java.util.List',
    'java.util.ArrayList',
    'static foam.mlang.MLang.*',
    'foam.dao.ArraySink'
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
      name: 'index',
      label: 'Global Index',
      class: 'Long',
      visibility: 'RO'
    },
    {
      name: 'hashingAlgorithm',
      class: 'String',
      value: 'SHA-256'
    },
    {
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
      name: 'start',
      javaCode: `
      DAO dao = (DAO) getX().get("internalMedusaEntryDAO");

      MedusaEntry entry = new MedusaEntry();
      entry.setIndex(getNextGlobalIndex(getX()));
      entry.setIndex1(-1L);
      entry.setHash1("466c58623cd600209e95a981bad03e5d899ea6d6905cebee5ea0746bf16e1534");
      entry.setIndex2(-1L);
      entry.setHash2("9232622261b1df4dff84067b2df22ecae387162742626326216bf9b4d0d29a3f");
      entry.setHash(hash(getX(), entry));
      entry = (MedusaEntry) dao.put_(getX(), entry);
      updateLinks(getX(), entry);

      entry = new MedusaEntry();
      entry.setIndex(getNextGlobalIndex(getX()));
      entry.setIndex1(-1L);
      entry.setHash1("a651071e965f3c0e07cf9d09761e124a57f27dd75316a4c18079bc0e5accf9d2");
      entry.setIndex2(-1L);
      entry.setHash2("50c1071e836bdd4f2d4b5907bb6090fae6891d6cacdb70dcd72770bfd43dc814");
      entry.setHash(hash(getX(), entry));
      entry = (MedusaEntry) dao.put_(getX(), entry);
      updateLinks(getX(), entry);
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
        DAO dao = (DAO) getX().get("internalMedusaEntryDAO");

        List<MedusaEntry> list1 = (ArrayList) ((ArraySink) dao.where(
          // EQ(MedusaEntry.INDEX, entry.getIndex1())
          EQ(MedusaEntry.INDEX, entry.getIndex1())
          )
          .select(new ArraySink())).getArray();
        List<MedusaEntry> list2 = (ArrayList) ((ArraySink) dao.where(
          EQ(MedusaEntry.INDEX, entry.getIndex2())
          )
          .select(new ArraySink())).getArray();

        if ( list1.size() == 0 ) throw new RuntimeException("Not Found MedusaEntry with index: " + entry.getIndex1());
        if ( list2.size() == 0 ) throw new RuntimeException("Not Found MedusaEntry with index: " + entry.getIndex2());

        MedusaEntry parent1 = list1.get(0);
        MedusaEntry parent2 = list2.get(0);
        if ( ! parent1.getHash().equals(entry.getHash1()) ) throw new RuntimeException("MedusaEntry hash1 do not match parent1 hash");
        if ( ! parent2.getHash().equals(entry.getHash2()) ) throw new RuntimeException("MedusaEntry hash2 do not match parent2 hash");
        //Recalculate hash.
        String calculatedHash = "";
        try {
          MessageDigest md = MessageDigest.getInstance(getHashingAlgorithm());
          md.update(Long.toString(entry.getIndex1()).getBytes(StandardCharsets.UTF_8));
          md.update(entry.getHash1().getBytes(StandardCharsets.UTF_8));
          md.update(Long.toString(entry.getIndex2()).getBytes(StandardCharsets.UTF_8));
          md.update(entry.getHash2().getBytes(StandardCharsets.UTF_8));
          if ( entry.getData() != null ) {
            calculatedHash = byte2Hex(entry.getData().hash(md));
          } else {
            calculatedHash = byte2Hex(md.digest());
          }
        } catch ( java.security.NoSuchAlgorithmException e ) {
          throw new RuntimeException(e);
        }
        if ( ! calculatedHash.equals(entry.getHash()) ) throw new RuntimeException("MedusaHash do not match");
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
      linksIndex_ ^= 1;
      getLogger().debug("updateLinks", linksIndex_, link.getIndex(), link.getHash());
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
