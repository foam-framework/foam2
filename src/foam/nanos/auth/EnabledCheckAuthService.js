/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'EnabledCheckAuthService',
  extends: 'foam.nanos.auth.ProxyAuthService',
  flags: ['java'],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.session.Session'
  ],

  methods: [
    {
      name: 'check',
      javaCode: `
        if ( x == null || permission == null ) return false;

        // Check if session exists and there's a user id set for it.
        Session session = x.get(Session.class);
        if ( session == null || session.getUserId() == 0 ) return false;

        // Check if user exists and is enabled.
        User user = (User) x.get("user");
        if ( user == null || ! user.getEnabled() ) return false;

        // Check if agent exists and is enabled. Note that it isn't mandatory
        // that an agent always be there, so it's fine if the agent is null.
        // However, if the agent _is_ there, then it needs to be enabled.
        User agent = (User) x.get("agent");
        if ( agent != null && ! agent.getEnabled() ) return false;

        // Check if group and all ancestor groups are enabled.
        Group group = getCurrentGroup(x);
        DAO localGroupDAO = ((DAO) x.get("localGroupDAO")).inX(x);
        while ( group != null ) {
          if ( ! group.getEnabled() ) return false;
          group = (Group) localGroupDAO.find(group.getParent());
        }

        return super.check(x, permission);
      `
    }
  ]
});
