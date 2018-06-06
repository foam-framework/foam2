/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.crypto.hash',
  name: 'Hasher',

  documentation: 'Hasher interface',

  methods: [
    {
      name: 'updateDigest',
      args: [
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        },
        {
          name: 'md',
          javaType: 'java.security.MessageDigest'
        }
      ]
    }
  ]
});
