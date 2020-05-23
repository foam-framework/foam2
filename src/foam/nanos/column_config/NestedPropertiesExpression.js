/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.column',
  name: 'NestedPropertiesExpression',
  extends: 'foam.mlang.AbstractExpr',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.core.ClassInfo',
    'foam.core.PropertyInfo',
    'foam.core.X',
    'foam.nanos.logger.Logger',
    'static foam.mlang.MLang.*',
    'java.lang.reflect.Method',
    'foam.mlang.Expr',
    'foam.core.FObject'
  ],
  properties: [
    {
      name: 'objClass',
      class: 'Object',
      javaType: 'foam.core.ClassInfo'
    },
    {
      name: 'nestedProperty',
      class: 'String'
    }
  ],
  methods: [
    {
      name: 'f',
      type: 'Any',
      code: function(of, nestedProperty) {
        return this.returnExpr(this.objClass, this.nestedProperty.split('.'), 0);
      },
      javaCode: `
        Expr e = returnExpr(getObjClass(), getNestedProperty().split("\\\\."), 0);
        //have no idea why but this context allows to execute find method, but object's context doesn't
        //need to investigate
        ((FObject)obj).setX(getX());
        return e.f(obj);
      `
    },
    {
      name: 'returnExpr',
      javaType: 'foam.mlang.Expr',
      args: [
        {
          name: 'of',
          type: 'Object',
          javaType: 'foam.core.ClassInfo'
        },
        {
          name: 'propNames',
          class: 'StringArray'
        },
        {
          name: 'i',
          class: 'Int'
        }
      ],
      code: function (of, propNames, i) {
        if (i === propNames.length - 1 ) {
          return of.getAxiomByName(propNames[i]);
        }
        var prop = of.getAxiomByName(propNames[i]);
        return foam.mlang.Expressions.create().DOT(prop, this.returnPropExpr(prop, this.returnExpr(prop.of, propNames, ++i)));
      },
      javaCode: `
        ClassInfo ci = of;
        PropertyInfo p = (PropertyInfo) ci.getAxiomByName(propNames[i]);
        if ( i == propNames.length - 1 ) {
          return p;
        }

        try {
          Class cls;
          if ( p instanceof foam.core.AbstractFObjectPropertyInfo ) {
            cls = p.getValueClass();
          } else {
            char[] arr = p.getName().toCharArray();
            arr[0] = Character.toUpperCase(arr[0]);
            sb.append(arr);
            String s = sb.toString();
            sb.setLength(4);
            Method m = ci.getObjClass().getMethod(s, foam.core.X.class);
            cls = m.getReturnType();
          }
          ci = (ClassInfo) cls.getMethod("getOwnClassInfo").invoke(null);
        } catch (Exception e) {
          Logger logger = (Logger) getX().get("logger");
          logger.error(e);
          return null;
        }

        return returnPropExpr(p, returnExpr(ci, propNames, ++i));
      `
    },
    {
      name: 'returnPropExpr',
      javaType: 'foam.mlang.Expr',
      args: [
        {
          name: 'prop1',
          class: 'Object',
          javaType: 'foam.mlang.Expr'
        },
        {
          name: 'prop2',
          class: 'Object',
          javaType: 'foam.mlang.Expr'
        }
      ],
      code: function (prop1, prop2) {
        return foam.mlang.Expressions.create().DOT(prop1, prop2);
      },
      javaCode: `
        return DOT(prop1, prop2);
      `
    }
  ],
  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          private static StringBuilder sb = new StringBuilder("find");
        `);
      }
    }
  ]
});



foam.CLASS({
  package: 'foam.nanos.column',
  name: 'ArrayOfExpressionForNestedProperties',

  javaImports: [
    'foam.core.X',
    'foam.mlang.Expr',
    'foam.mlang.sink.Projection',
    'static foam.mlang.MLang.*',
  ],
  properties: [
    {
      name: 'objClass',
      class: 'Object',
      javaType: 'foam.core.ClassInfo'
    },
    {
      name: 'propNames',
      class: 'StringArray'
    }
  ],
  methods: [
    {
      name: 'returnExpr',
      type: 'foam.mlang.Expr[]',
      code: function(of, propNames) {
        var exprArray = [];
        for ( var propName of propNames ) {
          exprArray.push(foam.nanos.column.NestedPropertiesExpression.create({ objClass: this.of, nestedProperty: propName }));
        }
        return exprArray;
      },
      javaCode: `
        foam.mlang.Expr[] exprs = new Expr[getPropNames().length];
        for ( int i = 0 ; i < getPropNames().length ; i++ ) {
          exprs[i] = new NestedPropertiesExpression.Builder(getX()).setObjClass(getObjClass()).setNestedProperty( getPropNames()[i]).build();
        }
        return exprs;
      `
    }
  ]
});