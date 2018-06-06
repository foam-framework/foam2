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
      returns: 'Boolean',
      javaReturns: 'boolean',
      swiftReturns: 'Bool'
    },
    {
      name: 'setEnabled',
      args: [
        {
          class: 'Boolean',
          name: 'value',
          javaType: 'boolean',
          swiftType: 'Bool'
        }
      ]
    }
  ]
});
