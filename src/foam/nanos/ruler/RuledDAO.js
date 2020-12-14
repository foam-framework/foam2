/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler',
  name: 'RuledDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Applied ruled (i.e, rule-like model) predicate on find_ and select_.',

  javaImports: [
    'foam.mlang.predicate.AbstractPredicate',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.ruler.Ruled'
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        var ret = getDelegate().find_(x, id);
        if ( ret instanceof Ruled ) {
          return ((Ruled) ret).f(x) ? ret: null;
        }
        return ret;
      `
    },
    {
      name: 'select_',
      javaCode: `
        Predicate ruledPredicate = new AbstractPredicate(x) {
          @Override
          public boolean f(Object obj) {
            if ( predicate != null && ! predicate.f(obj) ) return false;
            if ( obj instanceof Ruled ) {
              return ((Ruled) obj).f(x);
            }
            return true;
          }
        };
        return getDelegate().select_(x, sink, skip, limit, order, ruledPredicate);
      `
    }
  ]
})
