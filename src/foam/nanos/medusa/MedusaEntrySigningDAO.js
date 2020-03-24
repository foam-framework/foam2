/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaEntrySigningDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Sign entry`,

  javaImports: [
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'java.nio.charset.StandardCharsets',
    'java.security.MessageDigest'
  ],

  properties: [
    {
      name: 'enableSigning',
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

  methods: [
    {
      name: 'put_',
      javaCode: `
      MedusaEntry entry = (MedusaEntry) obj;
      // if ( getEnableSigning() ) {
      //   try {
      //     MessageDigest md = MessageDigest.getInstance(getSigningAlgorithm());
      //     entry.setSignature(signature);
      //   } catch ( Exception e ) {
      //     getLogger().error(e);
      //     // TODO: Alarm
      //     // Who will catch this.
      //     throw new RuntimeException(e);
      //   }
      // }
      getLogger().debug("put", entry);
      return getDelegate().put_(x, entry);
      `
    }
  ]
});
