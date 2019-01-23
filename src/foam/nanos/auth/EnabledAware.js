/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.auth',
  name: 'EnabledAware',

  methods: [
    {
      name: 'getEnabled',
      type: 'Boolean'
    },
    {
      name: 'setEnabled',
      args: [
        {
          name: 'value',
          type: 'Boolean'
        }
      ]
    }
  ]
});

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'EnabledAwareDummy',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Boolean',
      name: 'enabled'
    }
  ]
});