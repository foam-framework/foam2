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
        foam.nanos.auth.User user = (foam.nanos.auth.User) x.get("user");
        return ( user != null && user.getId() == 1 ) || getDelegate().check(x, permission);
      `
    }
  ]
});
