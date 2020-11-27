/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'CapabilityPreconditionDAO',
  extends: 'foam.dao.ObjectMutationProxyDAO',
  flags: ['java'],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.crunch.CrunchService',
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

        var crunchService = (CrunchService) x.get("crunchService");
        if ( ! crunchService.hasPreconditionsMet(x, cap.getId()) ) {
          cap.setCapabilityVisibilityPredicate(FALSE);
        }
        return cap;
      `
    }
  ]
})