/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'PredicateContextualizingDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.ContextAware',
    'foam.core.X'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public PredicateContextualizingDAO(X x, DAO delegate) {
            setX(x);
            setDelegate(delegate);
          }
        `);
      }
    }
  ],

  methods: [
    {
      name: 'select_',
      javaCode: `
        if ( predicate != null && predicate instanceof ContextAware ) {
          ((ContextAware) predicate).setX(x);
        }
        return getDelegate().select_(x, sink, skip, limit, order, predicate);
      `
    }
  ],

});
