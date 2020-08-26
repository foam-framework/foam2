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

  documentation: 'Class for creating expression for a given nestedProperty ( e.g. address.countryId.name )',

  javaImports: [
    'foam.core.AbstractFObjectPropertyInfo',
    'foam.core.ClassInfo',
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.core.X',
    'foam.mlang.Expr',
    'foam.nanos.logger.Logger',
    'foam.util.StringUtil',
    'java.lang.reflect.Method',
    'static foam.mlang.MLang.*',
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
    function set(o, val) {
      o.cls_.getAxiomByName(this.nestedProperty).set(o, val);
    },
    {
      name: 'toString',
      code: function() {
        return this.cls_.name + '('
          + this.objClass.id
          + ', '
          + this.nestedProperty + ')';
      },
      javaCode: `
        return getClassInfo().getId() + "(" + getObjClass().getId() + ", " + getNestedProperty() + ")";
      `
    },
    {
      name: 'f',
      type: 'Any',
      code: function(obj) {
        var e =  this.returnDotExprForNestedProperty(this.objClass, this.nestedProperty.split('.'), 0);
        if ( ! e ) return null;
        return e.f(obj);
      },
      javaCode: `
        Expr e = returnDotExprForNestedProperty(getObjClass(), getNestedProperty().split("\\\\."), 0, null);
        if ( e == null )
          return null;
        FObject copy = ((FObject)obj).shallowClone();
        copy.setX(getX());
        return e.f(copy);
      `
    },
    {
      name: 'returnDotExprForNestedProperty',
      javaType: 'foam.mlang.Expr',
      args: [
        {
          name: 'of',
          type: 'Object',
          javaType: 'foam.core.ClassInfo'
        },
        {
          name: 'propName',
          class: 'StringArray'
        },
        {
          name: 'i',
          class: 'Int'
        },
        {
          name: 'expr',
          javaType: 'foam.mlang.Expr'
        }
      ],
      code: function (of, propName, i, expr) {
        var prop = of.getAxiomByName(propName[i]);
        if ( ! prop ) return null;

        if ( i === propName.length - 1 )
          return ! expr ? prop :
            foam.mlang.Expressions.create().DOT(expr, prop);

        var propExpr = this.buildPropertyExpr(prop, expr);

        return this.returnDotExprForNestedProperty(prop.of, propName, ++i, propExpr);
      },
      javaCode: `
        PropertyInfo prop = (PropertyInfo) of.getAxiomByName(propName[i]);

        if ( prop == null ) return null;

        if ( i == propName.length - 1 )
          return expr == null ? prop : DOT(expr, prop);

        Expr propExpr = buildPropertyExpr(prop, expr);

        try {
          ClassInfo ci = getPropertyClassInfo(prop);
          return returnDotExprForNestedProperty(ci, propName, ++i, propExpr);
        } catch ( Throwable t ) {
          return null;
        }
      `
    },
    {
      name: 'getPropertyClassInfo',
      javaType: 'ClassInfo',
      javaThrows: [
        'java.lang.Exception'
      ],
      args: [
        {
          name: 'prop',
          javaType: 'foam.core.PropertyInfo',
        }
      ],
      javaCode: `
        if ( prop instanceof AbstractFObjectPropertyInfo ) {
          return ((AbstractFObjectPropertyInfo) prop).of();
        }

        Class cls = getFinderMethod(prop).getReturnType();
        return (ClassInfo) cls.getMethod("getOwnClassInfo").invoke(null);
      `
    },
    {
      name: 'buildPropertyExpr',
      javaType: 'foam.mlang.Expr',
      args: [
        {
          name: 'prop',
          javaType: 'foam.mlang.Expr',
        },
        {
          name: 'expr',
          javaType: 'foam.mlang.Expr'
        }
      ],
      code: function(prop, expr) {
        if ( foam.core.Reference.isInstance(prop) )
          prop = foam.mlang.Expressions.create().REF(prop);

        return ! expr ? prop :
          foam.mlang.Expressions.create().DOT(expr, prop);
      },
      javaCode: `
        if ( isPropertyAReference((PropertyInfo)prop) )
          prop = REF(prop);

        return expr == null ? prop : DOT(expr, prop);
      `
    },
    {
      name: 'isPropertyAReference',
      javaType: 'Boolean',
      args: [
        {
          name: 'prop',
          javaType: 'foam.core.PropertyInfo',
        }
      ],
      javaCode: `
        if ( prop instanceof foam.core.AbstractFObjectPropertyInfo )
          return false;

        return getFinderMethod(prop) != null;
      `
    },
    {
      name: 'getFinderMethod',
      javaType: 'Method',
      args: [
        {
          name: 'prop',
          javaType: 'foam.core.PropertyInfo',
        }
      ],
      javaCode: `
        try {
          return prop.getClassInfo().getObjClass().getMethod("find" + StringUtil.capitalize(prop.getName()), foam.core.X.class);
        } catch( Throwable t ) {
          return null;
        }
      `
    }
  ]
});



foam.CLASS({
  package: 'foam.nanos.column',
  name: 'ExpressionForArrayOfNestedPropertiesBuilder',

  documentation: 'Class for creating expression for array of property\'s names',

  javaImports: [
    'foam.core.ClassInfo',
    'foam.core.X',
    'foam.mlang.Expr',
    'foam.mlang.sink.Projection',
    'java.util.ArrayList',
    'static foam.mlang.MLang.*'
  ],
  methods: [
    {
      name: 'returnArrayOfExprForArrayOfProperties',
      type: 'foam.mlang.Expr[]',
      args: [
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
      code: function(objClass, propNames) {
        var exprArray = [];
        for ( var propName of propNames ) {
          var expr = foam.nanos.column.NestedPropertiesExpression.create({ objClass: objClass, nestedProperty: propName });
          if ( expr )
            exprArray.push(expr);
        }
        return exprArray;
      },
      javaCode: `
        ArrayList<foam.mlang.Expr> exprs = new ArrayList();
        for ( int i = 0 ; i < propNames.length ; i++ ) {
          Expr expr = new NestedPropertiesExpression.Builder(getX()).setObjClass(objClass).setNestedProperty( propNames[i]).build();
          if ( expr != null ) {
            exprs.add(expr);
          }
        }
        return (Expr[]) exprs.toArray();
      `
    },
    {
      name: 'buildProjectionForPropertyNamesArray',
      type: 'Any',
      args: [
        {
          name: 'of',
          class: 'Class',
          javaType: 'foam.core.ClassInfo'
        },
        {
          name: 'propNames',
          class: 'StringArray'
        }
      ],
      code: function(of, propNames) {
        return foam.mlang.sink.Projection.create({ exprs: this.returnArrayOfExprForArrayOfProperties(of, propNames) });
      },
      javaCode: `
        Expr[] exprs = returnArrayOfExprForArrayOfProperties(of, propNames);
        return new Projection.Builder(getX()).setExprs(exprs).build();
      `
    }
  ]
});
