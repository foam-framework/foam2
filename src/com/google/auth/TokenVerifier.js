/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'com.google.auth',
  name: 'TokenVerifier',

  methods: [
    {
      name: 'verify',
      type: 'String',
      javaThrows: [ 'java.security.GeneralSecurityException' ],
      args: [
        {
          name: 'token',
          type: 'String'
        }
      ]
    }
  ]
});
