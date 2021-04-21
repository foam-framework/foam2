/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.auth',
  name: 'AssignableAware',

  methods: [
    {
      name: 'getAssignedTo',
      type: 'long'
    },
    {
      name: 'setAssignedTo',
      args: [
        {
          name: 'user',
          type: 'long'
        }
      ]
    }
  ]
});
