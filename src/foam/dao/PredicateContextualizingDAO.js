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