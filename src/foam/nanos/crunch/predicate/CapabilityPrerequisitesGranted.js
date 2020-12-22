/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.predicate',
  name: 'CapabilityPrerequisitesGranted',
  
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],
  
  documentation: `Returns true if the prerequisites of a capability on a ucj are granted`,
  
  javaImports: [
    'foam.core.X',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        X x = (X) obj;
        UserCapabilityJunction ucj = (UserCapabilityJunction) x.get("NEW");
        Capability capability = (Capability) ucj.findTargetId(x);
        return capability.getPrereqsChainedStatus(x, ucj) == CapabilityJunctionStatus.GRANTED;
      `
    }
  ]
});
  
  