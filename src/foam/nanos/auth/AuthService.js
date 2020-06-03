/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.auth',
  name: 'AuthService',

  documentation: `
    An AuthService is a service that handles authentication (who are you?) as
    well as authorization (do you have the right to access this?). The methods
    relating to authentication are:

      * getCurrentUser
      * getCurrentGroup
      * login
      * logout
      * validatePassword
      * updatePassword
      * validateUser

    and the methods relating to authorization are:

      * check
      * checkUser
  `,

  methods: [
    // TODO: Decide if we want to keep this method and if we do, document it.
    {
      name: 'getCurrentSubject',
      async: true,
      type: 'foam.nanos.auth.Subject',
      javaThrows: ['foam.nanos.auth.AuthenticationException'],
      swiftThrows: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ]
    },
    {
      name: 'getCurrentGroup',
      documentation: `
        Returns the effective group from the given context. You might have
        situations where the user's group isn't the "effective" group (the one
        being used for permissions checks), in which case it needs to be pulled
        from somewhere else. This method should always return the effective
        group and is more appropriate to call than checking the user's group
        directly in almost all cases.
      `,
      async: true,
      type: 'foam.nanos.auth.Group',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ]
    },
    {
      name: 'login',
      documentation: `
        Log the user in using their identifier (email or username) and password to
        authenticate them.
      `,
      async: true,
      type: 'foam.nanos.auth.User',
      javaThrows: ['foam.nanos.auth.AuthenticationException'],
      swiftThrows: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'identifier',
          type: 'String'
        },
        {
          name: 'password',
          type: 'String'
        }
      ]
    },
    // TODO: This should be removed. We have more appropriate places to perform
    // validation checks now. See the 'Validatable' interface and ValidatingDAO.
    {
      name: 'validatePassword',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
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
          name: 'potentialPassword',
          type: 'String',
        }
      ]
    },
    // NOTE: Could we combine `checkUser` and `check` into an overloaded method
    // where one simply calls the other with the user from the context as a
    // parameter? Something like:
    //
    //   Boolean check(X x, String permission) {
    //     User user = (User) ((Subject)x.get("subject")).getUser(); // Or use `getCurrentUser`
    //     return check(x, user, permission);
    //   }
    //
    //   Boolean check(X x, User user, String permission) {
    //     // Logic...
    //   }
    //
    // That seems a bit strange for an interface though. Might work better as
    // part of a base AbstractAuthService.
    {
      name: 'checkUser',
      documentation: `
        Like the 'check' method, but allows you to provide the user to check as
        an argument instead of depending on the right user to be in the context.
      `,
      type: 'Boolean',
      async: true,
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
          name: 'permission',
          type: 'String'
        }
      ]
    },
    {
      name: 'check',
      documentation: `
        Check if a user in the given context has the given permission.
      `,
      async: true,
      type: 'Boolean',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'permission',
          type: 'String',
        }
      ]
    },
    {
      name: 'updatePassword',
      documentation: `Updates a user's password.`,
      async: true,
      type: 'foam.nanos.auth.User',
      javaThrows: ['foam.nanos.auth.AuthenticationException'],
      swiftThrows: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'oldPassword',
          type: 'String'
        },
        {
          name: 'newPassword',
          type: 'String'
        }
      ]
    },
    // TODO: This should be removed. We have more appropriate places to perform
    // validation checks now. See the 'Validatable' interface and ValidatingDAO.
    {
      name: 'validateUser',
      async: true,
      type: 'Void',
      javaThrows: ['foam.nanos.auth.AuthenticationException'],
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
      name: 'logout',
      documentation: 'Logs the user out.',
      async: true,
      type: 'Void',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ]
    }
  ]
});
