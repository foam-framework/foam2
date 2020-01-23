/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'RemoveJunctionsOnUserRemoval',

  documentation: 'Rule to remove any user-capability relationships when a user is removed',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.auth.User',
    'static foam.mlang.MLang.*',
    'foam.nanos.auth.LifecycleAware',
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          if ( ((LifecycleAware) obj).getLifecycleState() == foam.nanos.auth.LifecycleState.DELETED ) {
            DAO dao = (DAO) x.get("userCapabilityJunctionDAO");
            dao.where(EQ(UserCapabilityJunction.SOURCE_ID, ((User) obj).getId())).removeAll();
          }
        }
      }, "Remove Junctions On User Removal");
      `
    }
  ]
});
