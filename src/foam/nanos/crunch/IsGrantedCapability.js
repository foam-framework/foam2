foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'IsGrantedCapability',

  documentation: `Returns true if new object is usercapabilityjunction with status GRANTED`,

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return EQ(DOT(NEW_OBJ, UserCapabilityJunction.STATUS), CapabilityJunctionStatus.GRANTED).f(obj);
      `
    }
  ]
  });
  