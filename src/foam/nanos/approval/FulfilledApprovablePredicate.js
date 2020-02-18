/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.approval',
  name: 'FulfilledApprovablePredicate',

  documentation: 'Returns true if from the approvableDAO and the Approvable is APPROVED',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.nanos.approval.ApprovalStatus',
    'foam.nanos.approval.Approvable',
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
