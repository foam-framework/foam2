/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler.predicate',
  name: 'PropertyEQProperty',

  documentation: `A predicate that returns true when a specific property equals the value of another specified property.
  The developer must provide the property names as a string for prop1 and prop2.
  The developer can choose on which object this predicate is evaluated. either old or new object.

  Example of usage: When a pizza object passes through the rule engine, we can check if topping1 property is equal to topping2 property.
  when true, we can charge for the topping at a discounted double topping rate`,

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.core.FObject',
    'static foam.mlang.MLang.*'
  ],
  properties: [
    {
      class: 'String',
      name: 'prop1'
    },
    {
      class: 'String',
      name: 'prop2'
    },
    {
      class: 'Boolean',
      name: 'isNew',
      value: true
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        if ( getIsNew() ) {
          FObject nu  = (FObject) NEW_OBJ.f(obj);
          return EQ(nu.getClassInfo().getAxiomByName(getProp1()), nu.getClassInfo().getAxiomByName(getProp2())).f(nu);
        }
        FObject old = (FObject) OLD_OBJ.f(obj);
        if ( old != null ) {
          return EQ(old.getClassInfo().getAxiomByName(getProp1()), old.getClassInfo().getAxiomByName(getProp2())).f(old);
        }
        return false;
      `
    }
  ]
});
