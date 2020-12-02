/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.lite.ruler',
  name: 'CapableStatusChangeAdjustApprovalsRuleAction',

  documentation: `
    To remove ApprovalRequests upon CapablePayload.status changes
  `,

  javaImports: [
    'foam.core.ContextAwareAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'foam.nanos.logger.Logger',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.Approvable',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.lite.Capable',
    'foam.nanos.crunch.lite.CapablePayload',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.approval.ApprovalStatus',
    'foam.nanos.ruler.Operations',
    'foam.nanos.auth.Subject',
    'java.util.ArrayList',
    'java.util.Arrays',
    'java.util.List',
    'java.util.Map',
    'java.util.HashMap'
  ],

  implements: ['foam.nanos.ruler.RuleAction'],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();

        Logger logger = (Logger) x.get("logger");

        DAO capabilityDAO = (DAO) x.get("capabilityDAO");

        Capable capableNewObj = (Capable) obj;
        Capable capableOldObj = (Capable) oldObj;

        CapablePayload[] newCapablePayloads = capableNewObj.getCapablePayloads();
        CapablePayload[] oldCapablePayloads = capableOldObj.getCapablePayloads();

        List<CapablePayload> updatedApprovalPayloads = new ArrayList<>();

        if ( newCapablePayloads.length != oldCapablePayloads.length ){
          logger.error("capableOldObj and capableNewObj have different capable payloads lengths");
          throw new RuntimeException("capableOldObj and capableNewObj have different capable payloads lengths");
        }

        // Identifying the capablePayloads whose status changed between capableOldObj and capableNewObj
        Map<String,CapabilityJunctionStatus> capabilityIdToStatus = new HashMap<>();

        for ( int i = 0; i < oldCapablePayloads.length; i++ ){
          CapablePayload oldCapablePayload = oldCapablePayloads[i];
          capabilityIdToStatus.put(oldCapablePayload.getCapability(),oldCapablePayload.getStatus());
        }

        for ( int i = 0; i < newCapablePayloads.length; i++ ){
          CapablePayload newCapablePayload = newCapablePayloads[i];

          CapabilityJunctionStatus oldStatus = capabilityIdToStatus.get(newCapablePayload.getCapability());

          if ( oldStatus == null ){
            logger.error("capableNewObj contains a payload that capableOldObj does not have");
            throw new RuntimeException("capableNewObj contains a payload that capableOldObj does not have");
          }

          if ( ! SafetyUtil.equals(oldStatus, newCapablePayload.getStatus()) ){
            Capability capability = (Capability) capabilityDAO.find(newCapablePayload.getCapability());

            if ( capability.getReviewRequired() ){
              updatedApprovalPayloads.add(newCapablePayload);
            }

            // handle unapproved requests for a granted minmax
            if ( capability instanceof foam.nanos.crunch.MinMaxCapability ) {
              var crunchService = (CrunchService) x.get("crunchService");
              var payloadDAO = (DAO) capableNewObj.getCapablePayloadDAO(x);

              List<String> prereqIdsList = crunchService.getPrereqs(newCapablePayload.getCapability());

              if ( prereqIdsList != null && prereqIdsList.size() > 0 ) {
                String[] prereqIds = prereqIdsList.toArray(new String[prereqIdsList.size()]);

                ((ArraySink) payloadDAO.select(new ArraySink())).getArray().stream()
                .filter(cp -> Arrays.stream(prereqIds).anyMatch(((CapablePayload) cp).getCapability()::equals))
                .forEach(cp -> {
                  CapablePayload capableCp = (CapablePayload) cp;
                  if  ( capableCp.getStatus() == CapabilityJunctionStatus.PENDING ) {
                    updatedApprovalPayloads.add(capableCp);
                  }
                });
              }    
            }
          }
        }

        agency.submit(x, new ContextAwareAgent() {
          @Override
          public void execute(X x) {
            DAO approvalRequestDAO = (DAO) getX().get("approvalRequestDAO");
            DAO approvableDAO = (DAO) getX().get("approvableDAO");

            for ( CapablePayload capablePayload : updatedApprovalPayloads ){
              Capability capability = (Capability) capabilityDAO.find(capablePayload.getCapability());

              String hashedId = new StringBuilder("d")
                .append(capablePayload.getDaoKey())
                .append(":o")
                .append(String.valueOf(capablePayload.getObjId()))
                .append(":c")
                .append(capability.getId())
                .toString();

              DAO approvablesPendingDAO = approvableDAO
                .where(foam.mlang.MLang.AND(
                  foam.mlang.MLang.EQ(Approvable.LOOKUP_ID, hashedId),
                  foam.mlang.MLang.EQ(Approvable.STATUS, ApprovalStatus.REQUESTED)
                ));

              List<Approvable> approvablesPending = ((ArraySink) approvablesPendingDAO.inX(getX()).select(new ArraySink())).getArray();
              
              for ( Approvable approvable : approvablesPending ){
                approvalRequestDAO.where(
                  foam.mlang.MLang.AND(
                    foam.mlang.MLang.EQ(ApprovalRequest.OBJ_ID, approvable.getId()),
                    foam.mlang.MLang.EQ(ApprovalRequest.DAO_KEY, "approvableDAO")
                  )
                ).removeAll();
              }

              approvablesPendingDAO.removeAll();              
            }
          }
        }, "Adjusted approvals after the capable payload status changed");
      `
    }
  ]
});
