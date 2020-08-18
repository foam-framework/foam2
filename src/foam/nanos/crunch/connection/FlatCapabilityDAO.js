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
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.connection.FlatCapability',
    'java.util.ArrayList',
    'java.util.List'
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
        CrunchService crunchService = (CrunchService) x.get("crunchService");
        if ( obj == null || ! (obj instanceof FlatCapability) ) {
          throw new RuntimeException("Attempted to put a non-flat capability in FlatCapabilityDAO");
        }
        FlatCapability flatCap = (FlatCapability) obj;
        List grantPath = crunchService.getGrantPath(x, flatCap.getTargetCapabilityId());

        List<String> classes = new ArrayList<>();
        List<String> capabilities = new ArrayList<>();
        for ( Object item : grantPath ) {
          // TODO: Verify that MinMaxCapability lists can be ignored here
          if ( item instanceof Capability ) {
            Capability cap = (Capability) item;
            classes.add(cap.getOf().getId());
            capabilities.add(cap.getId());
          }
        }

        flatCap.setClasses(classes.toArray(new String[classes.size()]));
        flatCap.setCapabilities(capabilities.toArray(new String[classes.size()]));

        return getDelegate().put_(x, obj);
      `
    }
  ],
});
