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
    'foam.core.XLocator',
    'foam.nanos.crunch.Capability'
  ],

  methods: [
    {
      name: 'f',
      code: () => { return true; },
      javaCode: `
        if ( ! ( obj instanceof Capability) ) return false;
        Capability capability = (Capability) obj;
        return capability.getVisible() && capability.getCapabilityVisibilityPredicate() != null 
          && capability.getCapabilityVisibilityPredicate().f(XLocator.get());
      `
    }
  ]
});
