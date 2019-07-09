/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'CapabilityDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.nanos.auth.*',
  ],

  documentation: `
  only admin users have write access to capabilityDAO, non-admin users have read access depending on their permissions
  `,

  methods: [
    {
      name: 'checkPermission',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      documentation: `checks if a user is amin`,
      javaCode: `
      User user = (User) x.get("user");
      if( user == null ) throw new AuthorizationException();
      AuthService auth = (AuthService) x.get("auth");
      boolean hasPermission = auth.check(x, "service.*");
      if( ! hasPermission ) throw new AuthorizationException();
      `
    },
    {
      name: 'put_', 
      javaCode: `
      checkPermission(x);
      return getDelegate().put_(x, obj);
      `
    },
    {
      name: 'remove_',
      javaCode: `
      checkPermission(x);
      return super.remove_(x, obj);
      `
    },
    {
      name: 'removeAll_',
      javaCode: `
      checkPermission(x);
      getDelegate().removeAll_(x, skip, limit, order, predicate);
      `
    },
    {
      name: 'select_',
      javaCode: `
      return getDelegate().select_(x, sink, skip, limit, order, predicate);
      `
    },
    {
      name: 'find_',
      javaCode:`
      return super.find_(x, id);
      `
    },
  ]
});
    