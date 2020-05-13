/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'CachedAuthServiceProxy',
  extends: 'foam.nanos.auth.ProxyAuthService',
  documentation: `
    An auth service decorator that caches permission checks. The cache gets
    invalidated whenever the imported user's group changes.
  `,
  imports: [
    'capabilityDAO',
    'user',
    'userCapabilityJunctionDAO'
  ],
  properties: [
    {
      class: 'Map',
      name: 'cache'
    },
  ],
  methods: [
    function init() {
      this.onDetach(this.user$.dot('group').sub(function() {
        this.cache = {};
      }.bind(this)));
      this.onDetach(this.userCapabilityJunctionDAO.on.sub(
        (sub, _on, event, ucj) => {
          if ( event !== 'put' && event !== 'remove' ) return;
          this.capabilityDAO.find(ucj.targetId).then(cap => {
            var permissions = [
              ...cap.permissionsGranted,
              ...cap.permissionsIntercepted,
            ];
            permissions.forEach(p => { delete this.cache[p] });
          });
        }
      ));
    },
    function check(x, p) {
      if ( ! this.cache[p] ) this.cache[p] = this.delegate.check(x, p);
      return this.cache[p];
    },
  ],
});
