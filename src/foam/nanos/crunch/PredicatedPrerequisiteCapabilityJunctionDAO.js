/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'PredicatedPrerequisiteCapabilityJunctionDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    A DAO decorator which filters prerequisitejunctions returned by find/select by the predicate
    set on the junction.
  `,

  javaImports: [
    'foam.mlang.predicate.AbstractPredicate',
    'foam.nanos.auth.AuthService',
    'static foam.mlang.MLang.AND'
  ],
  
  constants: [
    {
      type: 'String',
      name: 'PERMISSION',
      value: 'predicatedprerequisite.read.*'
    }
  ],

  methods: [
    {
      name: 'hasPermission',
      args: [
        { name: 'x', javaType: 'foam.core.X' }
      ],
      type: 'Boolean',
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");

        // use a context with group set to null so that grouppermission
        // part of auth check will find the group from the context subject
        try {
          return auth.check(x.put("group", null), PERMISSION);
        } catch ( Exception e ) {
          return false;
        }
      `
    },
    {
      name: 'find_',
      javaCode: `
        CapabilityCapabilityJunction ccj = (CapabilityCapabilityJunction) getDelegate().find_(x, id);
        return ccj == null || hasPermission(x) || ccj.getPredicate().f(x) ? ccj : null;
      `
    },
    {
      name: 'select_',
      javaCode: `
        if ( hasPermission(x) ) return getDelegate().select_(x, sink, skip, limit, order, predicate);
        AbstractPredicate prereqPredicate = new AbstractPredicate(x) {
          @Override
          public boolean f(Object obj) {
            CapabilityCapabilityJunction ccj = (CapabilityCapabilityJunction) obj;
            return ccj.getPredicate().f(x);
          }
        };
        predicate = predicate == null ? prereqPredicate : AND(predicate, prereqPredicate);
        return getDelegate().select_(x, sink, skip, limit, order, predicate);
      `
    }
  ]
});
