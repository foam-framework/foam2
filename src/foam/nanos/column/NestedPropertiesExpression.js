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
        Expr e = returnDotExprForNestedProperty(getObjClass(), getNestedProperty().split("\\\\."), 0);
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
        }
      ],
      code: function (of, propName, i) {
        if ( i === propName.length - 1 )
          return of.getAxiomByName(propName[i]);
        var prop = of.getAxiomByName(propName[i]);
        return foam.mlang.Expressions.create().DOT(prop, this.returnPropExpr(prop, this.returnDotExprForNestedProperty(prop.of, propName, ++i)));
      },
      javaCode: `
        ClassInfo ci = of;
        PropertyInfo p = (PropertyInfo) ci.getAxiomByName(propName[i]);
        if ( i == propName.length - 1 ) {
          return p;
        }
        
        StringBuilder sb = new StringBuilder("find");
        try {
          Class cls;
          if ( p instanceof foam.core.AbstractFObjectPropertyInfo ) {
            cls = p.getValueClass();
          } else {
            sb.setLength(4);
            Method m = ci.getObjClass().getMethod(StringUtil.capitalize(p.getName()), foam.core.X.class);
            cls = m.getReturnType();
          }
          ci = (ClassInfo) cls.getMethod("getOwnClassInfo").invoke(null);
        } catch (Exception e) {
          Logger logger = (Logger) getX().get("logger");
          logger.error(e);
          return null;
        }

        return returnPropExpr(p, returnDotExprForNestedProperty(ci, propName, ++i));
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