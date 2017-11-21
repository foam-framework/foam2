/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
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
      class: 'Boolean',
      name: 'generateJava',
      value: true
    },
    {
      class: 'String',
      name: 'javaType',
      value: 'Object'
    },
    {
      class: 'String',
      name: 'javaJSONParser',
      value: 'new foam.lib.json.AnyParser()'
    },
    {
      class: 'String',
      name: 'javaCSVParser'
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
      name: 'javaGetter'
    },
    {
      class: 'String',
      name: 'javaSetter'
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
        sourceCls:        cls,
        propName:         this.name,
        propType:         this.javaType,
        propValue:        this.javaValue,
        propRequired:     this.required,
        jsonParser:       this.javaJSONParser,
        csvParser:        this.javaCSVParser,
        extends:          this.javaInfoType,
        networkTransient: this.networkTransient,
        storageTransient: this.storageTransient,
        sqlType:          this.sqlType
      })
    },

    function buildJavaClass(cls) {
      if ( ! this.generateJava ) return;

      // Use javaInfoType as an indicator that this property should be
      // generated to java code.

      // TODO: Evaluate if we still want this behaviour.  It might be
      // better to only respect the generateJava flag
      if ( ! this.javaInfoType ) return;

      var privateName = this.name + '_';
      var capitalized = foam.String.capitalize(this.name);
      var constantize = foam.String.constantize(this.name);
      var isSet       = this.name + 'IsSet_';
      var factoryName = capitalized + 'Factory_';

      cls.
        field({
          name: privateName,
          type: this.javaType,
          visibility: 'protected'
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
          body: this.javaGetter || ('if ( ! ' + isSet + ' ) {\n' +
            ( this.hasOwnProperty('javaFactory') ?
                '  set' + capitalized + '(' + factoryName + '());\n' :
                ' return ' + this.javaValue  + ';\n' ) +
            '}\n' +
            'return ' + privateName + ';')
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
          type: 'void',
          body: this.javaSetter || (privateName + ' = val;\n' + isSet + ' = true;')
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
        visibility: 'public',
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
  properties: [
    {
      name: 'java',
      class: 'Boolean',
      value: true
    }
  ],
  methods: [
    function buildJavaClass(cls) {
      if ( this.java ) cls.implements = (cls.implements || []).concat(this.path);
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.InnerClass',
  properties: [
    {
      class: 'Boolean',
      name: 'generateJava',
      value: true
    }
  ],
  methods: [
    function buildJavaClass(cls) {
      if ( ! this.generateJava ) return;

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

      cls.name    = this.model_.name;
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

      // TODO: instead of doing this here, we should walk all Axioms
      // and introuce a new buildJavaAncestorClass() method
      cls.allProperties = this.getAxiomsByClass(foam.core.Property)
        .filter(function(p) { return !!p.javaType && p.javaInfoType && p.generateJava; })
        .map(function(p) {
          return foam.java.Field.create({name: p.name, type: p.javaType});
        });

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
      class: 'Boolean',
      name: 'synchronized',
      value: false
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
    function buildJavaClass(cls) {
      if ( ! this.javaSupport ) return;
      if ( ! this.javaCode && ! this.abstract ) return;

      cls.method({
        name: this.name,
        type: this.javaReturns || 'void',
        visibility: 'public',
        synchronized: this.synchronized,
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
  refines: 'foam.core.Constant',

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'type'
    },
    {
      class: 'Object',
      name: 'value',
    },
    {
      class: 'String',
      name: 'documentation'
    }
  ],

  methods: [
    function buildJavaClass(cls) {
      if ( ! this.type ) {
        this.warn("Skipping constant ", this.name, " with unknown type.");
        return;
      }

      cls.constant({
        name:  this.name,
        type:  this.type || undefined,
        value: this.value,
        documentation: this.documentation || undefined
      });
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.Action',

  properties: [
    {
      class: 'String',
      name: 'javaCode'
    }
  ],

  methods: [
    function buildJavaClass(cls) {
      if ( ! this.javaCode ) return;

      cls.method({
        visibility: 'public',
        name: this.name,
        type: 'void',
        body: this.javaCode
      })
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

  properties: [
    {
      class: 'String',
      name: 'javaType',
      value: 'Object'
    }
  ],

  methods: [
    function buildJavaClass(cls) {
      cls.method({
        type: this.javaType,
        name: 'get' + foam.String.capitalize(this.name),
        body: `return (${this.javaType})getX().get("${this.key}");`,
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

          cls.name = this.model_.name;
          cls.package = this.model_.package;
          cls.implements = (this.implements || []).concat(this.model_.javaExtends || []);

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
    ['javaJSONParser', 'new foam.lib.json.IntParser()'],
    ['javaCSVParser', 'foam.lib.json.IntParser'],
    ['sqlType', 'INT']
  ],

  methods: [
    function createJavaPropertyInfo_(cls) {
      var info = this.SUPER(cls);

      var m = info.getMethod('cast');
      m.body = `return ( o instanceof Number ) ?
        ((Number)o).intValue() :
        ( o instanceof String ) ?
        Integer.valueOf((String) o) :
        (int)o;`;

      return info;
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Byte',

  properties: [
    ['javaType', 'byte'],
    ['javaInfoType', 'foam.core.AbstractBytePropertyInfo'],
    ['javaJSONParser', 'new foam.lib.json.ByteParser()'],
    ['javaCSVParser', 'foam.lib.json.ByteParser'],
    ['sqlType', 'SMALLINT']
  ],

  methods: [
    function createJavaPropertyInfo_(cls) {
      var info = this.SUPER(cls);

      var m = info.getMethod('cast');
      m.body = `return ( o instanceof Number ) ?
        ((Number)o).byteValue() :
        ( o instanceof String ) ?
        Byte.valueOf((String) o) :
        (byte)o;`;

      return info;
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Short',

  properties: [
    ['javaType', 'short'],
    ['javaInfoType', 'foam.core.AbstractShortPropertyInfo'],
    ['javaJSONParser', 'new foam.lib.json.ShortParser()'],
    ['javaCSVParser', 'foam.lib.json.ShortParser'],
    ['sqlType', 'SMALLINT']
  ],

  methods: [
    function createJavaPropertyInfo_(cls) {
      var info = this.SUPER(cls);

      var m = info.getMethod('cast');
      m.body = `return ( o instanceof Number ) ?
        ((Number)o).shortValue() :
        ( o instanceof String ) ?
        Short.valueOf((String) o) :
        (short)o;`;

      return info;
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Long',

  properties: [
    ['javaType', 'long'],
    ['javaInfoType', 'foam.core.AbstractLongPropertyInfo'],
    ['javaJSONParser', 'new foam.lib.json.LongParser()'],
    ['javaCSVParser', 'foam.lib.json.LongParser'],
    ['sqlType', 'BIGINT']
  ],

  methods: [
    function createJavaPropertyInfo_(cls) {
      var info = this.SUPER(cls);

      var m = info.getMethod('cast');
      m.body = `return ( o instanceof Number ) ?
        ((Number)o).longValue() :
        ( o instanceof String ) ?
        Long.valueOf((String) o) :
        (long)o;`;

      return info;
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Float',

  properties: [
    ['javaType', 'double'],
    ['javaInfoType', 'foam.core.AbstractDoublePropertyInfo'],
    ['javaJSONParser', 'new foam.lib.json.FloatParser()'],
    ['javaCSVParser', 'foam.lib.json.FloatParser'],
    ['sqlType', 'DOUBLE PRECISION']
  ],

  methods: [
    function createJavaPropertyInfo_(cls) {
      var info = this.SUPER(cls);

      var m = info.getMethod('cast');
      m.body = `return ( o instanceof Number ) ?
        ((Number)o).doubleValue() :
        ( o instanceof String ) ?
        Float.parseFloat((String) o) :
        (double)o;`;

      return info;
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Enum',

  properties: [
    ['javaType',       'java.lang.Enum'],
    ['javaInfoType',   'foam.core.AbstractEnumPropertyInfo'],
    ['javaJSONParser', 'new foam.lib.json.IntParser()'],
    ['javaCSVParser',  'foam.lib.json.IntParser']
  ],

  methods: [
    function createJavaPropertyInfo_(cls) {
      var info = this.SUPER(cls);

      info.method({
        name: 'getOrdinal',
        visibility: 'public',
        type: 'int',
        args: [
          {
            name: 'o',
            type: 'Object'
          }
        ],
        body: `return ((${this.of.id}) o).getOrdinal();`
      });

      info.method({
        name: 'forOrdinal',
        visibility: 'public',
        type: this.of.id,
        args: [
          {
            name: 'ordinal',
            type: 'int'
          }
        ],
        body: `return ${this.of.id}.forOrdinal(ordinal);`
      });

      info.method({
        name: 'toJSON',
        visibility: 'public',
        type: 'void',
        args: [
          {
            name: 'outputter',
            type: 'foam.lib.json.Outputter'
          },
          {
            name: 'value',
            type: 'Object'
          }
        ],
        body: `outputter.output(getOrdinal(value));`
      });

      info.method({
        name: 'toCSV',
        visibility: 'public',
        type: 'void',
        args: [
          {
            name: 'outputter',
            type: 'foam.lib.csv.Outputter'
          },
          {
            name: 'value',
            type: 'Object'
          }
        ],
        body: `outputter.output(getOrdinal(value));`
      });

      var cast = info.getMethod('cast');
      cast.body = 'if ( o instanceof Integer ) {'
      + 'return forOrdinal((int) o); '
      + '}'
      + ' return (java.lang.Enum) o;';

      return info;
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.AbstractEnum',

  axioms: [
    {
      installInClass: function(cls) {
        cls.buildJavaClass =  function(cls) {
          cls = cls || foam.java.Enum.create();

          cls.name = this.name;
          cls.package = this.package;
          cls.extends = this.extends;
          cls.values = this.VALUES;

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
  refines: 'foam.core.DateTime',

  properties: [
    ['javaType', 'java.util.Date'],
    ['javaInfoType', 'foam.core.AbstractDatePropertyInfo'],
    ['javaJSONParser', 'new foam.lib.json.DateParser()'],
    ['javaCSVParser', 'foam.lib.json.DateParser'],
    ['sqlType', 'TIMESTAMP WITHOUT TIME ZONE']
  ],

  methods: [
    function createJavaPropertyInfo_(cls) {
      var info = this.SUPER(cls);
      var m = info.getMethod('cast');
      m.body = `if ( o instanceof String ) {
        java.util.Date date = new java.util.Date((String) o);
        return date;
        }
        return (java.util.Date) o;`;

      return info;
  }
  ]
});


foam.CLASS({
   refines: 'foam.core.Date',

   properties: [
       ['javaType', 'java.util.Date'],
       ['javaInfoType', 'foam.core.AbstractDatePropertyInfo'],
       ['javaJSONParser', 'new foam.lib.json.DateParser()'],
       ['javaCSVParser', 'foam.lib.json.DateParser'],
       ['sqlType', 'DATE']
   ],

   methods: [
     function createJavaPropertyInfo_(cls) {
       var info = this.SUPER(cls);
       var m = info.getMethod('cast');
       m.body = `if ( o instanceof String ) {
         java.util.Date date = new java.util.Date((String) o);
         return date;
         }
         return (java.util.Date)o;`;

       return info;
     }
   ]
});


foam.CLASS({
  refines: 'foam.core.Map',

  properties: [
    ['javaType', 'java.util.Map'],
    ['javaJSONParser', 'new foam.lib.json.MapParser()'],
    ['javaInfoType', 'foam.core.AbstractObjectPropertyInfo'],
    ['javaFactory', 'return new java.util.HashMap();']
  ]
});


foam.CLASS({
  refines: 'foam.core.List',

  properties: [
    [ 'javaType',       'java.util.List' ],
    [ 'javaFactory',    'return new java.util.ArrayList();' ],
    [ 'javaJSONParser', 'new foam.lib.json.ListParser()' ]
  ]
});


foam.CLASS({
  // Maps JS Property to Java Equivalent PropertyInfo for Java Relationships
  refines: 'foam.core.Property',
  javaType: 'foam.core.PropertyInfo'
});


foam.CLASS({
  refines: 'foam.core.String',

  properties: [
    ['javaType', 'String'],
    ['javaInfoType', 'foam.core.AbstractStringPropertyInfo'],
    ['javaJSONParser', 'new foam.lib.json.StringParser()'],
    ['javaCSVParser', 'foam.lib.json.StringParser'],
    {
      name: 'sqlType',
      expression: function (width) {
        return 'VARCHAR(' + width + ')';
      }
    }
  ],

  methods: [
    function createJavaPropertyInfo_(cls) {
      var info = this.SUPER(cls);

      info.method({
        name: 'getWidth',
        visibility: 'public',
        type: 'int',
        body: 'return ' + this.width + ';'
      });

      return info;
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.FObjectProperty',
  properties: [
    {
      name: 'javaType',
      expression: function(of) {
        return of ? of.id : 'foam.core.FObject';
      }
    },
    ['javaInfoType', 'foam.core.AbstractFObjectPropertyInfo'],
    {
      name: 'javaJSONParser',
      expression: function(of) {
        return 'new foam.lib.json.FObjectParser(' + (of ? of.id + '.class' : '') + ')';
      }
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.StringArray',

  properties: [
    ['javaType',       'String[]'],
    ['javaInfoType', 'foam.core.AbstractArrayPropertyInfo'],
    ['javaJSONParser', 'new foam.lib.json.StringArrayParser()'],
    ['sqlType', 'TEXT[]']
  ],

  methods: [
    function createJavaPropertyInfo_(cls) {
      var info = this.SUPER(cls);
      var compare = info.getMethod('compare');
      compare.body = this.compareTemplate();

      var cast = info.getMethod('cast');
      cast.body = 'Object[] value = (Object[])o;\n'
                + this.javaType + ' ret = new String[value == null ? 0 : value.length];\n'
                + 'if ( value != null ) System.arraycopy(value, 0, ret, 0, value.length);\n'
                + 'return ret;';

      // TODO: figure out what this is used for
      info.method({
        name: 'of',
        visibility: 'public',
        type: 'String',
        body: 'return "String";'
      });

      var isDefaultValue = info.getMethod('isDefaultValue');
      isDefaultValue.body = 'return java.util.Arrays.equals(get_(o), null);'

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
  refines: 'foam.core.Array',

  properties: [
    ['javaType', 'Object[]'],
    ['javaInfoType', 'foam.core.AbstractArrayPropertyInfo'],
    ['javaJSONParser', 'new foam.lib.json.ArrayParser()']
  ],

  methods: [
    function createJavaPropertyInfo_(cls) {
      var info = this.SUPER(cls);
      var compare = info.getMethod('compare');
      compare.body = this.compareTemplate();

      // TODO: Change to ClassInfo return type once primitive support is added
      info.method({
        name: 'of',
        visibility: 'public',
        type: 'String',
        body: 'return "' + (this.of ? this.of.id ? this.of.id : this.of : null) + '";'
      });

      var isDefaultValue = info.getMethod('isDefaultValue');
      isDefaultValue.body = 'return java.util.Arrays.equals(get_(o), null);'

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
      expression: function (of) {
        var id = of ? of.id ? of.id : of : null;
        return 'new foam.lib.json.FObjectArrayParser(' + ( id ? id + '.class' : '') + ')';
      }
    },
    ['javaInfoType', 'foam.core.AbstractFObjectArrayPropertyInfo']
  ],

  methods: [
    function createJavaPropertyInfo_(cls) {
      var info = this.SUPER(cls);
      var compare = info.getMethod('compare');
      compare.body = this.compareTemplate();

      var cast = info.getMethod('cast');
      cast.body = 'Object[] value = (Object[])o;\n'
                + this.javaType + ' ret = new ' + this.of + '[value == null ? 0 : value.length];\n'
                + 'if ( value != null ) System.arraycopy(value, 0, ret, 0, value.length);\n'
                + 'return ret;';
      // TODO: Change to ClassInfo return type once primitive support is added
      info.method({
        name: 'of',
        visibility: 'public',
        type: 'String',
        body: 'return "' + (this.of ? this.of.id ? this.of.id : this.of : null) + '";'
      });

      var isDefaultValue = info.getMethod('isDefaultValue');
      isDefaultValue.body = 'return java.util.Arrays.equals(get_(o), null);'

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
  package: 'foam.core',
  name: 'ArrayList',
  extends: 'foam.core.Array',

  properties: [
    ['javaType', 'ArrayList'],
    ['javaInfoType', 'foam.core.AbstractPropertyInfo'],
    ['javaJSONParser', 'new foam.lib.json.ArrayParser()']
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

  if ( values1.size() > values2.size() ) return 1;
  if ( values1.size() < values2.size() ) return -1;

  int result;
  for ( int i = 0 ; i < values1.size() ; i++ ) {
    result = ((Comparable)values1.get(i)).compareTo(values2.get(i));
    if ( result != 0 ) return result;
  }
  return 0;*/}
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.Boolean',
  properties: [
    ['javaType', 'boolean'],
    ['javaInfoType', 'foam.core.AbstractBooleanPropertyInfo'],
    ['javaJSONParser', 'new foam.lib.json.BooleanParser()'],
    ['javaCSVParser', 'foam.lib.json.BooleanParser'],
    ['sqlType', 'BOOLEAN']
  ],
  methods: [
    function createJavaPropertyInfo_(cls) {
      var info = this.SUPER(cls);

      var m = info.getMethod('cast');
      m.body = 'return ((Boolean) o).booleanValue();'

      return info;
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Object',
  properties: [
    ['javaType', 'Object'],
    ['javaInfoType', 'foam.core.AbstractObjectPropertyInfo'],
    ['javaJSONParser', 'new foam.lib.json.AnyParser()']
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
    ['javaJSONParser', 'new foam.lib.json.FObjectParser()']
  ]
});


foam.CLASS({
  refines: 'foam.core.Reference',
  properties: [
    ['javaType', 'Object'],
    ['javaJSONParser', 'new foam.lib.json.AnyParser()'],
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
    ['javaJSONParser', 'new foam.lib.parse.Fail()'],
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


foam.CLASS({
  refines: 'foam.core.Model',

  properties: [
    {
      class: 'AxiomArray',
      of: 'foam.java.JavaImport',
      name: 'javaImports',
      adaptArrayElement: function(o) {
        return typeof o === 'string' ?
          foam.java.JavaImport.create({import: o}) :
          foam.java.JavaImport.create(o) ;
      }
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Listener',
  properties: [
    {
      class: 'String',
      name: 'javaCode'
    }
  ],
  methods: [
    function buildJavaClass(cls) {
      if ( ! this.javaCode ) return;

      if ( ! this.isMerged && ! this.isFramed ) {
        cls.method({
          name: this.name,
          type: 'void',
          args: this.args && this.args.map(function(a) {
            return {
              name: a.name, type: a.javaType
            };
          }),
          body: this.javaCode
        });
        return;
      }

      cls.method({
        name: this.name + '_real_',
        type: 'void',
        visibility: 'protected',
        args: this.args && this.args.map(function(a) {
          return {
            name: a.name, type: a.javaType
          };
        }),
        body: this.javaCode
      });

      cls.method({
        name: this.name,
        type: 'void',
          args: this.args && this.args.map(function(a) {
            return {
              name: a.name, type: a.javaType
            };
          }),
        body: `${this.name + 'Listener_'}.fire(new Object[] { ${ this.args.map(function(a) { return a.name; }).join(', ') } });`
      })

      var listener = foam.java.Field.create({
        name: this.name + 'Listener_',
        visibility: 'protected',
        type: 'foam.core.MergedListener',
        initializer: foam.java.Class.create({
          anonymous: true,
          extends: 'foam.core.MergedListener',
          methods: [
            foam.java.Method.create({
              name: 'getDelay',
              type: 'int',
              visibility: 'public',
              body: `return ${this.isFramed ? 16 : this.mergeDelay};`
            }),
            foam.java.Method.create({
              name: 'go',
              type: 'void',
              visibility: 'public',
              args: [ foam.java.Argument.create({ type: 'Object[]', name: 'args' }) ],
              body: `${this.name + '_real_'}(${ this.args && this.args.map(function(a, i) { return "(" + a.javaType + ")args[" + i + "]";}).join(', ') });`
            })
          ]
        })
      });

      cls.fields.push(listener);
    }
  ]
});
