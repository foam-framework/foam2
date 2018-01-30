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
      name: 'hash',
      javaThrows: [
        'java.io.IOException',
        'java.security.NoSuchProviderException',
        'java.security.NoSuchAlgorithmException'
      ],
      args: [
        {
          name: 'in',
          javaType: 'java.io.InputStream'
        },
        {
          name: 'out',
          javaType: 'java.io.OutputStream'
        }
      ]
    }
  ]
});

foam.CLASS({
  package: 'foam.crypto.hash',
  name: 'AbstractHasher',
  abstract: true,
  implements: [
    'foam.crypto.hash.Hasher'
  ],

  documentation: 'Abstract Hasher implementation',

  javaImports: [
    'foam.util.SafetyUtil',
    'java.security.MessageDigest'
  ],

  constants: [
    {
      name: 'BUFFER_SIZE',
      value: 4096,
      type: 'int'
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'algorithm'
    },
    {
      class: 'String',
      name: 'provider'
    }
  ],

  methods: [
    {
      name: 'hash',
      javaCode:
`int read = 0;
byte[] buff = new byte[BUFFER_SIZE];
MessageDigest md = ( ! SafetyUtil.isEmpty(getProvider()) ) ?
    MessageDigest.getInstance(getAlgorithm(), getProvider()) :
    MessageDigest.getInstance(getAlgorithm());

while ( (read = in.read(buff, 0, BUFFER_SIZE)) != -1 ) {
  md.update(buff, 0, read);
}
out.write(md.digest(), 0, md.getDigestLength());`
    }
  ]
});

foam.CLASS({
  package: 'foam.crypto.hash',
  name: 'MD5Hasher',
  extends: 'foam.crypto.hash.AbstractHasher',
  documentation: 'MD5 Hasher',
  properties: [
    ['algorithm', 'MD5']
  ]
});

foam.CLASS({
  package: 'foam.crypto.hash',
  name: 'SHA1Hasher',
  extends: 'foam.crypto.hash.AbstractHasher',
  documentation: 'SHA-1 Hasher',
  properties: [
    ['algorithm', 'SHA-1']
  ]
});

foam.CLASS({
  package: 'foam.crypto.hash',
  name: 'SHA256Hasher',
  extends: 'foam.crypto.hash.AbstractHasher',
  documentation: 'SHA-256 Hasher',
  properties: [
    ['algorithm', 'SHA-256']
  ]
});
