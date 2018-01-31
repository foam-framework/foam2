/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.crypto.sign',
  name: 'Signer',

  documentation: 'Signer interface',

  methods: [
    {
      name: 'sign',
      args: [
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        },
        {
          name: 'sig',
          javaType: 'java.security.Signature'
        }
      ]
    }
  ]
});
