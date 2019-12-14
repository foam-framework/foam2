/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.',
  name: 'SystemAuthorizer',
  implements: [ 'foam.nanos.auth.Authorizer' ],

  javaImports: [
    'foam.core.X',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.User'
  ],

  documentation: `
  Authorizer to be used for authorization on DAOs meant to be accessed by only the following entities: 
    1. System user
    2. Users of the "admin" group
    3. Users of the "system" group 
  `,

  methods: [
    {
      name: 'isSystemUser',
      args: [ 
        { name: 'x', javaType: 'X' }
      ],
      javaCode: `
        User user = (User) x.get("user");
        return ( user != null && ( user.getId() == User.SYSTEM_USER_ID || user.getGroup().equals("admin") || user.getGroup().equals("system") ) );
      `
    },
    {
      name: 'authorizeOnCreate',
      javaCode: `
        if ( ! isSystemUser(x) ){
          throw new AuthorizationException("You do not have permission to create this object");
        }
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode: `
        if ( ! isSystemUser(x) ){
          throw new AuthorizationException("You do not have permission to read this object");
        }
      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode: `
        if ( ! isSystemUser(x) ){
          throw new AuthorizationException("You do not have permission to update this object");
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode: `
        if ( ! isSystemUser(x) ){
          throw new AuthorizationException("You do not have permission to delete this object");
        }
      `
    },
    {
      name: 'checkGlobalRead',
      javaCode: `
        return isSystemUser(x);
      `
    },
    {
      name: 'checkGlobalRemove',
      javaCode: `
        return isSystemUser(x);
      `
    }
  ]
})