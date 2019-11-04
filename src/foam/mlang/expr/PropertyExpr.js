/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.expr',
  name: 'PropertyExpr',
  extends: 'foam.mlang.AbstractExpr',

  implements: [ 'foam.core.Serializable' ],

  documentation: `
    An Expr whose value is a property. Even though Property implements Expr
    directly, we want this so FObjectView can list this as an option for a
    concrete implementation of Expr instead of listing every property of every
    model.
  `,

  properties: [
    {
      class: 'Class',
      name: 'of',
      label: 'Model',
      gridColumns: 6,
      factory: function() {
        return this.property ? this.property.forClass_ : null;
      },
      view: {
        class: 'foam.u2.view.StrategizerChoiceView',
        desiredModelId: 'foam.Class'
      }
    },
    {
      name: 'property',
      gridColumns: 6,
      view: function(_, X) {
        return {
          class: 'foam.u2.view.ChoiceView',
          choices$: X.data.of$.map((of) => {
            return of
              ? of.getAxiomsByClass(foam.core.Property).map((axiom) => [axiom, axiom.label])
              : [];
          })
        };
      },
      javaType: 'foam.core.PropertyInfo',
      javaInfoType: 'foam.core.AbstractObjectPropertyInfo',
    }
  ],

  methods: [
    {
      name: 'f',
      code: function(obj) { return this.property.f(obj); },
      javaCode: 'return getProperty().f(obj);'
    },
    {
      name: 'createStatement',
      javaCode: 'return getProperty().getName();'
    },
    {
      name: 'toString',
      code: function() {
        return foam.String.constantize(this.property.name);
      }
    }
  ]
});
