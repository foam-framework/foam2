/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.column',
  name: 'ColumnConfigToPropertyConverter',
  documentation: `ColumnConfigToPropertyConverter gathers methods for converting (or mapping) property name to property if required 
      and returns property and obj, which will return the proprty value on f function call`,
  javaImports: [
    'foam.core.ClassInfo',
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.core.X',
    'foam.mlang.Expr',
    'foam.nanos.logger.Logger',
    'foam.util.StringUtil',
    'java.lang.reflect.Method'
  ],
  methods: [
    {
      name: 'filterExportedProps',
      documentation: 'returns propNames that are properties of the class and aren\'t networkTransient',
      code: function(of, propNames) {
        var props = of.getAxiomsByClass(foam.core.Property);
        var allColumnNames = props.map(p => p.name);
        if ( ! propNames )
          return props.filter(p => ! p.networkTransient ).map(p => p.name);
        return propNames.filter(n => { 
          return allColumnNames.includes(n.split('.')[0]) && ! this.returnProperty(of, n).networkTransient;
        });
      }
    },
    {
      name: 'returnProperty',
      documentation: 'returns last property for chain of properties e.g. city property for address.city',
      type: 'PropertyInfo',
      args: [
        {
          name: 'of',
          type: 'ClassInfo'
        },
        {
          name: 'propName',
          class: 'String'
        }
      ],
      code: function(of, propName) {
        var cls = of;
        var property;
        if ( foam.String.isInstance(propName) ) {
          var propNames = propName.split('.');
          for ( var i = 0 ; i < propNames.length ; i++ ) {
            property = foam.String.isInstance(propNames[i])
            ? cls.getAxiomByName(propNames[i])
            :  foam.Array.isInstance(propNames[i]) ? 
            cls.getAxiomByName(propNames[i]) : propNames[i];
            if ( ! property )
              break;
            cls = property.of;
          }
        } else
          property = propName;
        return property;
      },
      javaCode: `
        ClassInfo ci = of;
        PropertyInfo p = null;
        String[] propNames = propName.split("\\\\.");
        StringBuilder sb = new StringBuilder("find");

        for ( int i = 0 ; i < propNames.length ; i++ ) {
          if ( ( p == null && i != 0 ) || ci == null )
            break;
          p = (PropertyInfo) ci.getAxiomByName(propNames[i]);
          if ( i != propNames.length - 1 ) {
            try {
              Class cls;
              if ( p instanceof foam.core.AbstractFObjectPropertyInfo ) {
                cls = p.getValueClass();
              } else {
                Method m = ci.getObjClass().getMethod(StringUtil.capitalize(p.getName()), foam.core.X.class);
                cls = m.getReturnType();
                //cleaning up StringBuilder by setting it to "find" for another property to use
                sb.setLength(4);
              }
              ci = (ClassInfo) cls.getMethod("getOwnClassInfo").invoke(null);
            } catch (Exception e) {
              Logger logger = (Logger) getX().get("logger");
              logger.error(e);
              return null;
            }
          }
        }
        return p;
      `
    },
    {
      name: 'returnPropertyAndObject',
      type: 'foam.nanos.column.ColumnPropertyValue',
      documentation: 'returns property and object on which such property\'s functions as f or toCSV can be called',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'of',
          type: 'ClassInfo'
        },
        {
          name: 'propName',
          class: 'String',
        },
        {
          name: 'obj',
          type: 'FObject'
        }
      ],
      code: async function(of, propName, obj) {
        var cls = of;
        var property;
        var obj1 = obj;
        if ( foam.String.isInstance(propName) ) {
          var propNames = propName.split('.');
          for ( var i = 0 ; i < propNames.length ; i++ ) {
            property = foam.String.isInstance(propNames[i])
            ? cls.getAxiomByName(propNames[i])
            :  foam.Array.isInstance(propNames[i]) ? 
            cls.getAxiomByName(propNames[i]) : propNames[i];
            if ( ! property )
              break;
            cls = property.of;

            if ( i !== propNames.length - 1 && obj1 ) {
              if ( foam.core.Reference.isInstance(property) ) {
                obj1 = await obj1[property.name + '$find'];
              } else {
                obj1 = property.f(obj1);
              }
            }
          }
        } else
          property = propName;
        return foam.nanos.column.ColumnPropertyValue.create({propertyValue:property, objValue:obj1});
      },
      javaCode: `
        ClassInfo ci = of;
        FObject obj1 = obj;
        PropertyInfo p = null;
        String[] propNames = propName.split("\\\\.");
        StringBuilder sb = new StringBuilder("find");
        for ( int i = 0 ; i < propNames.length ; i++ ) {
          if ( ( p == null && i != 0 ) || ci == null )
            break;
          p = (PropertyInfo) ci.getAxiomByName(propNames[i]);

          if ( i != propNames.length - 1 ) {
            try {
              Class cls;
              if ( p instanceof foam.core.AbstractFObjectPropertyInfo ) {
                obj1 = (FObject) p.f(obj1);
                cls = p.getValueClass();
              } else {
                obj1 = (FObject)obj1.getClass().getMethod(StringUtil.capitalize(p.getName()), foam.core.X.class).invoke(obj1, x);
                sb.setLength(4);
                if ( obj1 == null ) return new ColumnPropertyValue.Builder(x).setPropertyValue(null).setObjValue(null).build();
                cls = obj1.getClass();
              }
              ci = (ClassInfo) cls.getMethod("getOwnClassInfo").invoke(null);
            } catch (Exception e) {
              Logger logger = (Logger) getX().get("logger");
              logger.error(e);
              return new ColumnPropertyValue.Builder(x).setPropertyValue(null).setObjValue(null).build();
            }
          }
        }
        return new ColumnPropertyValue.Builder(x).setPropertyValue(p).setObjValue(obj1).build();
      `
    },
    async function returnValueForPropertyName(x, of, propName, obj) {
      //returns property and value of the obj that corresponds to the property
      var columnPropertyVal = await this.returnPropertyAndObject(x, of, propName, obj);
      if ( foam.core.Reference.isInstance(columnPropertyVal.propertyValue) )
        return foam.nanos.column.ColumnPropertyValue.create({ propertyValue:columnPropertyVal.propertyValue, objValue: await columnPropertyVal.objValue[columnPropertyVal.propertyValue.name + '$find']});
      return foam.nanos.column.ColumnPropertyValue.create({ propertyValue:columnPropertyVal.propertyValue, objValue: columnPropertyVal.propertyValue.f(columnPropertyVal.objValue)});
    },
    function returnProperties(of, propNames) {
      var arr = [];

      for ( var prop of propNames ) {
        arr.push(this.returnProperty(of, prop));
      }
      return arr;
    },
    
  ]
});

foam.CLASS({
  package: 'foam.nanos.column',
  name: 'ColumnPropertyValue',
  properties: [
    {
      name: 'propertyValue',
      class: 'FObjectProperty',
      javaType: 'foam.core.PropertyInfo'
    },
    {
      name: 'objValue',
      class: 'FObjectProperty',
      of: 'FObject'
    }
  ]
});