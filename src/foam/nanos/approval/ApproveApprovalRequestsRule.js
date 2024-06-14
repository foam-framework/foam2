/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.approval',
  name: 'ApproveApprovalRequestsRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: ``,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.app.Mode',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalStatus',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'java.util.List',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'StringArray',
      name: 'autoApprovablePermissions',
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          AppConfig appConfig = (AppConfig) x.get("appConfig");
          Logger logger = (Logger) x.get("logger");

          if ( appConfig.getMode() == Mode.DEVELOPMENT ||
               appConfig.getMode() == Mode.STAGING ) {
            
            DAO approvalRequestDAO = (DAO) x.get("approvalRequestDAO");

            List approvalRequestToApproveSink = ((ArraySink) ((DAO)x.get("approvalRequestDAO")).inX(x).where(AND(
              IN(ApprovalRequest.CLASSIFICATION, getAutoApprovablePermissions()),
              EQ(ApprovalRequest.STATUS, ApprovalStatus.REQUESTED)
              )
            ).select(new ArraySink())).getArray();   

            for ( Object obj: approvalRequestToApproveSink ) {
              ApprovalRequest request = (ApprovalRequest)obj;
              request.setStatus(ApprovalStatus.APPROVED);
              approvalRequestDAO.put(request);
              logger.warning("ApproveApprovalRequestsRule: Approval request " + request.getId() +  " was automatically approved");
            }
          }
        }
      }, "Approve approval requests, classifications of which are specified in autoApprovablePermissions property of the rule");
      `
    }
  ]
});
