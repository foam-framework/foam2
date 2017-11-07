/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.register',
  name: 'RegistrationService',

  methods: [
    {
      name: 'register',
      returns: 'Promise',
      javaReturns: 'foam.nanos.auth.User',
      swiftReturns: 'User?',
      args: [
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User',
          swiftType: 'User'
        }
      ]
    }
  ]
});
