/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box',
  name: 'RemoteException',
  implements: ['foam.core.Exception'],
  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'message'
    },
    {
      class: 'Object',
      name: 'serverObject'
    }
  ],

  methods: [
    {
      name: 'toString',
      type: 'String',
      javaCode: 'return getMessage();',
      code: function() {
        return this.message;
      }
    }
  ]
});

// TODO: Once modelled exceptions are merged this can be removed in
//       favour of an exception modelled in foam.nanos.cron
foam.CLASS({
  package: 'foam.box',
  name: 'CapabilityRequiredRemoteException',
  implements: ['foam.core.Exception'],
  properties: [
    {
      class: 'String',
      name: 'id',
      value: 'foam.box.CapabilityRequiredRemoteException'
    },
    {
      class: 'StringArray',
      name: 'capabilityOptions',
      documentation: `
        List of capabilities which can be used to satisfy the permission that
        caused this error. A capability will only intercept a permission if
        itself and all of its implied capabilities or permissions can grant the
        requested action.
      `
    }
  ]
});
