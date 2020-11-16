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
      class: 'FObjectProperty',
      of: 'foam.core.Exception',
      name: 'exception'
    }
  ],

  methods: [
    {
      name: 'toString',
      type: 'String',
      javaCode: 'return getId() + ": "+getMessage();',
      code: function() {
        return this.id + ': ' + this.message;
      }
    }
  ]
});
