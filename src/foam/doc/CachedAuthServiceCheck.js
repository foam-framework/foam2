/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.doc',
  name: 'CachedAuthServiceCheck',
  extends: 'foam.nanos.auth.ProxyAuthService',
  documentation: `
    The foam.doc.AxiomDAO can cause a lot of auth checks and this AuthService
    decorator can be used to lighten the load of calling check on an
    AuthService.
  `,
  properties: [
    {
      class: 'Map',
      name: 'cachedChecks',
    },
  ],
  methods: [
    function check(x, p) {
      if ( ! this.cachedChecks[p] ) {
        this.cachedChecks[p] = this.delegate.check(x, p);
      }
      return this.cachedChecks[p];
    },
  ],
});
