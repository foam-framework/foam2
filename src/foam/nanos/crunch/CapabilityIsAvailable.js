/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'CapabilityIsAvailable',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: [ 'foam.core.Serializable' ],

  javaImports: [
    'foam.core.FObject',
    'foam.core.XLocator',
    'foam.core.X',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CrunchService'
  ],

  methods: [
    {
      name: 'f',
      code: () => { return true; },
      javaCode: `
        if ( ! ( obj instanceof Capability) ) return false;
        X x = XLocator.get();
        Capability capability = (Capability) obj;
        return capability.getAvailabilityPredicate() != null 
        && capability.getAvailabilityPredicate().f(x);
      `
    },
    {
      name: 'toString',
      code: function toString() { return this.cls_.name; },
      javaCode: 'return getClass().getName();'
    }
  ]
});
