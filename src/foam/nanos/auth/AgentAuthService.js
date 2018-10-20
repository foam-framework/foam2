/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.auth',
  name: 'AgentAuthService',

  documentation: `
    The agent auth service is responsible for allowing users to act as
    others if permitted and places the requesting user as an agent of the system within the context.
    A junction between users are created to determine if a user is permitted to act as another user.
    Along with the target & source Id on the junction object (UserUserJunction), a group is
    appended and is used to determine the list of permissions for the current user agent
    access to the system. When acting as another user, the user requesting to act is an "agent"
    within the context. The user being acted as becomes the "user" within the context, and
    the group associated to the junction object is associated to the "user" within the context.
  `,


  methods: [
    {
      name: 'actAs',
      javaReturns: 'foam.nanos.auth.User',
      swiftReturns: 'foam_nanos_auth_User',
      javaThrows: [
        'foam.nanos.auth.AuthorizationException',
        'foam.nanos.auth.AuthenticationException'
      ],
      swiftThrows: true,
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X',
          swiftType: 'Context'
        },
        {
          name: 'entity',
          javaType: 'foam.nanos.auth.User'
        }
      ]
    },
    {
      name: 'getCurrentAgent',
      javaReturns: 'foam.nanos.auth.User',
      swiftReturns: 'foam_nanos_auth_User?',
      javaThrows: [
        'foam.nanos.auth.AuthorizationException',
        'foam.nanos.auth.AuthenticationException'
      ],
      swiftThrows: true,
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X',
          swiftType: 'Context'
        }
      ]
    }
  ]
});
