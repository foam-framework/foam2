/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'IsUserCapabilityJunctionStatusUpdate',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: `Returns true if the status of the usercapabilityjunction has been updated`,

  javaImports: [
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return OR(
          EQ(OLD_OBJ, null),
          NEQ(DOT(OLD_OBJ, UserCapabilityJunction.STATUS), DOT(NEW_OBJ, UserCapabilityJunction.STATUS))
        ).f(obj);
      `
    }
  ]
});
    