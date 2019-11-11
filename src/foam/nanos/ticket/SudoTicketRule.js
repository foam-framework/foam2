/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ticket',
  name: 'SudoTicketOpenRule',
  exends: 'foam.nanos.ruler.Rule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  properties: [
    {
      name: 'description',
      transient: true,
      visibility: 'RO',
      value: ''
    },
    {
      class: 'String',
      name: 'ruleGroup',
      value: 'sudo',
      visibility: 'RO',
      // readPermissionRequired: true,
      // writePermissionRequired: true
    },
    {
      class: 'Enum',
      of: 'foam.nanos.ruler.Operations',
      name: 'operation',
      value: 'CREATE',
      visibility: 'RO',
    },
    {
      class: 'Boolean',
      nane: 'autoApprove',
      value: false
    },
    {
      name: 'assignToGroup',
      class: 'Reference',
      of: 'foam.nanos.auth.Group',
      value: 'admin',
      view: function(_, x) {
        return foam.u2.view.ChoiceView.create({
          dao: x.groupDAO,
          placeholder: 'Select... ',
          // objToChoice: function(g) {
          //   return [g.id, g.id];
          // }
        }, x);
      },
    },
    {
      name: 'action',
      transient: true,
      javaFactory: `
    return this;
      `
    },
    {
      name: 'predicate',
      javaFactory: `
    return foam.nanos.ruler.predicate.IsInstancePredicate.Builder(x).setOf(foam.nanos.ticket.SudoTicket.getOwnClassInfo());
      `,
      transient: true
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            Ticket ticket = (Ticket) obj.fclone();
            DAO dao = ((DAO) x.get("approvalRequestDAO"))
              .where(AND(
                EQ(ApprovalRequest.DAO_KEY, "localTicketDAO"),
                EQ(ApprovalRequest.OBJ_ID, ticket.getId())
              ));

            ApprovalStatus approval = ApprovalRequestUtil.getState(dao);
            if ( approval != null && approval != ApprovalStatus.REQUESTED ) {

              transaction.setStatus(
                ApprovalStatus.APPROVED == approval
                  ? TransactionStatus.COMPLETED
                  : TransactionStatus.DECLINED);
              ((DAO) x.get("localTransactionDAO")).put(transaction);
            }
          }
        }, "Sudo Ticket Approval");
      `
    }
 ]
});
