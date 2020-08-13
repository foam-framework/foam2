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
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.UserCapabilityJunction'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            UserCapabilityJunction ucj = (UserCapabilityJunction) obj;

            Subject subject = (Subject) x.get("subject");
            User user = subject.getUser();
            User realUser = subject.getRealUser();

            boolean isOwner = ucj.getSourceId() == user.getId() || ucj.getSourceId() == realUser.getId();
            if ( isOwner ) return;

            boolean isAdmin = user.getId() == foam.nanos.auth.User.SYSTEM_USER_ID || user.getGroup().equals("admin") || user.getGroup().equals("system");
            if ( isAdmin ) return;

            throw new AuthorizationException("Cannot add UserCapabilityJunction. Not an admin or owner.");
          }
        }, "");
      `
    }
  ]
});
