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
      returns: 'ByteArray',
      javaThrows: [
        'java.security.NoSuchAlgorithmException',
      ],
      args: [
        {
          name: 'algorithm',
          type: 'String',
          documentation: 'Hashing algorithm to use'
        },
        {
          name: 'hash',
          type: 'ByteArray',
          documentation: 'Previous hash (used for chaining)'
        }
      ]
    }
  ]
});
