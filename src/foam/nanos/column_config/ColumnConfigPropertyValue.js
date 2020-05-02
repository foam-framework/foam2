foam.CLASS({
  package: 'foam.nanos.column',
  name: 'ColumnConfigToPropertyConverter',
  javaImports: [
    'foam.core.ClassInfo',
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.core.X',
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
        if ( typeof propInfo === 'string') {
          var props = propInfo.split('.');
          for ( var i = 0; i < props.length; i++ ) {
            property = typeof props[i] === 'string'
            ? cls.getAxiomByName(props[i])
            :  foam.Array.isInstance(props[i]) ? 
            cls.getAxiomByName(props[i]) : props[i];
            if ( !property ) {
              //need to come up with behavior or don't
              break;
            }
            cls = property.of;
          }
        } else
          property = propInfo;
        return property;
      },
      javaCode: `
        ClassInfo ci = of;
        PropertyInfo p = null;
        for(int i = 0; i < propInfo.split("\\\\.").length; i++) {
          if ( ( p == null && i != 0 ) || ci == null )
            break;
          p = (PropertyInfo) ci.getAxiomByName(propInfo.split("\\\\.")[i]);
          ci = p.getClassInfo();
        }
        return p;
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
       // if ( typeof propInfo === 'string') {
          var props = propInfo.split('.');
          for ( var i = 0; i < props.length; i++ ) {
            property = typeof props[i] === 'string'
            ? cls.getAxiomByName(props[i])
            :  foam.Array.isInstance(props[i]) ? 
            cls.getAxiomByName(props[i]) : props[i];
            if ( !property ) {
              //need to come up with behavior
              break;
            }
            cls = property.of;

            if ( i !== props.length - 1 && obj1 )
              obj1 = property.f(obj1);
          }
        // } else
        //   property = propInfo;
        return foam.nanos.column.ColumnPropertyValue.create({propertyValue:property, objValue:obj1});
      },
      javaCode: `
        ClassInfo ci = of;
        FObject obj1 = obj;
        PropertyInfo p = null;
        for(int i = 0; i < propInfo.split("\\\\.").length; i++) {
          if ( ( p == null && i != 0 ) || ci == null )
            break;
          p = (PropertyInfo) ci.getAxiomByName(propInfo.split("\\\\.")[i]);
          if ( i < propInfo.split(".").length - 1 ) {
            if ( i > 0 && obj1 != null)
              obj1 = (FObject) p.f(obj1);
          }
          ci = p.getClassInfo();
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
        for ( var i = 0; i < propertyNameArrays.length; i++) {
          arr.push(this.returnPropertyAndObject(of, propertyNameArrays, obj));
        }
        return arr;
      },
      javaCode: `
        ClassInfo ci = of;
        foam.nanos.column.ColumnPropertyValue[] arr = new foam.nanos.column.ColumnPropertyValue[propertyNameArrays.length];
        for (int i = 0; i < propertyNameArrays.length; i++) {
          arr[i] = returnPropertyAndObject(x, of, propertyNameArrays[i], obj);
        }
        return arr;
      `
    }
  ],
  // axioms: [
  //   {
  //     buildJavaClass: function(cls) {
  //       cls.extras.push(`
  //         public final static foam.nanos.column.ColumnPropertyValue returnPropertyAndObject(X x, ClassInfo of, String[] propNames, Object obj) {
  //           ClassInfo ci = of;
  //           FObject obj1 = null;
  //           PropertyInfo p = null;
  //           for(int i = 0; i < propNames.length; i++) {
  //             if ( p == null || (obj1 == null && i == 1) || ci == null )
  //               break;
  //             p = (PropertyInfo) ci.getAxiomByName(propNames[i]);
  //             if ( i > 0 )
  //               obj1 = (FObject) p.f(obj1);
  //             else
  //               obj1 = (FObject) p.f(obj);
  //             ci = obj1.getClassInfo();
  //           }
  //           return new ColumnPropertyValue.Builder(x).setProperty(p).setObj(obj1).build();
  //         }

  //         public final static foam.nanos.column.ColumnPropertyValue[] returnPropertyAndObjectArray(X x, ClassInfo of, String[][] propertyNameArrays, Object obj) {
    
  //           ClassInfo ci = of;
  //           foam.nanos.column.ColumnPropertyValue[] arr = new foam.nanos.column.ColumnPropertyValue[propertyNameArrays.length];
  //           for (int i = 0; i < propertyNameArrays.length; i++) {
  //             arr[i] = returnPropertyAndObject(x, of, propertyNameArrays[i], obj);
  //           }
  //           return arr;
  //         }

  //         public final static PropertyInfo returnProperty(ClassInfo of, String[] propertyNameArrays) {
    
  //           ClassInfo ci = of;
  //           PropertyInfo p = null;
  //           for(int i = 0; i < propertyNameArrays.length; i++) {
  //             if ( p == null || ci == null )
  //               break;
  //             p = (PropertyInfo) ci.getAxiomByName(propertyNameArrays[i]);
  //             ci = p.getClassInfo();
  //           }
  //           return p;
  //         }

  //       `)
  //     }
  //   }
  // ]
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