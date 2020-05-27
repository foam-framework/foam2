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
    'java.lang.reflect.Method'
  ],
  methods: [
    {
      name: 'filterExportedProps',
      documentation: 'returns propNames that are properties of the class and are networkTransient',
      code: function(of, propNames) {
        var props = of.getAxiomsByClass(foam.core.Property);
        var allColumnNames = props.map(p => p.name);
        if ( ! propNames ) {
          return props.filter(p => p.networkTransient).map(p => p.name);
        } props = [];
        return propNames.filter(n => { 
          return allColumnNames.includes(n.split('.')[0]); //&& this.returnProperty(of, n).networkTransient);
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
          var props = propName.split('.');
          for ( var i = 0 ; i < props.length ; i++ ) {
            property = foam.String.isInstance(props[i])
            ? cls.getAxiomByName(props[i])
            :  foam.Array.isInstance(props[i]) ? 
            cls.getAxiomByName(props[i]) : props[i];
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
        String[] props = propName.split("\\\\.");

        for ( int i = 0 ; i < props.length ; i++ ) {
          if ( ( p == null && i != 0 ) || ci == null )
            break;
          p = (PropertyInfo) ci.getAxiomByName(props[i]);
          if ( i != props.length - 1 ) {
            try {
              Class cls;
              if ( p instanceof foam.core.AbstractFObjectPropertyInfo ) {
                cls = p.getValueClass();
              } else {
                char[] arr = p.getName().toCharArray();
                arr[0] = Character.toUpperCase(arr[0]);
                sb.append(arr);
                String s = sb.toString();
                Method m = ci.getObjClass().getMethod(s, foam.core.X.class);
                cls = m.getReturnType();
                sb.setLength(4);//sb.delete(4, s.length);
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
      name: 'returnValue',
      documentation: `returns value that is one before last as there are number of uses cases when property's method is called on object
       e.g for propName 'address.countryId.name' we return country object which can be used by name property as parameter for such function calls as f or toCSV`,
      type: 'FObject',
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
          var props = propName.split('.');
          for ( var i = 0; i < props.length; i++ ) {
            property = foam.String.isInstance(props[i])
            ? cls.getAxiomByName(props[i])
            :  foam.Array.isInstance(props[i]) ? 
            cls.getAxiomByName(props[i]) : props[i];
            if ( ! property )
              break;
            cls = property.of;

            if ( i !== props.length - 1 && obj1 ) {
              if ( foam.core.Reference.isInstance(property) ) {
                obj1 = await obj1[property.name + '$find'];
              } else {
                obj1 = property.f(obj1);
              }
            }
          }
        }
        return obj1;
      },
      javaCode: `
        ClassInfo ci = of;
        FObject obj1 = obj;
        PropertyInfo p = null;
        String[] props = propName.split("\\\\.");
        for ( int i = 0 ; i < props.length ; i++ ) {
          if ( ( p == null && i != 0 ) || ci == null )
            break;
          p = (PropertyInfo) ci.getAxiomByName(props[i]);

          if ( i != props.length - 1 ) {
            try {
              Class cls;
              if ( p instanceof foam.core.AbstractFObjectPropertyInfo ) {
                obj1 = (FObject) p.f(obj1);
                cls = p.getValueClass();
              } else {
                char[] arr = p.getName().toCharArray();
                arr[0] = Character.toUpperCase(arr[0]);
                sb.append(arr);
                //String s = sb.toString();
                obj1 = (FObject)obj1.getClass().getMethod(sb.toString(), foam.core.X.class).invoke(obj1, x);
                sb.setLength(4);//delete(4, s.length);
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
        return obj1;
      `
    },
    {
      name: 'returnPropertyAndObject',
      type: 'foam.nanos.column.ColumnPropertyValue',
      documentation: `returns property and object on which such property's functions as f or toCSV can be called`,
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
          var props = propName.split('.');
          for ( var i = 0; i < props.length; i++ ) {
            property = foam.String.isInstance(props[i])
            ? cls.getAxiomByName(props[i])
            :  foam.Array.isInstance(props[i]) ? 
            cls.getAxiomByName(props[i]) : props[i];
            if ( ! property )
              break;
            cls = property.of;

            if ( i !== props.length - 1 && obj1 ) {
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
        String[] props = propName.split("\\\\.");
        for ( int i = 0 ; i < props.length ; i++ ) {
          if ( ( p == null && i != 0 ) || ci == null )
            break;
          p = (PropertyInfo) ci.getAxiomByName(props[i]);

          if ( i != props.length - 1 ) {
            try {
              Class cls;
              if ( p instanceof foam.core.AbstractFObjectPropertyInfo ) {
                obj1 = (FObject) p.f(obj1);
                cls = p.getValueClass();
              } else {
                char[] arr = p.getName().toCharArray();
                arr[0] = Character.toUpperCase(arr[0]);
                sb.append(arr);
                //String s = sb.toString();
                obj1 = (FObject)obj1.getClass().getMethod(sb.toString(), foam.core.X.class).invoke(obj1, x);
                sb.setLength(4);//delete(4, s.length);
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
    {
      name: 'returnPropertyAndObjectArray',
      type: 'foam.nanos.column.ColumnPropertyValue[]',
      static: true,
      final: true,
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
          name: 'propertyNameArrays',
          class: 'Array',
          javaType: 'String[]',
        },
        {
          name: 'obj',
          type: 'FObject'
        }
      ],
      code: async function(of, propertyNameArrays, obj) {
        var arr = [];
        for ( var i = 0 ; i < propertyNameArrays.length ; i++) {
          arr.push(await this.returnPropertyAndObject(of, propertyNameArrays, obj));
        }
        return arr;
      },
      javaCode: `
        ClassInfo ci = of;
        foam.nanos.column.ColumnPropertyValue[] arr = new foam.nanos.column.ColumnPropertyValue[propertyNameArrays.length];
        for ( int i = 0 ; i < propertyNameArrays.length ; i++ ) {
          arr[i] = returnPropertyAndObject(x, of, propertyNameArrays[i], obj);
        }
        return arr;
      `
    },
    async function returnValueForPropertyName(x, of, propName, obj) {
      //returns property and value of the obj that corresponds to the property
      var columnPropertyVal = await this.returnPropertyAndObject(x, of, propName, obj);
      if ( foam.core.Reference.isInstance(columnPropertyVal.propertyValue) )
        return foam.nanos.column.ColumnPropertyValue.create({ propertyValue:columnPropertyVal.propertyValue, objValue: await columnPropertyVal.objValue[columnPropertyVal.propertyValue.name + '$find']});
      return foam.nanos.column.ColumnPropertyValue.create({ propertyValue:columnPropertyVal.propertyValue, objValue: columnPropertyVal.propertyValue.f(columnPropertyVal.objValue)});
    },
    async function returnValueForArrayOfPropertyNames(x, of, propNames, obj) {
      var values = [];
      for ( var propName of  propNames ) {
        values.push(await this.returnValueForPropertyName(x, of, propName, obj));
      }
      return values;
    },
    async function returnValueForArrayOfPropertyNamesAndArrayOfObjects(x, of, propNames, objArray) {
      var values = [];
      for ( var obj of objArray ) {
        values.push(await this.returnValueForArrayOfPropertyNames(x, of, propNames, obj));
      }
      return values;
    },
    function returnProperties(of, propNames) {
      var arr = [];

      for ( var prop of propNames ) {
        arr.push(this.returnProperty(of, prop));
      }
      return arr;
    },
    
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