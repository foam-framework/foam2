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
    'foam.nanos.auth.Group',
    'javax.security.auth.AuthPermission'
  ],

  methods: [
    {
      name: 'check',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        boolean isAdmin = user != null
          && ( user.getId() == foam.nanos.auth.User.SYSTEM_USER_ID
          || "admin".equals(user.getGroup())
          || "system".equals(user.getGroup()));
        return isAdmin || getDelegate().check(x, permission);
      `
    }
  ]
});
