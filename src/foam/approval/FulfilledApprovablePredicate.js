foam.CLASS({
  package: 'foam.approval',
  name: 'FulfilledApprovablePredicate',

  documentation: 'Returns true if from the approvableDAO and the Approvable is APPROVED',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.approval.ApprovalStatus',
    'foam.approval.Approvable',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return
          EQ(DOT(NEW_OBJ, Approvable.STATUS), ApprovalStatus.APPROVED)
        .f(obj);
      `
    } 
  ]
});
