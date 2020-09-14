/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.lite',
  name: 'CapableCreateApprovalsRuleAction',

  documentation: `
    TODO:
  `,

  javaImports: [
    'foam.core.ContextAwareAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.approval.Approvable',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalStatus',
    'foam.nanos.ruler.Operations',
    'foam.nanos.auth.Subject',
    'java.util.Map',
    'java.util.ArrayList',
    'java.util.List',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.lite.Capable',
    'foam.nanos.crunch.lite.CapablePayload'
  ],

  implements: ['foam.nanos.ruler.RuleAction'],

  properties: [
    { 
      name: 'capabilitiesToApprove',
      class: 'List',
      of: 'String',
      javaType: 'java.util.List<String>',
      factory: function() {
        return [];
      },
      javaFactory: 'return new java.util.ArrayList();'
    },
    {
      class: 'String',
      name: 'daoToReput',
      required: true
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();

        List<String> capabilitiesToApprove = getCapabilitiesToApprove();

        Capable capableObj = (Capable) obj;

        agency.submit(x, new ContextAwareAgent() {
          
          @Override
          public void execute(X x) {
            for ( CapablePayload capablePayload : capableObj.getCapablePayloads() ){

              Capability capability = capablePayload.getCapability();

              if ( ! getCapabilitiesToApprove().contains(capability.getId()) ){
                capablePayload.setStatus(foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
                continue;
              }

              DAO approvalRequestDAO = (DAO) getX().get("approvalRequestDAO");
              DAO approvableDAO = (DAO) getX().get("approvableDAO");

              Operations operation = Operations.CREATE;

              String hashedId = new StringBuilder("d")
                .append(capablePayload.getDaoKey())
                .append(":o")
                .append(String.valueOf(capablePayload.getObjId()))
                .append(":c")
                .append(capability.getId())
                .toString();

              try {
                FObject objectToDiffAgainst = (FObject) obj.getClassInfo().newInstance();
              
                Map propertiesToApprove = objectToDiffAgainst.diff(obj);

                Approvable approvable = (Approvable) approvableDAO.put_(getX(), new Approvable.Builder(getX())
                  .setLookupId(hashedId)
                  .setDaoKey(capablePayload.getDaoKey())
                  .setServerDaoKey(capablePayload.getDaoKey())
                  .setStatus(ApprovalStatus.REQUESTED)
                  .setObjId(capablePayload.getObjId())
                  .setOperation(operation)
                  .setOf(obj.getClassInfo())
                  .setPropertiesToUpdate(propertiesToApprove).build());

                ApprovalRequest  approvalRequest = new ApprovalRequest.Builder(getX())
                  .setDaoKey("approvableDAO")
                  .setObjId(approvable.getId())
                  .setOperation(operation)
                  .setCreatedBy(user.getId())
                  .setGroup("fraud-ops")
                  .setStatus(ApprovalStatus.REQUESTED).build();

                approvalRequestDAO.put_(getX(), approvalRequest);
              } catch (Exception e){
                throw new RuntimeException(e);
              }
            }

            // everything at this point  is either PENDING or GRANTED we need to reput
            DAO daoToReput = (DAO) x.get(getDaoToReput());

            daoToReput.put(obj);
          }

        }, "Sent out approval requests for needed payloads and granted the others");
      `
    }
  ]
});
