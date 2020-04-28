foam.CLASS({
    package: 'foam.nanos.approval',
    name: 'UserRefines',
    refines: 'foam.nanos.auth.User',
    imports: [
      'approvalRequestDAO'
    ],
    actions: [
      {
        name: 'viewApprovalRequests',
        label: 'View Approval Requests',
        availablePermissions: ['service.approvalRequestDAO', 'foam.nanos.auth.User.permission.viewApprovalRequests'],
        code: async function(X) {
          var m = foam.mlang.ExpressionsSingleton.create({});
          this.__context__.stack.push({
            class: 'foam.comics.BrowserView',
            createEnabled: false,
            editEnabled: true,
            exportEnabled: true,
            title: `${this.organization}'s Approval Requests`,
            data: X.approvalRequestDAO.where(m.AND(
              m.EQ(foam.nanos.approval.ApprovalRequest.OBJ_ID, this.id),
              m.EQ(foam.nanos.approval.ApprovalRequest.DAO_KEY, 'localUserDAO')
            ))
          });
        }
      }
    ]
});
