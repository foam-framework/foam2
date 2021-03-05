/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.lite.ruler',
  name: 'CapableCreateApprovalsRuleAction',

  documentation: `
    To create approvals requests specifically for Capable Payloads since theey are nested within an
    actual Capable object
  `,

  javaImports: [
    'foam.core.ContextAwareAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.nanos.auth.User',
    'foam.nanos.approval.Approvable',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalStatus',
    'foam.comics.v2.userfeedback.UserFeedback',
    'foam.comics.v2.userfeedback.UserFeedbackException',
    'foam.comics.v2.userfeedback.UserFeedbackStatus',
    'foam.nanos.ruler.Operations',
    'foam.nanos.auth.Subject',
    'java.util.Map',
    'java.util.ArrayList',
    'java.util.List',
    'foam.util.SafetyUtil',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.lite.Capable',
    'foam.nanos.crunch.CapabilityJunctionPayload',
    'foam.nanos.logger.Logger'
  ],

  implements: ['foam.nanos.ruler.RuleAction'],

  properties: [
    {
      class: 'String',
      name: 'daoToReput',
      required: true
    },
    {
      class: 'String',
      name: 'groupToNotify',
      value: 'fraud-ops'
    }
  ],

    messages: [
    { name: 'REQUEST_SEND_MSG', message: 'An approval request has been sent out' }
  ],

  methods: [
    {
      name: 'decorateApprovalRequest',
      documentation: `
        For further tweaks needed to be done to the approval request, the default is to not add anything
      `,
      type: 'ApprovalRequest',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'request', type: 'ApprovalRequest' },
        { name: 'capableObj', type: 'Capable' },
        { name: 'capablePayloadObj', type: 'CapabilityJunctionPayload' }
      ],
      javaCode: `
        return request;
      `
    },
    {
      name: 'applyAction',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();

        Logger logger = (Logger) x.get("logger");

        FObject clonedObj = obj.fclone();

        Capable capableObj = (Capable) clonedObj;

        if (
          String.valueOf(obj.getProperty("id")) == null ||
          SafetyUtil.isEmpty(String.valueOf(capableObj.getDAOKey()))
        ){
          logger.error("Missing id and/or DAOKey from Capable object");
          throw new RuntimeException("Missing id and/or DAOKey from Capable object");
        }


        agency.submit(x, new ContextAwareAgent() {

          @Override
          public void execute(X x) {
            for ( CapabilityJunctionPayload capablePayload : capableObj.getCapablePayloads() ){

              DAO capabilityDAO = (DAO) x.get("capabilityDAO");
              Capability capability = (Capability) capabilityDAO.find(capablePayload.getCapability());

              if ( ! capability.getReviewRequired() ) {
                continue;
              }

              DAO approvalRequestDAO = (DAO) getX().get("approvalRequestDAO");
              DAO approvableDAO = (DAO) getX().get("approvableDAO");

              Operations operation = Operations.CREATE;

              String hashedId = new StringBuilder("d")
                .append(capableObj.getDAOKey())
                .append(":o")
                .append(String.valueOf(obj.getProperty("id")))
                .append(":c")
                .append(capability.getId())
                .toString();

              List approvablesPending = ((ArraySink) approvableDAO
                .where(foam.mlang.MLang.AND(
                  foam.mlang.MLang.EQ(Approvable.LOOKUP_ID, hashedId),
                  foam.mlang.MLang.EQ(Approvable.STATUS, ApprovalStatus.REQUESTED)
                )).inX(getX()).select(new ArraySink())).getArray();

              if ( approvablesPending.size() > 0 ){
                logger.warning("Approvable already  exists for: " + hashedId);
                // TODO: throw an error once we add the paymentId checks as this is supposed  to be  unexpected
                // but because no paymentid check, then we end up in  an infinite loop just need to return
                return;
              }

              try {
                FObject objectToDiffAgainst = (FObject) capablePayload.getClassInfo().newInstance();

                Map propertiesToApprove = objectToDiffAgainst.diff(capablePayload);

                Approvable approvable = (Approvable) approvableDAO.put_(getX(), new Approvable.Builder(getX())
                  .setLookupId(hashedId)
                  .setDaoKey(capableObj.getDAOKey())
                  .setServerDaoKey(capableObj.getDAOKey())
                  .setStatus(ApprovalStatus.REQUESTED)
                  .setObjId(String.valueOf(obj.getProperty("id")))
                  .setOperation(operation)
                  .setOf(capablePayload.getClassInfo())
                  .setIsUsingNestedJournal(true)
                  .setPropertiesToUpdate(propertiesToApprove).build());

                ApprovalRequest  approvalRequest = new ApprovalRequest.Builder(getX())
                  .setDaoKey("approvableDAO")
                  .setObjId(approvable.getId())
                  .setOperation(operation)
                  .setCreatedFor(user.getId())
                  .setGroup(getGroupToNotify())
                  .setClassification(
                    capability.getName() +
                    " for " +
                    obj.getClassInfo().getObjClass().getSimpleName() +
                    " - id:" +
                    String.valueOf(obj.getProperty("id"))
                  )
                  .setStatus(ApprovalStatus.REQUESTED).build();

                approvalRequest = decorateApprovalRequest(x, approvalRequest, capableObj, capablePayload);

                approvalRequestDAO.put_(getX(), approvalRequest);
              } catch (Exception e){
                throw new RuntimeException(e);
              }
            }

            // everything at this point  is either PENDING or GRANTED we need to reput
            if ( ! clonedObj.equals(obj) ){
              DAO daoToReput = (DAO) x.get(getDaoToReput());

              daoToReput.put(clonedObj);
            }
          }

        }, "Sent out approval requests for required capable payloads and granted the others");
      `
    }
  ]
});
