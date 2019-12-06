/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.auth',
  name: 'LifecycleAware',

  methods: [
    {
      name: 'getLifecycleState',
      type: 'foam.nanos.auth.LifecycleState',
    },
    {
      name: 'setLifecycleState',
      args: [
        {
          name: 'value',
          type: 'foam.nanos.auth.LifecycleState',
        }
      ]
    }
  ]
});
