/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'CascadeInvalidate',

  documentation: `When a ucj falls out of GRANTED status, also invalidate any ucjs
    that depend on the first one.
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
            CapabilityJunctionStatus invalidatedStatus = ucj.getStatus();
            
            DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
            DAO filteredUserCapabilityJunctionDAO = (DAO) userCapabilityJunctionDAO.where((EQ(UserCapabilityJunction.SOURCE_ID, ucj.getSourceId())));
            DAO filteredPrerequisiteCapabilityJunctionDAO = (DAO) ((DAO) x.get("prerequisiteCapabilityJunctionDAO"))
              .where(EQ(CapabilityCapabilityJunction.TARGET_ID, ucj.getTargetId()));
            
            AbstractPredicate predicate = new AbstractPredicate(x) {
              @Override
              public boolean f(Object obj) {
                UserCapabilityJunction ucjToCheck = (UserCapabilityJunction) obj;
                CapabilityCapabilityJunctionId id = new CapabilityCapabilityJunctionId.Builder(x)
                  .setSourceId(ucjToCheck.getTargetId())
                  .setTargetId(ucj.getTargetId())
                  .build();
                CapabilityCapabilityJunction prereqJunction = null;
                try {
                  prereqJunction = (CapabilityCapabilityJunction) filteredPrerequisiteCapabilityJunctionDAO.find(id);
                } catch (Exception e) {
                  return false;
                }
                return prereqJunction != null;
              }
            };

            List<UserCapabilityJunction> ucjsToInvalidate = (List<UserCapabilityJunction>) ((ArraySink) filteredUserCapabilityJunctionDAO
              .where(predicate)
              .select(new ArraySink()))
              .getArray();
              
            for ( UserCapabilityJunction invalidatedUcj : ucjsToInvalidate ) {
              invalidatedUcj.setStatus(invalidatedStatus);
              userCapabilityJunctionDAO.put(invalidatedUcj);
            }
          }
        }, "Remove dependencies on prerequisite ucj removal");
      `
    }
  ]
});