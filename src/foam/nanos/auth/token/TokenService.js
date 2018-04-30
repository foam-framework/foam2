/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.auth.token',
  name: 'TokenService',

  documentation: 'System that allows the generation of tokens as well as processing of said generated tokens',

  methods: [
    {
      name: 'generateToken',
      returns: 'Promise',
      javaReturns: 'boolean',
      swiftReturns: 'Bool',
      swiftThrows: true,
      args: [
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User',
          swiftType: 'User'
        }
      ]
    },
    {
      name: 'generateTokenWithParameters',
      returns: 'Promise',
      javaReturns: 'boolean',
      swiftReturns: 'Bool',
      swiftThrows: true,
      args: [
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User',
          swiftType: 'User'
        },
        {
          name: 'parameters',
          javaType: 'java.util.Map<String, Object>',
          swiftType: '[String:Any]'
        }
      ]
    },
    {
      name: 'processToken',
      returns: 'Promise',
      javaReturns: 'boolean',
      swiftReturns: 'Bool',
      swiftThrows: true,
      args: [
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User',
          swiftType: 'User'
        },
        {
          name: 'token',
          javaType: 'String',
          swiftType: 'String'
        }
      ]
    }
  ]
});
