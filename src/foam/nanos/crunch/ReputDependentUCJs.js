/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'ReputDependentUCJs',

  documentation: `When a ucj goes into a certain status, try to reput its dependents
  `,

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.predicate.AbstractPredicate',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Subject',
    'java.util.ArrayList',
    'java.util.List',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
            CapabilityJunctionStatus ucjStatus = ucj.getStatus();
            
            DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
            DAO filteredUserCapabilityJunctionDAO = (DAO) userCapabilityJunctionDAO.where((EQ(UserCapabilityJunction.SOURCE_ID, ucj.getSourceId())));
            DAO filteredPrerequisiteCapabilityJunctionDAO = (DAO) ((DAO) x.get("prerequisiteCapabilityJunctionDAO"))
              .where(EQ(CapabilityCapabilityJunction.TARGET_ID, ucj.getTargetId()));
            
            List<CapabilityCapabilityJunction> ccjs = ((ArraySink) filteredPrerequisiteCapabilityJunctionDAO
              .select(new ArraySink()))
              .getArray();

            List<UserCapabilityJunction> ucjsToReput = new ArrayList<UserCapabilityJunction>();

            for ( CapabilityCapabilityJunction ccj : ccjs ) {
              UserCapabilityJunction ucjToReput = (UserCapabilityJunction) filteredUserCapabilityJunctionDAO
                .find(EQ(UserCapabilityJunction.TARGET_ID, ccj.getSourceId()));
              if ( ucjToReput != null ) ucjsToReput.add(ucjToReput);
            }

            for ( UserCapabilityJunction ucjToReput : ucjsToReput ) {
              userCapabilityJunctionDAO.inX(x).put(ucjToReput);
            }
          }
        }, "Reput the UCJs of dependent capabilities");
      `
    }
  ]
});