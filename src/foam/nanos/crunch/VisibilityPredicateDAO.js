/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'VisibilityPredicateDAO',
  extends: 'foam.dao.ObjectMutationProxyDAO',
  flags: ['java'],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'static foam.mlang.MLang.*'
  ],

  documentation: `
    Replaces the visibilityPredicate by checking if preconditions are satisfied.
    If preconditions are not satisfied, visibilityPredicate becomes FALSE,
    otherwise it is not modified.
  `,

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public CapabilityPreconditionDAO(X x, DAO delegate) {
            setX(x);
            setDelegate(delegate);
          }
        `);
      }
    }
  ],

  methods: [
    {
      name: 'update',
      type: 'FObject',
      args: [ 'Context x', 'FObject obj' ],
      javaCode: `
        if ( obj == null ) return obj;
        var cap = (Capability) obj;
        cap = (Capability) cap.fclone();

        Predicate p = cap.getVisibilityPredicate();
        x = x.put("NEW", cap);
        cap.setClientVisibility(p.f(x));
        return cap;
      `
    }
  ]
})