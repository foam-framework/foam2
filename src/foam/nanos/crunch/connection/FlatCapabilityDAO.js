/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.connection',
  name: 'FlatCapabilityDAO',
  extends: 'foam.dao.ProxyDAO',
  flags: ['java'],

  javaImports: [
    'foam.nanos.crunch.Capability',
    'foam.core.X',
    'foam.dao.DAO'
  ],

  documentation: `
    Flatten capability prerequesites into one flat capabilities.
  `,

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public ConnectedCapabilityDAO(X x, DAO delegate) {
            setX(x);
            setDelegate(delegate);
          } 
        `);
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        // TODO: add logic to retrieve capabilities in order of precendence

        return getDelegate().put_(x, obj);
      `
    }
  ],
});
