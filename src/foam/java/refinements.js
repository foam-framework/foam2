/**
 * @license
 * Copyright 2017,2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.core.Argument',
  flags: ['java'],
  properties: [
    {
      class: 'String',
      name: 'javaType',
      factory: function() { return this.of; }
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Property',
  flags: ['java'],
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
      value: 'foam.lib.json.AnyParser.instance()'
    },
    {
      class: 'String',
      name: 'javaQueryParser',
      expression: function(javaJSONParser) {
        return javaJSONParser;
      }
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
      name: 'shortName'
    },
    {
      class: 'StringArray',
      name: 'aliases'
    },
    {
      class: 'String',
      name: 'javaSetter'
    },
    {
      class: 'String',
      name: 'javaCloneProperty',
      value: null
    },
    {
      class: 'String',
      name: 'javaDiffProperty',
      value: null
    },
    {
      class: 'String',
      name: 'javaCompare',
      value: 'return foam.util.SafetyUtil.compare(get_(o1), get_(o2));'
    },
    {
      class: 'String',
      name: 'javaComparePropertyToObject',
      value: 'return foam.util.SafetyUtil.compare(cast(key), get_(o));'
    },
    {
      class: 'String',
      name: 'javaComparePropertyToValue',
      value: 'return foam.util.SafetyUtil.compare(cast(key), cast(value));'
    },
    {
      class: 'String',
      name: 'javaAssertValue'
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
    },
    {
      class: 'Boolean',
      name: 'includeInDigest',
      value: true
    },
    {
      class: 'Boolean',
      name: 'includeInSignature',
      value: true
    }
  ],

  methods: [
    function createJavaPropertyInfo_(cls) {
      return foam.java.PropertyInfo.create({
        sourceCls:               cls,
        propName:                this.name,
        propShortName:           this.shortName,
        propAliases:             this.aliases,
        propType:                this.javaType,
        propValue:               this.javaValue,
        propRequired:            this.required,
        cloneProperty:           this.javaCloneProperty,
        diffProperty:            this.javaDiffProperty,
        compare:                 this.javaCompare,
        comparePropertyToValue:  this.javaComparePropertyToValue,
        comparePropertyToObject: this.javaComparePropertyToObject,
        jsonParser:              this.javaJSONParser,
        queryParser:             this.javaQueryParser,
        csvParser:               this.javaCSVParser,
        extends:                 this.javaInfoType,
        networkTransient:        this.networkTransient,
        storageTransient:        this.storageTransient,
        xmlAttribute:            this.xmlAttribute,
        xmlTextNode:             this.xmlTextNode,
        sqlType:                 this.sqlType,
        includeInDigest:         this.includeInDigest,
        includeInSignature:      this.includeInSignature
      });
    },

    function generateSetter_() {
      return this.javaSetter ? this.javaSetter : `
        if ( this.__frozen__ ) throw new UnsupportedOperationException("Object is frozen.");
        assert${foam.String.capitalize(this.name)}(val);
        ${this.name}_ = val;
        ${this.name}IsSet_ = true;
      `;
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
      var isSet = this.name + 'IsSet_';
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
            ( this.javaFactory ?
                '  set' + capitalized + '(' + factoryName + '());\n' :
                ' return ' + this.javaValue + ';\n' ) +
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
          body: this.generateSetter_()
        });

      if ( this.javaFactory ) {
        cls.method({
          name: factoryName,
          visibility: 'protected',
          type: this.javaType,
          body: this.javaFactory
        });
      }

      cls.method({
        name: 'assert' + foam.String.capitalize(this.name),
        visibility: 'public',
        args: [
          {
            type: this.javaType,
            name: 'val'
          }
        ],
        type: 'void',
        body: this.javaAssertValue
      });

      cls.field({
        name: constantize,
        visibility: 'public',
        static: true,
        type: 'foam.core.PropertyInfo',
        initializer: this.createJavaPropertyInfo_(cls)
      });

      var info = cls.getField('classInfo_');
      if ( info ) info.addAxiom(cls.name + '.' + constantize);
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Implements',
  flags: ['java'],
  properties: [
    {
      name: 'java',
      class: 'Boolean',
      value: true
    }
  ],
  methods: [
    function buildJavaClass(cls) {
      if ( this.java ) cls.implements = cls.implements.concat(this.path);
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.InnerClass',
  flags: ['java'],
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
        axioms[i].buildJavaClass && axioms[i].buildJavaClass(cls, this);
      }

      // TODO: instead of doing this here, we should walk all Axioms
      // and introuce a new buildJavaAncestorClass() method
      cls.allProperties = this.getAxiomsByClass(foam.core.Property)
        .filter(function(p) {
          return !! p.javaType && p.javaInfoType && p.generateJava;
        })
        .map(function(p) {
          return foam.java.Field.create({ name: p.name, type: p.javaType });
        });

      cls.method({
        visibility: 'protected',
        type: 'void',
        name: 'beforeFreeze',
        body: 'super.beforeFreeze();\n' + this.getAxiomsByClass(foam.core.Property).
          filter(function(p) { return !! p.javaType && p.javaInfoType && p.generateJava; }).
          filter(function(p) { return p.javaFactory; }).
          map(function(p) {
            return `get${foam.String.capitalize(p.name)}();`
          }).join('\n')
      });

      if ( this.hasOwnAxiom('id') ) {
        cls.implements = cls.implements.concat('foam.core.Identifiable');
        cls.method({
          visibility: 'public',
          type: 'Object',
          name: 'getPrimaryKey',
          body: 'return (Object)getId();'
        });
      }

      cls.method({
        name: 'hashCode',
        type: 'int',
        visibility: 'public',
        body: `return java.util.Objects.hash(${cls.allProperties.map(function(p) {
          return '(Object) ' + p.name + '_';
        }).join(',')});`
      });

      if ( cls.name ) {
        var props = cls.allProperties;

        // No-arg constructor
        cls.method({
          visibility: 'public',
          name: cls.name,
          type: '',
          body: ''
        });

        // Context-oriented constructor
        cls.method({
          visibility: 'public',
          name: cls.name,
          type: '',
          args: [{ type: 'foam.core.X', name: 'x' }],
          body: 'setX(x);'
        });

        if ( props.length ) {
          // All-property constructor
          cls.method({
            visibility: 'public',
            name: cls.name,
            type: '',
            args: props.map(function(f) {
              return { name: f.name, type: f.type };
            }),
            body: props.map(function(f) {
              return 'set' + foam.String.capitalize(f.name) + '(' + f.name + ')';
            }).join(';\n') + ';'
          });

          // Context oriented all-property constructor
          cls.method({
            visibility: 'public',
            name: cls.name,
            type: '',
            args: [{ name: 'x', type: 'foam.core.X' }]
              .concat(props.map(function(f) {
                return { name: f.name, type: f.type };
              })),
            body: ['setX(x)'].concat(props.map(function(f) {
              return 'set' + foam.String.capitalize(f.name) + '(' + f.name + ')';
            })).join(';\n') + ';'
          });
        }

        if ( ! cls.abstract ) {
          // Apply builder pattern if more than 3 properties and not abstract.
          foam.java.Builder.create({ properties: this.getAxiomsByClass(foam.core.Property).filter(function(p) {
            return p.generateJava && p.javaInfoType;
          }) }).buildJavaClass(cls);
        }
      }

      return cls;
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.AbstractMethod',
  flags: ['java'],

  properties: [
    {
      class: 'String',
      name: 'javaCode',
      flags: ['java'],
    },
    {
      class: 'String',
      name: 'javaReturns',
      expression: function(returns) { return returns || '' },
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
        static: this.isStatic(),
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
    },
    function isStatic() {
      return false;
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.Constant',
  flags: ['java'],

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
        this.warn('Skipping constant ', this.name, ' with unknown type.');
        return;
      }

      cls.constant({
        name: this.name,
        type: this.type || undefined,
        value: this.value,
        documentation: this.documentation || undefined
      });
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.Action',
  flags: ['java'],

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
      });
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.Method',
  flags: ['java'],
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
  flags: ['java'],

  properties: [
    {
      name: 'javaCode',
      getter: function() {
        // TODO: This could be an expression if the copyFrom in createChildMethod
        // didn't finalize its value
        if ( this.name == 'find' ) {
          console.log(this.name, 'returns', this.javaReturns);
        }
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
  flags: ['java'],

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
  flags: ['java'],
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
  flags: ['java'],
  axioms: [
    {
      installInClass: function(cls) {
        cls.buildJavaClass = function(cls) {
          cls = cls || foam.java.Interface.create();

          cls.name = this.model_.name;
          cls.package = this.model_.package;
          cls.implements = (this.implements || [])
            .concat(this.model_.javaExtends || []);

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
  flags: ['java'],

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
  flags: ['java'],

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
  flags: ['java'],

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
  flags: ['java'],

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
  flags: ['java'],

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
  flags: ['java'],

  properties: [
    {
      name: 'javaType',
      expression: function(of) {
        return of.id;
      }
    },
    ['javaInfoType', 'foam.core.AbstractEnumPropertyInfo'],
    ['javaJSONParser', 'new foam.lib.json.IntParser()'],
    ['javaCSVParser', 'foam.lib.json.IntParser']
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
      cast.body = `if ( o instanceof Integer ) {
  return forOrdinal((int) o);
}
return (${this.of.id})o;`;

      return info;
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.AbstractEnum',
  flags: ['java'],

  axioms: [
    {
      installInClass: function(cls) {
        cls.buildJavaClass = function(cls) {
          cls = cls || foam.java.Enum.create();

          cls.name = this.name;
          cls.package = this.package;
          cls.extends = this.extends;
          cls.values = this.VALUES;

          cls.field({
            name: '__frozen__',
            visibility: 'protected',
            type: 'boolean',
            initializer: 'false'
          });

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
  flags: ['java'],

  properties: [
    ['javaType', 'java.util.Date'],
    ['javaInfoType', 'foam.core.AbstractDatePropertyInfo'],
    ['javaJSONParser', 'new foam.lib.json.DateParser()'],
    ['javaQueryParser', 'new foam.lib.query.DuringExpressionParser()'],
    ['javaCSVParser', 'foam.lib.json.DateParser'],
    ['sqlType', 'TIMESTAMP WITHOUT TIME ZONE']
  ],

  methods: [
    function createJavaPropertyInfo_(cls) {
      var info = this.SUPER(cls);
      var m = info.getMethod('cast');
      m.body = `
        try {
          if ( o instanceof Number ) {
            return new java.util.Date(((Number) o).longValue());
          } else if ( o instanceof String ) {
            return sdf.get().parse((String) o);
          } else {
            return (java.util.Date) o;
          }
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }`;

      return info;
  }
  ]
});


foam.CLASS({
   refines: 'foam.core.Date',
  flags: ['java'],

   properties: [
       ['javaType', 'java.util.Date'],
       ['javaInfoType', 'foam.core.AbstractDatePropertyInfo'],
       ['javaJSONParser', 'new foam.lib.json.DateParser()'],
       ['javaQueryParser', 'new foam.lib.query.DuringExpressionParser()'],
       ['javaCSVParser', 'foam.lib.json.DateParser'],
       ['sqlType', 'DATE']
   ],

   methods: [
     function createJavaPropertyInfo_(cls) {
       var info = this.SUPER(cls);
       var m = info.getMethod('cast');
      m.body = `
        try {
          if ( o instanceof Number ) {
            return new java.util.Date(((Number) o).longValue());
          } else if ( o instanceof String ) {
            return sdf.get().parse((String) o);
          } else {
            return (java.util.Date) o;
          }
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }`;

       return info;
     }
   ]
});


foam.CLASS({
  refines: 'foam.core.Map',
  flags: ['java'],

  properties: [
    ['javaType', 'java.util.Map'],
    ['javaJSONParser', 'new foam.lib.json.MapParser()'],
    ['javaInfoType', 'foam.core.AbstractMapPropertyInfo'],
    ['javaFactory', 'return new java.util.HashMap();']
  ],

  methods: [
    function createJavaPropertyInfo_(cls) {
      var info = this.SUPER(cls);
      var compare = info.getMethod('compare');
      compare.body = 'return super.compare(o1, o2);';
      return info;
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.List',
  flags: ['java'],

  properties: [
    ['javaType', 'java.util.List'],
    ['javaFactory', 'return new java.util.ArrayList();'],
    ['javaJSONParser', 'new foam.lib.json.ListParser()']
  ]
});


foam.CLASS({
  refines: 'foam.core.String',
  flags: ['java'],

  properties: [
    ['javaType', 'String'],
    ['javaInfoType', 'foam.core.AbstractStringPropertyInfo'],
    ['javaJSONParser', 'new foam.lib.json.StringParser()'],
    ['javaQueryParser', 'new foam.lib.query.StringParser()'],
    ['javaCSVParser', 'foam.lib.csv.CSVStringParser'],
    {
      name: 'sqlType',
      expression: function(width) {
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
  flags: ['java'],
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
        return 'new foam.lib.json.FObjectParser('
          + (of ? of.id + '.class' : '') + ')';
      }
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.StringArray',
  flags: ['java'],

  properties: [
    ['javaType', 'String[]'],
    ['javaInfoType', 'foam.core.AbstractArrayPropertyInfo'],
    ['javaJSONParser', 'new foam.lib.json.StringArrayParser()'],
    ['javaFactory', 'return new String[0];'],
    {
      name: 'javaValue',
      expression: function(value) {
        if ( ! value ) {
          return null;
        } else {
          return 'new String[] {\"' + value.join('\",\"') + '\"}';
        }
      }
    },
    ['sqlType', 'TEXT']
  ],

  methods: [
    function createJavaPropertyInfo_(cls) {
      var info = this.SUPER(cls);
      var compare = info.getMethod('compare');
      compare.body = this.compareTemplate();

      var cast = info.getMethod('cast');
      cast.body = 'Object[] value = (Object[])o;\n'
                + this.javaType
                + ' ret = new String[value == null ? 0 : value.length];\n'
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
      isDefaultValue.body = 'return java.util.Arrays.equals(get_(o), null);';

      return info;
    }
  ],

  templates: [
    {
        name: 'compareTemplate',
        template: function() {
/* <%= this.javaType %> values1 = get_(o1);
<%= this.javaType %> values2 = get_(o2);
if ( values1 == null && values2 == null ) return 0;
if ( values2 == null ) return 1;
if ( values1 == null ) return -1;

if ( values1.length > values2.length ) return 1;
if ( values1.length < values2.length ) return -1;

int result;
for ( int i = 0 ; i < values1.length ; i++ ) {
  result = ((Comparable)values1[i]).compareTo(values2[i]);
  if ( result != 0 ) return result;
}
return 0;*/
      }
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Array',
  flags: ['java'],

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
      isDefaultValue.body = 'return java.util.Arrays.equals(get_(o), null);';

      return info;
    }
  ],

  templates: [
    {
      name: 'compareTemplate',
      template: function() {
/* <%= this.javaType %> values1 = get_(o1);
<%= this.javaType %> values2 = get_(o2);
if ( values1 == null && values2 == null ) return 0;
if ( values2 == null ) return 1;
if ( values1 == null ) return -1;

if ( values1.length > values2.length ) return 1;
if ( values1.length < values2.length ) return -1;

int result;
for ( int i = 0 ; i < values1.length ; i++ ) {
  result = ((Comparable)values1[i]).compareTo(values2[i]);
  if ( result != 0 ) return result;
}
return 0;*/
      }
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.FObjectArray',
  flags: ['java'],

  properties: [
    {
      name: 'javaType',
      expression: function(of) {
        return of + '[]';
      }
    },
    {
      name: 'javaJSONParser',
      expression: function(of) {
        var id = of ? of.id ? of.id : of : null;
        return 'new foam.lib.json.FObjectArrayParser('
          + ( id ? id + '.class' : '') + ')';
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
                + this.javaType + ' ret = new '
                + this.of + '[value == null ? 0 : value.length];\n'
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
      isDefaultValue.body = 'return java.util.Arrays.equals(get_(o), null);';

      return info;
    }
  ],

  templates: [
    {
      name: 'compareTemplate',
      template: function() {
/* <%= this.javaType %> values1 = get_(o1);
<%= this.javaType %> values2 = get_(o2);
if ( values1 == null && values2 == null ) return 0;
if ( values2 == null ) return 1;
if ( values1 == null ) return -1;

if ( values1.length > values2.length ) return 1;
if ( values1.length < values2.length ) return -1;

int result;
for ( int i = 0 ; i < values1.length ; i++ ) {
  result = ((Comparable)values1[i]).compareTo(values2[i]);
  if ( result != 0 ) return result;
}
return 0;*/
      }
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
  flags: ['java'],
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
      m.body = 'return ((Boolean) o).booleanValue();';

      return info;
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Object',
  flags: ['java'],
  properties: [
    ['javaType', 'Object'],
    ['javaInfoType', 'foam.core.AbstractObjectPropertyInfo'],
    ['javaJSONParser', 'foam.lib.json.AnyParser.instance()'],
    ['javaQueryParser', 'foam.lib.query.AnyParser.instance()']
  ]
});


foam.CLASS({
  refines: 'foam.core.Class',
  flags: ['java'],
  properties: [
    ['javaType', 'foam.core.ClassInfo'],
    ['javaInfoType', 'foam.core.AbstractObjectPropertyInfo'],
    ['javaJSONPaser', 'new foam.lib.parse.Fail()']
  ]
});


foam.CLASS({
  refines: 'foam.core.Proxy',
  flags: ['java'],
  properties: [
    {
      name: 'javaType',
      expression: function(of) {
        return of ? of : 'Object';
      }
    },
    ['javaInfoType', 'foam.core.AbstractFObjectPropertyInfo'],
    ['javaJSONParser', 'new foam.lib.json.FObjectParser()']
  ]
});


foam.CLASS({
  refines: 'foam.core.Reference',
  flags: [ 'java' ],

  properties: [
    {
      name: 'referencedProperty',
      transient: true,
      factory: function() {
        var idProp = this.of.ID.cls_ == foam.core.IDAlias ? this.of.ID.targetProperty : this.of.ID;

        idProp = idProp.clone();
        idProp.name = this.name;

        return idProp;
      }
    },
    { name: 'javaType',        factory: function() { return this.referencedProperty.javaType; } },
    { name: 'javaJSONParser',  factory: function() { return this.referencedProperty.javaJSONParser; } },
    { name: 'javaQueryParser', factory: function() { return this.referencedProperty.javaQueryParser; } },
    { name: 'javaInfoType',    factory: function() { return this.referencedProperty.javaInfoType; } }
  ],

  methods: [
    function buildJavaClass(cls) {
      // Disable super behaviour on purpose.
      // this.SUPER(cls);

      // Install a renamed copy of the refernced model's id property instead
      this.referencedProperty.buildJavaClass(cls);

      cls.method({
        name: `find${foam.String.capitalize(this.name)}`,
        visibility: 'public',
        type: this.of.id,
        args: [ { name: 'x', type: 'foam.core.X' } ],
        body: `return (${this.of.id})((foam.dao.DAO) x.get("${this.targetDAOKey}")).find_(x, (Object) get${foam.String.capitalize(this.name)}());`
      });
    }
  ]
});

foam.CLASS({
  refines: 'foam.pattern.Multiton',
  flags: ['java'],

  properties: [
    {
      name: 'javaName',
      value: 'Multiton',
    },
    {
      name: 'javaInfoName',
      expression: function(javaName) {
        return foam.String.constantize(this.javaName);
      },
    },
  ],

  methods: [
    function buildJavaClass(cls) {
      var info = cls.getField('classInfo_');
      if ( info ) info.addAxiom(cls.name + '.' + this.javaInfoName);

      cls.field({
        name: this.javaInfoName,
        visibility: 'public',
        static: true,
        type: 'foam.core.MultitonInfo',
        initializer: `
new foam.core.MultitonInfo("${this.javaName}", ${cls.name}.${foam.String.constantize(this.property)});
        `,
        order: 1,
      });
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.IDAlias',
  flags: ['java'],
  properties: [
    {
      name: 'javaGetter',
      factory: function() {
        return `return get${foam.String.capitalize(this.propName)}();`;
      }
    },
    {
      name: 'javaSetter',
      factory: function() {
        return `set${foam.String.capitalize(this.targetProperty.name)}((${this.targetProperty.javaType})val);`;
      }
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.MultiPartID',
  flags: ['java'],

  properties: [
    // No point parsing it, multi part id is always transient.
    ['javaJSONParser', 'new foam.lib.parse.Fail()'],
    {
      name: 'javaGetter',
      factory: function() {
        var str = `return new ${this.of.id}.Builder(getX()).
`;
        for ( var i = 0 ; i < this.propNames.length ; i++ ) {
          var name = foam.String.capitalize(this.propNames[i]);

          str += `  set${name}(get${name}()).
`;
        }

        return str += '  build();';
      }
    },
    {
      name: 'javaSetter',
      factory: function() {
        var str = '';

        for ( var i = 0 ; i < this.propNames.length ; i++ ) {
          var name = foam.String.capitalize(this.propNames[i]);

          str += `set${name}(val.get${name}());
`;
        }

        return str;
      }
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Model',
  flags: ['java'],

  properties: [
    {
      class: 'AxiomArray',
      of: 'foam.java.JavaImport',
      name: 'javaImports',
      adaptArrayElement: function(o) {
        return typeof o === 'string' ?
          foam.java.JavaImport.create({import: o}) :
          foam.java.JavaImport.create(o);
      }
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Listener',
  flags: ['java'],
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
        body: `${this.name + 'Listener_'}.fire(new Object[] { ${ this.args.map(function(a) {
          return a.name;
        }).join(', ') } });`
      });

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
              args: [foam.java.Argument.create({ type: 'Object[]', name: 'args' })],
              body: `${this.name + '_real_'}(${ this.args && this.args.map(function(a, i) {
                return '(' + a.javaType + ')args[' + i + ']';
              }).join(', ') });`
            })
          ]
        })
      });

      cls.fields.push(listener);
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.Requires',
  flags: ['java'],
  properties: [
    {
      name: 'javaPath',
      expression: function(path) {
        return path;
      },
    },
    {
      name: 'javaReturns',
      expression: function(javaPath) {
        return this.lookup(javaPath).model_.id;
      },
    },
  ]
});

foam.CLASS({
  refines: 'foam.core.Function',
  flags: ['java'],
  properties: [
    ['javaType', 'java.util.function.Function']
  ]
});
