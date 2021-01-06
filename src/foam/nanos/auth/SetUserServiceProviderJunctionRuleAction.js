/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'SetUserServiceProviderJunctionRuleAction',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `
    On create of User-ServiceProvider junction, find old User-ServiceProvider junctions,
    remove the old junctions and its prerequisites, and set up the new serviceprovider
    junctions, then update the spid reference on the user to the new serviceprovider.
  `,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.Capability',
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

            Capability target = ucj.findTargetId(x);
            if ( ! ( target instanceof ServiceProvider ) ) return;

            AuthService auth = (AuthService) x.get("auth");

            // check that the user is authorized to perform this Service Provider update
            User admin = ((Subject) x.get("subject")).getUser();
            if ( 
              admin == null || ( 
              admin.getId() != foam.nanos.auth.User.SYSTEM_USER_ID && 
              ! admin.getGroup().equals("admin") && 
              ! admin.getGroup().equals("system") && 
              ! auth.check(x, "*") )
            )
              throw new RuntimeException("You are not authorized to perform this update");

            // get the
            User user = (User) ucj.findSourceId(x);
            ServiceProvider serviceProvider = (ServiceProvider) target;

            // if is create, check if any old user-serviceprovider junctions exist, and remove it and its grant path   
            serviceProvider.removeSpid(x, user);

            // get grantpath and create/reput grantpath
            serviceProvider.setupSpid(x, user);

            // finally set user spid to new spid
            DAO userDAO = (DAO) x.get("bareUserDAO");
            user.setSpid(serviceProvider.getId());
            userDAO.put(user);
          }
        }, "Re-assign user spid on update of User-ServiceProvider junction where ServiceProvider changed");
      `
    }
  ]
});