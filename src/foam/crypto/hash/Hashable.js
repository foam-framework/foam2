/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.crypto.hash',
  name: 'Hashable',

  documentation: 'Hashable interface',

  methods: [
    {
      name: 'hash',
      javaReturns: 'String',
      args: [
        {
          class: 'String',
          name: 'algorithm',
          javaType: 'String'
        },
        {
          class: 'String',
          name: 'provider',
          javaType: 'String'
        }
      ]
    }
  ]
});