/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.column',
  name: 'ColumnConfigToPropertyConverter',
  documentation: `ColumnConfigToPropertyConverter gathers methods for converting property name to property if required 
      and returns property and obj, which will return the proprty value on f function call`,
  javaImports: [
    'foam.core.ClassInfo',
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.core.X',
    'foam.nanos.logger.Logger'
  ],
  methods: [
    {
      name: 'returnProperty',
      type: 'PropertyInfo',
      args: [
        {
          name: 'of',
          type: 'ClassInfo'
        },
        {
          name: 'propInfo',
          class: 'String'
        }
      ],
      code: function(of, propInfo) {
        var cls = of;
        var property;
        if ( foam.String.isInstance(propInfo) ) {
          var props = propInfo.split('.');
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
          property = propInfo;
        return property;
      },
      javaCode: `
        ClassInfo ci = of;
        PropertyInfo p = null;
        for ( int i = 0; i < propInfo.split("\\\\.").length; i++ ) {
          if ( ( p == null && i != 0 ) || ci == null )
            break;
          p = (PropertyInfo) ci.getAxiomByName(propInfo.split("\\\\.")[i]);
          if ( i != propInfo.split("\\\\.").length - 1 ) {
            Class cls = p.getValueClass();
            try {
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
          name: 'propInfo',
          class: 'String',
        },
        {
          name: 'obj',
          type: 'FObject'
        }
      ],
      code: function(of, propInfo, obj) {
        var cls = of;
        var property;
        var obj1 = obj;
        if ( foam.String.isInstance(propInfo) ) {
          var props = propInfo.split('.');
          for ( var i = 0 ; i < props.length ; i++ ) {
            property = foam.String.isInstance(props[i])
            ? cls.getAxiomByName(props[i])
            :  foam.Array.isInstance(props[i]) ? 
            cls.getAxiomByName(props[i]) : props[i];
            if ( !property ) {
              break;
            }
            cls = property.of;

            if ( i !== props.length - 1 && obj1 )
              obj1 = property.f(obj1);
          }
        }
        return obj1;
      },
      javaCode: `
        ClassInfo ci = of;
        FObject obj1 = obj;
        PropertyInfo p = null;
        for ( int i = 0 ; i < propInfo.split("\\\\.").length ; i++ ) {
          if ( ( p == null && i != 0 ) || ci == null )
            break;
          p = (PropertyInfo) ci.getAxiomByName(propInfo.split("\\\\.")[i]);

          if ( i != propInfo.split("\\\\.").length - 1 ) {
            obj1 = (FObject) p.f(obj1);
            Class cls = p.getValueClass();
            try {
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
          name: 'propInfo',
          class: 'String',
        },
        {
          name: 'obj',
          type: 'FObject'
        }
      ],
      code: function(of, propInfo, obj) {
        var cls = of;
        var property;
        var obj1 = obj;
        if ( foam.String.isInstance(propInfo) ) {
          var props = propInfo.split('.');
          for ( var i = 0; i < props.length; i++ ) {
            property = foam.String.isInstance(props[i])
            ? cls.getAxiomByName(props[i])
            :  foam.Array.isInstance(props[i]) ? 
            cls.getAxiomByName(props[i]) : props[i];
            if ( ! property )
              break;
            cls = property.of;

            if ( i !== props.length - 1 && obj1 )
              obj1 = property.f(obj1);
          }
        } else
          property = propInfo;
        return foam.nanos.column.ColumnPropertyValue.create({propertyValue:property, objValue:obj1});
      },
      javaCode: `
        ClassInfo ci = of;
        FObject obj1 = obj;
        PropertyInfo p = null;
        for ( int i = 0 ; i < propInfo.split("\\\\.").length ; i++ ) {
          if ( ( p == null && i != 0 ) || ci == null )
            break;
          p = (PropertyInfo) ci.getAxiomByName(propInfo.split("\\\\.")[i]);

          if ( i != propInfo.split("\\\\.").length - 1 ) {
            obj1 = (FObject) p.f(obj1);
            Class cls = p.getValueClass();
            try {
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
      code: function(of, propertyNameArrays, obj) {
        var arr = [];
        for ( var i = 0 ; i < propertyNameArrays.length ; i++) {
          arr.push(this.returnPropertyAndObject(of, propertyNameArrays, obj));
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