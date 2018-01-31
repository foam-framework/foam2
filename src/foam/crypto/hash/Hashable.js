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
      javaReturns: 'byte[]',
      args: [
        {
          class: 'String',
          name: 'algorithm',
          javaType: 'String'
        },
        {
          class: 'Array',
          name: 'hash',
          javaType: 'byte[]'
        }
      ]
    }
  ]
});