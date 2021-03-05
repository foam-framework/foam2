/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'AgentAuthClient',
  extends: 'foam.nanos.auth.ProxyAuthService',

  documentation: `
    AgentAuthService client side decorator. When user call agentAuth.actAs(), it assign 
    the business to users, and then purge caches.
  `,

  imports: [
    'crunchController',
    'ctrl',
    'menuDAO',
    'subject',
  ],

  methods: [
    async function actAs(x, user) {
      let result = await this.delegate.actAs(x, user);
      if ( result ) {
        await this.ctrl.fetchSubject();
        await this.ctrl.fetchGroup();
        this.menuDAO.cmd_(x, foam.dao.CachingDAO.PURGE);
        this.menuDAO.cmd_(x, foam.dao.AbstractDAO.RESET_CMD);
        this.crunchController.purgeCachedCapabilityDAOs();
        return result;
      }
    },
  ],
});
