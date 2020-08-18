/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.connection',
  name: 'FlatCapabilityDAO',
  extends: 'foam.dao.ProxyDAO',
  flags: ['java'],

  javaImports: [
    
    'foam.core.X',
    'foam.dao.DAO'
  ],

  javaImports: [
    'foam.dao.*',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.dao.ArraySink',
    'foam.mlang.predicate.Predicate',
    'foam.mlang.order.Comparator',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.connection.FlatCapability'
  ],

  documentation: `
    Flatten capability prerequesites into one flat capabilities.
  `,

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
        protected class DecoratedSink extends foam.dao.ProxySink
          {
            public DecoratedSink(X x, Sink delegate)
            {
              super(x, delegate);
              if (delegate == null)
                delegate = new ArraySink();
            }

            @Override
            public void put(Object obj, foam.core.Detachable sub)
            {
              if (obj instanceof FlatCapability) {
                getDelegate().put(obj, sub);
              }
            }
          }

          public FlatCapabilityDAO(X x, DAO delegate) {
            setX(x);
            setDelegate(delegate);
          } 
        `);
      }
    }
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        FObject obj = getDelegate().find_(x, id);
        if( obj != null && obj instanceof FlatCapability ) {
          return obj;
        }
        return null;
      `
    },
    {
      name: 'select_',
      javaCode: `
        Sink decoratedSink = new DecoratedSink(x, sink);
        getDelegate().select_(x, decoratedSink, skip, limit, order, predicate);
        return sink;
      `
    },
    {
      name: 'put_',
      javaCode: `
        // TODO: add logic to retrieve capabilities in order of precendence

        return getDelegate().put_(x, obj);
      `
    }
  ],
});
