/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.auth',
  name: 'DeletedAware',

  methods: [
    {
      name: 'getDeleted',
      type: 'Boolean',
    },
    {
      name: 'setDeleted',
      args: [
        {
          name: 'value',
          type: 'Boolean',
        }
      ]
    }
  ]
});

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'DeletedAwareDummy',

  implements: [
    'foam.nanos.auth.DeletedAware'
  ],

  documentation: 'Dummy class for testing DeletedAware',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Boolean',
      name: 'deleted',
      writePermissionRequired: true
    }
  ]
});
