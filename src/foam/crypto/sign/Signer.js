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
      name: 'includeInSignature',
      type: 'Boolean',
      documentation: 'Flag to determine if we should include this property as part of the signature'
    },
    {
      name: 'updateSignature',
      type: 'Void',
      javaThrows: [
        'java.security.SignatureException'
      ],
      args: [
        {
          name: 'obj',
          type: 'FObject'
        },
        {
          name: 'sig',
          javaType: 'java.security.Signature'
        }
      ]
    }
  ]
});
