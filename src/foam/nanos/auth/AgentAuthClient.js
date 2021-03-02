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
  `,

  methods: [
    async function actAs(x, business) {
      let result = await this.delegate.actAs(x, business);
      if ( result ) {
        await x.fetchGroup();
        x.subject.user = business;
        x.crunchController.purgeCachedCapabilityDAOs();
        x.client.menuDAO.cmd_(x, foam.dao.CachingDAO.PURGE);
        x.client.menuDAO.cmd_(x, foam.dao.AbstractDAO.RESET_CMD);
        x.crunchController.purgeCachedCapabilityDAOs();
        x.initLayout.resolve();
        await x.pushDefaultMenu();
        return;
      }
    },
  ],
});
