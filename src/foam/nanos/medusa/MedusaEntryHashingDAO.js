/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaEntryHashingDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Calculate ledger hash for entry`,

  javaImports: [
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'java.nio.charset.StandardCharsets',
    'java.security.MessageDigest'
  ],

  properties: [
    {
      name: 'enableHashing',
      class: 'Boolean'
    },
    {
      // TODO: acquire from service
      name: 'hashingAlgorithm',
      class: 'String',
      value: 'SHA-256'
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      javaFactory: `
        Logger logger = (Logger) getX().get("logger");
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, logger);
      `
    }
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

  methods: [
    {
      name: 'put_',
      javaCode: `
      MedusaEntry entry = (MedusaEntry) obj;
      if ( getEnableHashing() ) {
        try {
          MessageDigest md = MessageDigest.getInstance(getHashingAlgorithm());
          md.update(entry.getHash1().getBytes(StandardCharsets.UTF_8));
          md.update(entry.getHash2().getBytes(StandardCharsets.UTF_8));
          String myHash = byte2Hex(entry.getNu().hash(md));
          entry.setHash(myHash);

          //internal hash.
          md = MessageDigest.getInstance(getHashingAlgorithm());
          String internalHash = byte2Hex(entry.hash(md));
          entry.setInternalHash(internalHash);
        } catch ( Exception e ) {
          getLogger().error(e);
          // TODO: Alarm
          // Who will catch this.
          throw new RuntimeException(e);
        }
      }
      getLogger().debug("put", entry);
      return getDelegate().put_(x, entry);
      `
    }
  ]
});
