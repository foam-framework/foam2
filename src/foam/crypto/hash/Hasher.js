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
      name: 'includeInDigest',
      type: 'Boolean',
      documentation: 'Flag to determine if we should include this property as part of the message digest'
    },
    {
      name: 'updateDigest',
      args: [
        {
          name: 'obj',
          type: 'foam.core.FObject'
        },
        {
          name: 'md',
          javaType: 'java.security.MessageDigest'
        }
      ]
    }
  ]
});
