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
        Group group = (Group) x.get("group");
        return user != null && group != null && group.implies(x, new AuthPermission("*")) || getDelegate().check(x, permission);
      `
    }
  ]
});
