/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'CheckDependenciesOnGrantedCapabilityPut',

  documentation: 'Rule to update any capabilities depending on current capability as prerequisite if the current capability is set to GRANTED',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.*',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.crunch.CapabilityCapabilityJunction',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
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
          DAO prerequisiteCapabilityJunctionDAO = (DAO) x.get("prerequisiteCapabilityJunctionDAO");
          DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");

          String capId = (String) ((UserCapabilityJunction) obj).getTargetId();
          Long userId = ((UserCapabilityJunction) obj).getSourceId();

          userCapabilityJunctionDAO.where(
            AND(
              EQ(UserCapabilityJunction.SOURCE_ID, userId),
              EQ(UserCapabilityJunction.STATUS, CapabilityJunctionStatus.PENDING),
              NEQ(UserCapabilityJunction.TARGET_ID, capId)
            )
          ).select(new AbstractSink() {
            @Override
            public void put(Object obj, Detachable sub) {
              CapabilityCapabilityJunction j = (CapabilityCapabilityJunction) prerequisiteCapabilityJunctionDAO.find(
                AND(
                  EQ(CapabilityCapabilityJunction.SOURCE_ID, capId),
                  EQ(CapabilityCapabilityJunction.TARGET_ID, (String) ((UserCapabilityJunction) obj).getTargetId())
                )
              );
              if ( j != null ) userCapabilityJunctionDAO.put(((UserCapabilityJunction) obj).fclone());
            }
          });
        }
      });
      `
    }
  ]
});