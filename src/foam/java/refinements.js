foam.CLASS({
  refines: 'foam.core.Argument',
  properties: [
    {
      class: 'String',
      name: 'javaType'
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.Property',
  properties: [
    {
      class: 'String',
      name: 'javaType',
      value: 'Object'
    },
    {
      class: 'String',
      name: 'javaJSONParser',
      value: 'foam.lib.json.AnyParser'
    },
    {
      class: 'String',
      name: 'javaInfoType'
    },
    {
      class: 'String',
      name: 'javaFactory'
    },
    {
      class: 'String',
      name: 'javaValue',
      expression: function(value) {
        // TODO: Escape string value reliably.
        return foam.typeOf(value) === foam.String ? '"' + value + '"' :
          foam.typeOf(value) === foam.Undefined ? 'null' :
          value;
      }
    }
  ],

  methods: [
    function createJavaPropertyInfo_(cls) {
      return foam.java.PropertyInfo.create({
        sourceCls: cls,
        propName: this.name,
        propType: this.javaType,
        jsonParser: this.javaJSONParser,
        extends: this.javaInfoType,
        transient: this.transient
      })
    },

    function buildJavaClass(cls) {
      // Use javaInfoType as an indicator that this property should be generated to java code.
      if ( ! this.javaInfoType ) return;

      var privateName = this.name + '_';
      var capitalized = foam.String.capitalize(this.name);
      var constantize = foam.String.constantize(this.name);
      var isSet = this.name + 'IsSet_';
      var factoryName = capitalized + 'Factory_';

      cls.
        field({
          name: privateName,
          type: this.javaType,
          visibility: 'private'
        }).
        field({
          name: isSet,
          type: 'boolean',
          visibility: 'private',
          initializer: 'false;'
        }).
        method({
          name: 'get' + capitalized,
          type: this.javaType,
          visibility: 'public',
          body: 'if ( ! ' + isSet + ' ) {\n' +
            ( this.hasOwnProperty('javaFactory') ? '  set' + capitalized + '(' + factoryName + '());\n' :
                ' return ' + this.javaValue  + ';\n' ) +
            '}\n' +
            'return ' + privateName + ';'
        }).
        method({
          name: 'set' + capitalized,
          visibility: 'public',
          args: [
            {
              type: this.javaType,
              name: 'val'
            }
          ],
          type: cls.name,
          body: privateName + ' = val;\n'
              + isSet + ' = true;\n'
              + 'return this;'
        });

      if ( this.hasOwnProperty('javaFactory') ) {
        cls.method({
          name: factoryName,
          visibility: 'protected',
          type: this.javaType,
          body: this.javaFactory
        });
      }

      cls.field({
        name: constantize,
        static: true,
        type: 'foam.core.PropertyInfo',
        initializer: this.createJavaPropertyInfo_(cls)
      });

      var info = cls.getField('classInfo_');
      if ( info ) info.addProperty(cls.name + '.' + constantize);
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.Implements',
  methods: [
    function buildJavaClass(cls) {
      cls.implements = (cls.implements || []).concat(this.path);
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.InnerClass',
  methods: [
    function buildJavaClass(cls) {
      var innerClass = this.model.buildClass().buildJavaClass();
      innerClass.innerClass = true;
      innerClass.static = true;
      cls.classes.push(innerClass);

      return innerClass;
    }
  ]
});

foam.LIB({
  name: 'foam.core.FObject',
  methods: [
    function buildJavaClass(cls) {
      cls = cls || foam.java.Class.create();

      cls.name = this.model_.name;
      cls.package = this.model_.package;
      cls.extends = this.model_.extends === 'FObject' ?
        'foam.core.AbstractFObject' : this.model_.extends;
      cls.abstract = this.model_.abstract;

      cls.fields.push(foam.java.ClassInfo.create({ id: this.id }));
      cls.method({
        name: 'getClassInfo',
        type: 'foam.core.ClassInfo',
        visibility: 'public',
        body: 'return classInfo_;'
      });

      cls.method({
        name: 'getOwnClassInfo',
        visibility: 'public',
        static: true,
        type: 'foam.core.ClassInfo',
        body: 'return classInfo_;'
      });

      var axioms = this.getOwnAxioms();
      for ( var i = 0 ; i < axioms.length ; i++ ) {
        axioms[i].buildJavaClass && axioms[i].buildJavaClass(cls);
      }

      return cls;
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.AbstractMethod',

  properties: [
    {
      class: 'String',
      name: 'javaCode'
    },
    {
      class: 'String',
      name: 'javaReturns'
    },
    {
      class: 'Boolean',
      name: 'abstract',
      value: true
    },
    {
      class: 'StringArray',
      name: 'javaThrows'
    },
    {
      class: 'Boolean',
      name: 'javaSupport',
      value: true
    }
  ],

  methods: [
    function createChildMethod_(child) {
      var result = child.clone();
      var props = child.cls_.getAxiomsByClass(foam.core.Property);
      for ( var i = 0 ; i < props.length ; i++ ) {
        var prop = props[i];

        if ( ! child.hasOwnProperty(prop.name) ) {
          prop.set(result, prop.get(this));
        }

      }

      // Special merging behaviour for args.
      var argCount = Math.max(this.args.length, child.args.length)
      for ( var i = 0 ; i < argCount ; i++ ) {
        result.args[i] = this.args[i].clone().copyFrom(child.args[i]);
      }

      return result;
    },

    function buildJavaClass(cls) {
      if ( ! this.javaSupport ) return;
      if ( ! this.javaCode && ! this.abstract ) return;

      cls.method({
        name: this.name,
        type: this.javaReturns || 'void',
        visibility: 'public',
        throws: this.javaThrows,
        args: this.args && this.args.map(function(a) {
          return {
            name: a.name,
            type: a.javaType
          };
        }),
        body: this.javaCode ? this.javaCode : ''
      });
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.Method',
  properties: [
    {
      class: 'Boolean',
      name: 'abstract',
      value: false
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.ProxiedMethod',

  properties: [
    {
      name: 'javaCode',
      getter: function() {
        // TODO: This could be an expression if the copyFrom in createChildMethod
        // didn't finalize its value
        if ( this.name == 'find' ) console.log(this.name, "returns", this.javaReturns)
        var code = '';

        if ( this.javaReturns && this.javaReturns !== 'void' ) {
          code += 'return ';
        }

        code += 'get' + foam.String.capitalize(this.property) + '()';
        code += '.' + this.name + '(';

        for ( var i = 0 ; this.args && i < this.args.length ; i++ ) {
          code += this.args[i].name;
          if ( i != this.args.length - 1 ) code += ', ';
        }
        code += ');';

        return code;
      }
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.Import',

  methods: [
    function buildJavaClass(cls) {
      cls.method({
        type: 'Object',
        name: 'get' + foam.String.capitalize(this.name),
        body: 'return getX().get("' + this.key + '");',
        visibility: 'protected'
      });
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.FObject',
  methods: [
    {
      name: 'toString',
      javaReturns: 'String',
      code: foam.core.FObject.prototype.toString
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.AbstractInterface',
  axioms: [
    {
      installInClass: function(cls) {
        cls.buildJavaClass =  function(cls) {
          cls = cls || foam.java.Interface.create();

          cls.name = this.name;
          cls.package = this.package;
          cls.extends = this.extends;

          var axioms = this.getAxioms();

          for ( var i = 0 ; i < axioms.length ; i++ ) {
            axioms[i].buildJavaClass && axioms[i].buildJavaClass(cls);
          }

          return cls;
        };
      }
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.Int',

  properties: [
    ['javaType', 'int'],
    ['javaInfoType', 'foam.core.AbstractIntPropertyInfo'],
    ['javaJSONParser', 'foam.lib.json.IntParser']
  ],

  methods: [
    function createJavaPropertyInfo_(cls) {
      var info = this.SUPER(cls);
      var m = info.getMethod('cast');
      m.body = 'return ( o instanceof Number ) ?'
            + '((Number)o).intValue() :'
            + '(int)o;';
      return info;
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Long',

  properties: [
    ['javaType', 'long'],
    ['javaInfoType', 'foam.core.AbstractLongPropertyInfo'],
    ['javaJSONParser', 'foam.lib.json.LongParser']
  ],

  methods: [
    function createJavaPropertyInfo_(cls) {
      var info = this.SUPER(cls);
      var m = info.getMethod('cast');
      m.body = 'return ( o instanceof Number ) ?'
            + '((Number)o).longValue() :'
            + '(long)o;';
      return info;
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Float',

  properties: [
    ['javaType', 'double'],
    ['javaInfoType', 'foam.core.AbstractDoublePropertyInfo'],
    ['javaJSONParser', 'foam.lib.json.FloatParser']
  ],

  methods: [
    function createJavaPropertyInfo_(cls) {
      var info = this.SUPER(cls);
      var m = info.getMethod('cast');
      m.body = 'return ( o instanceof Number ) ?'
            + '((Number)o).doubleValue() :'
            + '(double)o;';
      return info;
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.FObjectProperty',

  methods: [
    function createJavaPropertyInfo_(cls) {
      var info = this.SUPER(cls);
      if ( this.hasDefaultValue('javaJSONParser') && this.javaJSONParser == 'foam.lib.json.FObjectParser' ) {
        var m = info.getMethod('jsonParser');
        var of = this.of === 'FObject' ? 'foam.core.FObject' : this.of;
        m.body = 'return new foam.lib.json.FObjectParser(' + of + '.class);';
      }
      return info;
    }
  ]
});



foam.CLASS({
  refines: 'foam.core.DateTime',

  properties: [
    ['javaType', 'java.util.Date'],
    ['javaInfoType', 'foam.core.AbstractObjectPropertyInfo'],
    ['javaJSONParser', 'foam.lib.json.DateParser']
  ]
});


foam.CLASS({
  refines: 'foam.core.Map',

  properties: [
    ['javaType', 'java.util.Map'],
    ['javaJSONParser', 'foam.lib.json.MapParser'],
    ['javaInfoType', 'foam.core.AbstractObjectPropertyInfo'],
    ['javaFactory', 'return new java.util.HashMap();']
  ]
});

foam.CLASS({
  refines: 'foam.core.List',

  properties: [
    ['javaType', 'java.util.List']
  ]
});

foam.CLASS({
  refines: 'foam.core.String',
  properties: [
    ['javaType', 'String'],
    ['javaInfoType', 'foam.core.AbstractStringPropertyInfo'],
    ['javaJSONParser', 'foam.lib.json.StringParser']
  ]
});


foam.CLASS({
  refines: 'foam.core.FObjectProperty',
  properties: [
    {
      name: 'javaType',
      expression: function(of) {
        return of ? of : 'foam.core.FObject';
      }
    },
    ['javaInfoType', 'foam.core.AbstractFObjectPropertyInfo'],
    ['javaJSONParser', 'foam.lib.json.FObjectParser']
  ]
});


foam.CLASS({
  refines: 'foam.core.Array',

  properties: [
    ['javaType', 'Object[]'],
    ['javaInfoType', 'foam.core.AbstractPropertyInfo'],
    ['javaJSONParser', 'foam.lib.json.ArrayParser']
  ],

  methods: [
    function createJavaPropertyInfo_(cls) {
      var info = this.SUPER(cls);
      var compare = info.getMethod('compare');
      compare.body = this.compareTemplate();
      return info;
    }
  ],

  templates: [
    {
      name: 'compareTemplate',
      template: function() {/*
  <%= this.javaType %> values1 = get_(o1);
  <%= this.javaType %> values2 = get_(o2);
        if ( values1.length > values2.length ) return 1;
        if ( values1.length < values2.length ) return -1;

        int result;
        for ( int i = 0 ; i < values1.length ; i++ ) {
          result = ((Comparable)values1[i]).compareTo(values2[i]);
          if ( result != 0 ) return result;
        }
        return 0;*/}
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.FObjectArray',

  properties: [
    {
      name: 'javaType',
      expression: function(of) {
        return of + '[]'
      }
    },
    {
      name: 'javaJSONParser',
      value: 'foam.lib.json.FObjectArrayParser'
    },
    ['javaInfoType', 'foam.core.AbstractPropertyInfo']
  ],

  methods: [
    function createJavaPropertyInfo_(cls) {
      var info = this.SUPER(cls);
      var compare = info.getMethod('compare');
      compare.body = this.compareTemplate();

      var cast = info.getMethod('cast');
      cast.body = 'Object[] value = (Object[])o;\n'
                + this.javaType + ' ret = new ' + this.of + '[value.length];\n'
                + 'System.arraycopy(value, 0, ret, 0, value.length);\n'
                + 'return ret;'

      return info;
    }
  ],

  templates: [
    {
      name: 'compareTemplate',
      template: function() {/*
<%= this.javaType %> values1 = get_(o1);
<%= this.javaType %> values2 = get_(o2);
if ( values1.length > values2.length ) return 1;
if ( values1.length < values2.length ) return -1;

int result;
for ( int i = 0 ; i < values1.length ; i++ ) {
result = ((Comparable)values1[i]).compareTo(values2[i]);
if ( result != 0 ) return result;
}
return 0;
*/}
      }
  ]

});


foam.CLASS({
  refines: 'foam.core.Boolean',
  properties: [
    ['javaType', 'boolean'],
    ['javaJSONParser', 'foam.lib.json.BooleanParser'],
    ['javaInfoType', 'foam.core.AbstractBooleanPropertyInfo']
  ]
});


foam.CLASS({
  refines: 'foam.core.Object',
  properties: [
    ['javaType', 'Object'],
    ['javaJSONParser', 'foam.lib.json.AnyParser'],
    ['javaInfoType', 'foam.core.AbstractObjectPropertyInfo']
  ]
});


foam.CLASS({
  refines: 'foam.core.Proxy',
  properties: [
    {
      name: 'javaType',
      expression: function(of) { return of ? of : 'Object'; }
    },
    ['javaInfoType', 'foam.core.AbstractFObjectPropertyInfo'],
    ['javaJSONParser', 'foam.lib.json.FObjectParser']
  ]
});


foam.CLASS({
  refines: 'foam.core.Reference',
  properties: [
    ['javaType', 'Object'],
    ['javaJSONParser', 'foam.lib.json.AnyParser'],
    ['javaInfoType', 'foam.core.AbstractObjectPropertyInfo']
  ]
});

foam.CLASS({
  refines: 'foam.core.MultiPartID',

  properties: [
    {
      name: 'javaType',
      expression: function(props) {
        return props.length === 1 ? 'Object' : 'foam.core.CompoundKey';
      }
    },
    ['javaJSONParser', 'foam.lib.parse.Fail'],
    ['javaInfoType', 'foam.core.AbstractObjectPropertyInfo']
  ],

  methods: [
    function buildJavaClass(cls) {
      this.SUPER(cls);
      var privateName = this.name + '_';
      var capitalized = foam.String.capitalize(this.name);
      var constantize = foam.String.constantize(this.name);

      var props = this.props;

      cls.getMethod("get" + capitalized).body = foam.java.MultiPartGetter.create({
        props: props,
        clsName: cls.name
      });
      cls.getMethod("set" + capitalized).body = foam.java.MultiPartSetter.create({
        props: props,
        clsName: cls.name
      });
    }
  ]
});
