/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.predicate',
  name: 'CapabilityPreconditionPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.core.X',
    // 'foam.core.XLocator',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CrunchService'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        var cap = (Capability) obj;
        cap = (Capability) cap.fclone();

        X x = getX();

        var crunchService = (CrunchService) x.get("crunchService");
        if ( ! crunchService.hasPreconditionsMet(x, cap.getId()) ) {
          return false;
        }
        return true;
      `
    }
  ]
});