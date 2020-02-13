foam.CLASS({
  package: 'foam.approval',
  name: 'ApprovableApprovalRequestsRule',

  documentation: `
    A rule to update the approvable once it's related approval request has been
    APPROVED or REJECTED
  `,

  javaImports: [
    'foam.core.ContextAwareAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.core.FObject',
    'foam.nanos.ruler.Operations',
    'foam.approval.ApprovalRequest',
    'foam.approval.ApprovalStatus',
    'foam.approval.Approvable'
  ],

  implements: ['foam.nanos.ruler.RuleAction'],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        ApprovalRequest request = (ApprovalRequest) obj.fclone();

        agency.submit(x, new ContextAwareAgent() {
          
          @Override
          public void execute(X x) {
            DAO approvableDAO = (DAO) getX().get("approvableDAO");

            Approvable updatedApprovable = (Approvable) (approvableDAO.find(request.getObjId())).fclone();

            updatedApprovable.setStatus(request.getStatus());

            approvableDAO.put_(getX(), updatedApprovable);
          }
        }, "Updated approvable status based on the approval request");
      `
    }
  ]
});
