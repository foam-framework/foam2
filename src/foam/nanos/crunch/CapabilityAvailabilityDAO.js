/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'CapabilityAvailabilityDAO',
  extends: 'foam.dao.ProxyDAO',
  flags: ['java'],

  javaImports: [
    'foam.nanos.crunch.Capability',
    'foam.core.X',
    'foam.core.Detachable',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.dao.ProxySink',
  ],

  documentation: `
    Omit results from the capabilityDAO based on availablilityPredicate of capability.
  `,

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public CapabilityAvailabilityDAO(X x, DAO delegate) {
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
        Capability capability = (Capability) getDelegate().find_(x, id);
        if ( capability == null || ! capability.getAvailabilityPredicate().f(x) ) {
          return null;
        }

        return getDelegate().find_(x, id);
      `
    },
    {
      name: 'select_',
      javaCode: `
        Sink s = sink != null ? sink : new ArraySink();
        ProxySink proxy = new ProxySink(x, s) {
          public void put(Object o, Detachable d) {
            Capability capability = (Capability) o;
            if ( capability.getAvailabilityPredicate().f(x) ) {
              getDelegate().put(capability, d);
            }
          }
        };
        return getDelegate().select_(x, proxy, skip, limit, order, predicate);
      `
    }
  ],
});
