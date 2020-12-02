/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'SystemAuthService',
  extends: 'foam.nanos.auth.ProxyAuthService',
  methods: [
    {
      name: 'check',
      javaCode: `
        foam.nanos.auth.User user = ((foam.nanos.auth.Subject) x.get("subject")).getUser();
        return user != null && ( user.getId() == foam.nanos.auth.User.SYSTEM_USER_ID || user.getGroup().equals("admin") || user.getGroup().equals("system") ) || getDelegate().check(x, permission);
      `
    }
  ]
});
