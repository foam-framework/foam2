/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.auth',
  name: 'ServiceProviderAware',

  constants: [
    {
      name: 'GLOBAL_SPID',
      value: '*',
      type: 'String'
    }
  ],

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      name: 'spid'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.methods.push(`
          default boolean isGlobalSpid() {
            return GLOBAL_SPID.equals(getSpid());
          }
        `);
      }
    }
  ]
});
