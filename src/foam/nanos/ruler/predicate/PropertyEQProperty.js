/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler.predicate',
  name: 'PropertyEQProperty',

  documentation: 'A predicate that returns true when a specific property equals the other specified property the new or old object.',

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
        else {
          FObject old = (FObject) OLD_OBJ.f(obj);
          return EQ(old.getClassInfo().getAxiomByName(getProp1()), old.getClassInfo().getAxiomByName(getProp2())).f(old);
        }
      `
    }
  ]
});
