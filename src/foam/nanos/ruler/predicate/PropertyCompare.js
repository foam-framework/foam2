/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler.predicate',
  name: 'PropertyCompare',

  documentation: `Returns true if the provided comparator evaluates to true for the value of the specified property and the provided value.
  Exactly like "Operation(DOT(Object,propName), value)" however much neater to write.
  Possible operations include:
  'Gt' - Greater Than
  'Gte' - Greater Than or Equal
  'Lt' - Less Than
  'Lte' - Less Than or Equal
  'Eq' - Equal
  'Neq' - Not Equal
  TODO: Can probably delete PropertyEQValue and PropertyNEQValue as this renders them obsolete.
  `,

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.core.FObject',
    'static foam.mlang.MLang.*',
    'foam.util.SafetyUtil'
  ],
  properties: [
    {
      class: 'String',
      name: 'operation',
      documentation: 'operator that we want to use'
    },
    {
      class: 'String',
      name: 'propName',
      documentation: 'property name we are comparing'
    },
    {
      class: 'Object',
      name: 'value',
      documentation: 'value we compare against'
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
        return doOperation( (FObject) NEW_OBJ.f(obj) );
      }
      FObject old = (FObject) OLD_OBJ.f(obj);
      if ( old != null )
        return doOperation( old );
      return false;
      `
    },
    {
      name: 'doOperation',
      args: [
        { name: 'obj', type: 'FObject' }
      ],
      type: 'Boolean',
      javaCode: `
      if ( SafetyUtil.equals(getOperation().toLowerCase(), "gt" ) ) {
        return GT(obj.getClassInfo().getAxiomByName(getPropName()), getValue()).f(obj);
      }
      if ( SafetyUtil.equals(getOperation().toLowerCase(), "gte" ) ) {
        return GTE(obj.getClassInfo().getAxiomByName(getPropName()), getValue()).f(obj);
      }
      if ( SafetyUtil.equals(getOperation().toLowerCase(), "lt" ) ) {
        return LT(obj.getClassInfo().getAxiomByName(getPropName()), getValue()).f(obj);
      }
      if ( SafetyUtil.equals(getOperation().toLowerCase(), "lte" ) ) {
        return LTE(obj.getClassInfo().getAxiomByName(getPropName()), getValue()).f(obj);
      }
      if ( SafetyUtil.equals(getOperation().toLowerCase(), "eq" ) ) {
        return EQ(obj.getClassInfo().getAxiomByName(getPropName()), getValue()).f(obj);
      }
      if ( SafetyUtil.equals(getOperation().toLowerCase(), "neq" ) ) {
        return NEQ(obj.getClassInfo().getAxiomByName(getPropName()), getValue()).f(obj);
      }
      return false;
      `
    },
  ]
});
