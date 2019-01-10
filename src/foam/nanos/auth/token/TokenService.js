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
      async: true,
      type: 'Boolean',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User'
        }
      ]
    },
    {
      name: 'generateTokenWithParameters',
      async: true,
      type: 'Boolean',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User'
        },
        {
          name: 'parameters',
          type: 'Map',
          // TODO: Can we encode this in type directly?
          javaType: 'java.util.Map<String, Object>',
          swiftType: '[String:Any]'
        }
      ]
    },
    {
      name: 'processToken',
      async: true,
      type: 'Boolean',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User'
        },
        {
          name: 'token',
          type: 'String'
        }
      ]
    }
  ]
});
