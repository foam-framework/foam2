/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.approval',
  name: 'SendGroupRequestApprovalDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: `
    Populates "points" property for new requests based on approver user.
    When approvalRequest.group property is set, creates a new ApprovalRequest object for each user in the group and puts it to approvalDAO.
    When approvalRequest.approver property is set, approvalRequest.group is ignored.
    The original object is returned and should not be used for any operations.
  `,

  javaImports: [
    'foam.core.Detachable',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.approval.ApprovalStatus',
    'foam.nanos.approval.ApprovalRequest'
  ],

  messages: [
    {
      name: 'GROUP_NOT_SET_ERROR_MSG',
      message: 'Approver or approver group must be set for approval request'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(
          `
            public SendGroupRequestApprovalDAO(X x, DAO delegate) {
              setX(x);
              setDelegate(delegate);
            } 
          `
        );
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        ApprovalRequest request = (ApprovalRequest) obj;
        ApprovalRequest oldRequest = (ApprovalRequest) ((DAO) x.get("approvalRequestDAO")).find(obj);

        if ( oldRequest != null ) {
          return getDelegate().put_(x, obj);
        }
        User approver = request.findApprover(getX());

        if ( approver != null ) {
          request.setPoints(findUserPoints(approver));
          return super.put_(x, request);
        }

        Group group = request.findGroup(getX());

        if ( group == null ) {
          Logger logger = (Logger) x.get("logger");
          logger.error(GROUP_NOT_SET_ERROR_MSG);
          throw new RuntimeException(GROUP_NOT_SET_ERROR_MSG);
        }

        group.getUsers(getX()).select(new AbstractSink() {

          @Override
          public void put(Object obj, Detachable sub) {
            sendSingleRequest(x, request, ((User)obj).getId());
          }

        });
        return obj;
      `
    },
    {
      name: 'sendSingleRequest',
      visibility: 'protected',
      type: 'void',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'ApprovalRequest', name: 'req' },
        { type: 'Long', name: 'userId' }
      ],
      javaCode: `
        ApprovalRequest request = (ApprovalRequest) req.fclone();
        request.clearId();
        request.setApprover(userId);
        ((DAO) x.get("approvalRequestDAO")).put_(x, request);
      `
    },
    {
      name: 'findUserPoints',
      visibility: 'protected',
      type: 'int',
      args: [
        { type: 'User', name: 'user' }
      ],
      javaCode: `
        // TODO: find user points based on spid/role/group/configurations
        return 1;
      `
    }
  ]
});
