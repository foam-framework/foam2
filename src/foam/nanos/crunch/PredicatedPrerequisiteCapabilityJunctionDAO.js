/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
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
    'foam.core.X',
    'foam.mlang.predicate.AbstractPredicate',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'isAdmin',
      args: [
        { name: 'x', javaType: 'foam.core.X' }
      ],
      type: 'Boolean',
      javaCode: `
        Subject subject = (Subject) x.get("subject");
        if ( subject != null ) {
          User user = subject.getUser();
          if ( user != null ) {
            return user.isAdmin();
          }
        }
        return false;
      `
    },
    {
      name: 'find_',
      javaCode: `
        CapabilityCapabilityJunction ccj = (CapabilityCapabilityJunction) getDelegate().find_(x, id);
        return ccj == null || isAdmin(x) || ccj.getPredicate().f(x) ? ccj : null;
      `
    },
    {
      name: 'select_',
      javaCode: `
        if ( isAdmin(x) ) return getDelegate().select_(x, sink, skip, limit, order, predicate);
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
