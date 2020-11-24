/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'CapabilityIsVisible',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: [ 'foam.core.Serializable' ],

  javaImports: [
    'foam.core.FObject',
    'foam.core.XLocator',
    'foam.core.X',
    'foam.nanos.crunch.Capability'
  ],

  methods: [
    {
      name: 'f',
      code: () => { return true; },
      javaCode: `
        if ( ! ( obj instanceof Capability) ) return false;
        X x = XLocator.get();
        Capability capability = (Capability) obj;
        return capability.getVisible() ? capability.getVisibilityPredicate() != null 
        && capability.getVisibilityPredicate().f(x) : false;
      `
    }
  ]
});