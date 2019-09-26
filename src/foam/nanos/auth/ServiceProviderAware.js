/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.auth',
  name: 'ServiceProviderAware',

  methods: [
    {
      name: 'getSpid',
      type: 'String'
    },
    {
      name: 'setSpid',
      args: [
        {
          name: 'value',
          type: 'String'
        }
      ]
    }
  ]
});
