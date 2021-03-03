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
    AgentAuthService client side decorator use to assign business to users and 
    direct them to the default page.
  `,
  imports: [
    'crunchController',
    'menuDAO',
    'subject',
  ],
  methods: [
    async function actAs(x, business) {
      let result = await this.delegate.actAs(x, business);
      if ( result ) {
        await x.fetchGroup();
        this.subject.user = business;
        this.subject.realUser = result;
        this.menuDAO.cmd_(x, foam.dao.CachingDAO.PURGE);
        this.menuDAO.cmd_(x, foam.dao.AbstractDAO.RESET_CMD);
        this.crunchController.purgeCachedCapabilityDAOs();
        return;
      }
    },
  ],
});
