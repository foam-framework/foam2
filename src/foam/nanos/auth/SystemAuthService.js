/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'SystemAuthService',
  extends: 'foam.nanos.auth.ProxyAuthService',

  javaImports: [
    'javax.security.auth.AuthPermission'
  ],

  methods: [
    {
      name: 'check',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        return user != null && ((Group) x.get("group")).implies(x, new AuthPermission("*")) || getDelegate().check(x, permission);
      `
    }
  ]
});
