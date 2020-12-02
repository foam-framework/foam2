/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.approval',
  name: 'ApprovableApprovalRequestsPredicate',

  documentation: `
    Returns true from the approvalRequest if an approvableDAO 
    approval request has been APPROVED or REJECTED
  `,

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalStatus',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return AND(
          EQ(DOT(NEW_OBJ, ApprovalRequest.DAO_KEY), "approvableDAO"),
          OR(
            EQ(DOT(NEW_OBJ, ApprovalRequest.STATUS), ApprovalStatus.APPROVED),
            EQ(DOT(NEW_OBJ, ApprovalRequest.STATUS), ApprovalStatus.REJECTED),
            EQ(DOT(NEW_OBJ, ApprovalRequest.STATUS), ApprovalStatus.CANCELLED)
          ),
          EQ(DOT(NEW_OBJ, ApprovalRequest.IS_FULFILLED), false)
        ).f(obj);
      `
    } 
  ]
});
