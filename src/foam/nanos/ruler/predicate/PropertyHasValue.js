/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler.predicate',
  name: 'PropertyHasValue',

  documentation: `A predicate that returns true when a specific property has a value.
      user can choose the new or old object for evaluation.`,

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.core.FObject',
    'static foam.mlang.MLang.*'
  ],
  properties: [
    {
      class: 'String',
      name: 'propName'
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
          return HAS(nu.getClassInfo().getAxiomByName(getPropName())).f(nu);
        }
        FObject old = (FObject) OLD_OBJ.f(obj);
        if ( old != null ) {
          return HAS(old.getClassInfo().getAxiomByName(getPropName())).f(old);
        }
        return false;
      `
    }
  ]
});
