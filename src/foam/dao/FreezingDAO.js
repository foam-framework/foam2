/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'FreezingDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.Detachable',
    'foam.core.FObject',
    'foam.core.X',
    'foam.mlang.order.Comparator',
    'foam.mlang.predicate.Predicate'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(
          `
            public FreezingDAO(X x, DAO delegate) {
              super(x, delegate);
            }
          `
        );
      }
    }
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        FObject ret = getDelegate().find_(x, id);
        if ( ret != null )
          ret = ret.fclone();
        return ret;
      `
    },
    {
      name: 'select_',
      javaCode: `
        getDelegate().select(new AbstractSink() {
          @Override
          public void put(Object obj, Detachable sub) {
            obj = ((FObject)obj).fclone();
            ((FObject) obj).freeze();
            sink.put(obj, sub);
          }
        });
        return sink;
      `
    }
  ]
});
