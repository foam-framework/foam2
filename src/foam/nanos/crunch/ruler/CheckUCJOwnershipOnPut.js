/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ruler',
  name: 'CheckUCJOwnershipOnPut',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.AgentCapabilityJunction',
    'foam.nanos.crunch.UserCapabilityJunction'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
        UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
        UserCapabilityJunction old = (UserCapabilityJunction) userCapabilityJunctionDAO.find(ucj.getId());
        boolean isUpdating = old != null;

        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            AuthService auth = (AuthService) x.get("auth");
            Subject subject = (Subject) x.get("subject");
            User user = subject.getUser();
            User realUser = subject.getRealUser();
            
            if (
              isUpdating && auth.check(x, "usercapabilityjunction.update.*") ||
              ! isUpdating && auth.check(x, "usercapabilityjunction.create.*")
            ) return;

            boolean isOwner = ucj.getSourceId() == user.getId() || ucj.getSourceId() == realUser.getId();
            if ( isOwner ) return;

            if ( ucj instanceof AgentCapabilityJunction &&
                 ((AgentCapabilityJunction) ucj).getEffectiveUser() == user.getId() ) {
              return;
            }
            foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) x.get("logger");
            logger.error(this.getClass().getSimpleName(), "Cannot add UserCapabilityJunction. Not an admin or owner. - subject", subject);
            logger.error(this.getClass().getSimpleName(), "Cannot add UserCapabilityJunction. Not an admin or owner. - user", user);
            logger.error(this.getClass().getSimpleName(), "Cannot add UserCapabilityJunction. Not an admin or owner. - realUser", realUser);
            logger.error(this.getClass().getSimpleName(), "Cannot add UserCapabilityJunction. Not an admin or owner. - ucj", ucj);
            throw new AuthorizationException("Cannot add UserCapabilityJunction. Not an admin or owner.");
          }
        }, "");
      `
    }
  ]
});
