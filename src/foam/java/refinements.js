/**
 * @license
 * Copyright 2017,2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.INTERFACE({
  package: 'foam.lib.csv',
  name: 'FromCSVSetter',
  methods: [
    {
      name: 'set',
      args: [
        { type: 'FObject', name: 'obj' },
        { type: 'String',  name: 'str' }
      ]
    }
  ]
});


foam.LIB({
  name: 'foam.java',
  flags: ['java'],
  methods: [
    {
      name: 'asJavaValue',
      code: foam.mmethod({
        String: function asJavaValue(s) {
          return '"' + s.
            replace(/\\/g, "\\\\").
            replace(/"/g, '\\"').
            replace(/\n/g, "\\n") + '"';
        },
        Boolean: function(b) {
          return b ? "true" : "false";
        },
        Number: function(n) {
          return '' + n +
            (n > Math.pow(2, 31) || n < -Math.pow(2,31) ? 'L' : '');
        },
        FObject: function(o) {
          return o.asJavaValue();
        },
        Undefined: function() {
          // TODO: This probably isn't strictly right, but we do it in
          // a number of places.
          return null;
        },
        Array: function(a, prop) {
          return "new " + (prop ? prop.javaType : 'Object[]') + " {" +
            a.map(foam.java.asJavaValue).join(',') +
            '}';
        },
        Null: function(n) { return "null"; },
        Object: function(o) {
          if ( o.asJavaValue ) return o.asJavaValue.call(o, o);
          return `foam.util.Arrays.asMap(new Object[] {
${Object.keys(o).map(function(k, i, a) {
  return `  ${foam.java.asJavaValue(k)}, ${foam.java.asJavaValue(o[k])}` + ((i == a.length-1) ? '' : ',')
}).join('\n')}
})`;
        },
        RegExp: function(o) {
          o = o.toString();
          o = o.slice(o.indexOf('/') + 1, o.lastIndexOf('/'))
          o = o.replace(/\\/g, '\\\\')
          return `java.util.regex.Pattern.compile("${o}")`
        },
        Date: function(d) {
          var n = d.getTime();
          return `new java.util.Date(` + n +
            (n > Math.pow(2, 31) || n < -Math.pow(2,31) ? 'L' : '') + `)`
        }
      })
    },
    {
      name: 'toJavaType',
      code: function(type) {
        return foam.core.type.toType(type).toJavaType();
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'JavaType',
  extends: 'String',
  flags: ['java'],
  properties: [
    {
      name: 'flags',
      value: ['java']
    },
    {
      name: 'expression',
      expression: function(value) {
        // TODO: This is a large hack around the way SHADOW_MAP works.
        // What we really want is a way to specify a default
        // factory/expression but not to use it if the user sets a
        // default value.
        return function(type) {
          return value || foam.java.toJavaType(type);
        }
      }
    },
    {
      name: 'name',
      value: 'javaType'
    }
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'ArgumentJavaRefinement',
  refines: 'foam.core.Argument',
  flags: ['java'],
  properties: [
    { class: 'foam.java.JavaType' }
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'PropertyJavaRefinement',
  refines: 'foam.core.Property',
  flags: ['java'],
  properties: [
    {
      class: 'Boolean',
      name: 'generateJava',
      expression: function(flags) {
        return foam.util.flagFilter(['java'])(this);
      }
    },
    { class: 'foam.java.JavaType' },
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
      class: 'Boolean',
      name: 'synchronized',
      value: false
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
      name: 'javaPreSet'
    },
    {
      class: 'String',
      name: 'javaPostSet'
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
        return foam.java.asJavaValue(value);
      }
    },
    {
      class: 'Boolean',
      name: 'synchronized',
      value: false
    },
    {
      class: 'String',
      name: 'javaValidateObj',
      expression: function(validationPredicates) {
        return validationPredicates
          .map((vp) => {
            var exception = vp.errorMessage ?
              `throw new IllegalStateException(((${this.forClass_}) obj).${vp.errorMessage});` :
              `throw new IllegalStateException(${foam.java.asJavaValue(vp.errorString)});`
            return `if ( ! ${foam.java.asJavaValue(vp.predicate)}.f(obj) ) {
              ${exception}
            }`;
          })
          .join('');
      }
    },
    {
      class: 'String',
      name: 'javaFromCSVLabelMapping',
      value: `
        foam.core.PropertyInfo prop = this;
        map.put(getName(), new foam.lib.csv.FromCSVSetter() {
          public void set(foam.core.FObject obj, String str) {
            prop.set(obj, fromString(str));
          }
        });
      `
    },
    {
      class: 'String',
      name: 'javaToCSV',
      value: 'outputter.outputValue(obj != null ? get(obj) : null);'
    },
    {
      class: 'String',
      name: 'javaToCSVLabel',
      value: 'outputter.outputValue(getName());'
    },
    {
      class: 'String',
      name: 'javaFormatJSON',
      value: null
    },
  ],

  methods: [
    {
      name: 'asJavaValue',
      code: function() {
        return `${this.forClass_}.${foam.String.constantize(this.name)}`;
      }
    },
    function createJavaPropertyInfo_(cls) {
      var isID = false;

      // sourceCls_ isn't set for Proxy delegate properties
      if ( this.sourceCls_ ) {
        if ( this.sourceCls_.model_.ids ) {
          var ids = this.sourceCls_.model_.ids;
          for ( var i = 0 ; i < ids.length ; i++ ) {
            if ( ids[i] == this.name ) {
              isID = true;
              break;
            }
          }
        } else {
          if ( this.name == 'id' ) isID = true;
        }
      }

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
        externalTransient:       this.externalTransient,
        readPermissionRequired:  this.readPermissionRequired,
        writePermissionRequired: this.writePermissionRequired,
        storageTransient:        this.storageTransient,
        storageOptional:         this.storageOptional,
        clusterTransient:        this.clusterTransient,
        xmlAttribute:            this.xmlAttribute,
        xmlTextNode:             this.xmlTextNode,
        sqlType:                 this.sqlType,
        includeInID:             isID,
        includeInDigest:         this.includeInDigest,
        includeInSignature:      this.includeInSignature,
        containsPII:             this.containsPII,
        containsDeletablePII:    this.containsDeletablePII,
        validateObj:             this.javaValidateObj,
        toCSV:                   this.javaToCSV,
        toCSVLabel:              this.javaToCSVLabel,
        fromCSVLabelMapping:     this.javaFromCSVLabelMapping,
        formatJSON:              this.javaFormatJSON,
        sheetsOutput:            this.sheetsOutput
      });
    },

    function generateSetter_() {
      // return user defined setter
      if ( this.javaSetter ) {
        return this.javaSetter;
      }

      var capitalized = foam.String.capitalize(this.name);
      var setter = `assertNotFrozen();\n`;

      // add value assertion
      if ( this.javaAssertValue ) {
        setter += this.javaAssertValue;
      }

      // add pre-set function
      if ( this.javaPreSet ) {
        setter += this.javaPreSet;
      }

      // set value
      // Don't include oldVal if not used
      if ( this.javaPostSet && this.javaPostSet.indexOf('oldVal') != -1 ) {
        setter += `${this.javaType} oldVal = ${this.name}_;\n`;
      }
      setter += `${this.name}_ = val;\n`;
      setter += `${this.name}IsSet_ = true;\n`;

      // add post-set function
      if ( this.javaPostSet ) {
        setter += this.javaPostSet;
      }

      return setter;
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
          synchronized: this.synchronized,
          body: this.javaGetter || ('if ( ! ' + isSet + ' ) {\n' +
            ( this.javaFactory ?
                '  set' + capitalized + '(' + factoryName + '());\n' :
                ' return ' + this.javaValue + ';\n' ) +
            '}\n' +
            'return ' + privateName + ';')
        }).
        method({
          name: 'set' + capitalized,
          // setter: true,
          // Enum setters shouldn't be public.
          visibility: 'public',
          synchronized: this.synchronized,
          args: [
            {
              type: this.javaType,
              name: 'val'
            }
          ],
          type: 'void',
          body: this.generateSetter_()
        }).
        method({
          name: 'clear' + capitalized,
          visibility: 'public',
          type: 'void',
          body: `assertNotFrozen();
${isSet} = false;`
        });

      if ( this.javaFactory ) {
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
        final: true,
        type: 'foam.core.PropertyInfo',
        initializer: this.createJavaPropertyInfo_(cls)
      });

      var info = cls.getField('classInfo_');
      if ( info ) info.addAxiom(cls.name + '.' + constantize);
    }
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'ImplementsJavaRefinement',
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
  package: 'foam.java',
  name: 'InnerClassJavaRefinement',
  refines: 'foam.core.InnerClass',
  flags: ['java'],
  properties: [
    {
      class: 'Boolean',
      name: 'generateJava',
      expression: function(model) {
        return foam.util.flagFilter(['java'])(model);
      }
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
  flags: ['java'],
  methods: [
    function buildJavaClass(cls) {
      // TODO Generate getX() and setX() if contextAware
      cls = cls || foam.java.Class.create();

      cls.name          = this.model_.name;
      cls.package       = this.model_.package;
      cls.source        = this.model_.source;
      cls.abstract      = this.model_.abstract;
      cls.documentation = this.model_.documentation;

      // javaExtends - extends only for java
      cls.extends = this.model_.extends === 'FObject' ?
        undefined : this.model_.extends;

      if ( this.model_.javaExtends )
        cls.extends = this.model_.javaExtends;

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

      var flagFilter = foam.util.flagFilter(['java']);
      var axioms = this.getOwnAxioms().filter(flagFilter);

      for ( var i = 0 ; i < axioms.length ; i++ ) {
        axioms[i].buildJavaClass && axioms[i].buildJavaClass(cls, this);
      }

      // TODO: instead of doing this here, we should walk all Axioms
      // and introuce a new buildJavaAncestorClass() method
      var flagFilter = foam.util.flagFilter(['java']);
      cls.allProperties = this.getAxiomsByClass(foam.core.Property)
        .filter(flagFilter)
        .filter(function(p) {
          return !! p.javaType && p.javaInfoType && p.generateJava;
        })
        .filter(flagFilter)
        .map(function(p) {
          return foam.java.Field.create({ name: p.name, type: p.javaType });
        });

      var properties = this.getAxiomsByClass(foam.core.Property)
        .filter(flagFilter)
        .filter(p => !! p.javaType && p.javaInfoType && p.generateJava)
        .filter(p => p.javaFactory);

      if ( properties.length > 0 ) {
        cls.method({
          visibility: 'public',
          type: 'void',
          name: 'beforeFreeze',
          body: (this.model_.extends === 'FObject' ? '' : 'super.beforeFreeze();\n') +
            properties.map(p => `get${foam.String.capitalize(p.name)}();`)
              .join('\n')
        });
      }

      // If model doesn't explicitly extend anything, inject old AbstractFObject methods
      if ( this.model_.extends === 'FObject' ) {
        cls.field({
          name: "x_",
          visibility: 'protected',
          static: false,
          final: false,
          type: 'foam.core.X',
          initializer: "foam.core.EmptyX.instance();"
        });

        cls.method({
          name: 'getX',
          type: 'foam.core.X',
          visibility: 'public',
          body: 'return x_;'
        });

        cls.method({
          name: 'setX',
          type: 'void',
          visibility: 'public',
          args: [
            {
              name: 'x',
              type: 'foam.core.X'
            }
          ],
          body: 'x_ = x;'
        });

        // Generate Freeze
        cls.field({
          name: "__frozen__",
          visibility: 'protected',
          static: false,
          final: false,
          type: 'boolean',
          initializer: "false;"
        });

        if ( ! this.hasOwnAxiom('freeze') ) {
          cls.method({
            name: 'freeze',
            type: 'foam.core.FObject',
            visibility: 'public',
            body: `beforeFreeze();
__frozen__ = true;
return this;`
          });
        }

        if ( ! this.hasOwnAxiom('isFrozen') ) {
          cls.method({
            name: 'isFrozen',
            type: 'boolean',
            visibility: 'public',
            body: `return __frozen__;`
          });
        }

        // Generate Extras if they don't exist in the model
        if ( ! this.hasOwnAxiom('toString') ) {
          cls.method({
            name: 'toString',
            type: 'String',
            visibility: 'public',
            body: `StringBuilder sb = new StringBuilder();
append(sb);
return sb.toString();`
          });
        }

        if ( ! this.hasOwnAxiom('equals') ) {
          cls.method({
            name: 'equals',
            type: 'boolean',
            visibility: 'public',
            args: [
              {
                name: 'o',
                type: 'Object'
              }
            ],
            body: `if ( o == null ) return false; if ( o.getClass() != getClass() ) return false; return compareTo(o) == 0;`
          });
        }

        // If model doesn't already implement FObject, implement it
        if ( ! cls.implements )
          cls.implements = [ 'foam.core.FObject' ];
        else if ( ! ( cls.implements.includes('foam.core.FObject') || cls.implements.includes('foam.core.FObject') ) )
          cls.implements.push('foam.core.FObject');
      }

      if ( this.hasOwnAxiom('id') ) {
        cls.implements = cls.implements.concat('foam.core.Identifiable');
        cls.method({
          visibility: 'public',
          type: 'Object',
          name: 'getPrimaryKey',
          body: 'return getId();'
        });
      }

      if ( cls.name ) {
        var props = cls.allProperties;

        if ( ! this.model_.hasOwnProperty('javaGenerateDefaultConstructor') ) {
          this.model_.javaGenerateDefaultConstructor = true;
        }

        if ( this.model_.javaGenerateDefaultConstructor ) {
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
        }

        cls.method({
          visibility: 'public',
          name: 'hashCode',
          type: 'int',
          body:
            ['int hash = 1'].concat(props.map(function(f) {
              return 'hash += hash * 31 + foam.util.SafetyUtil.hashCode('+f.name+ '_' +')';
            })).join(';\n') + ';\n'
            +'return hash;\n'
        });

        if ( ! this.hasOwnAxiom('compareTo') ) {
          cls.method({
            visibility: 'public',
            name: 'compareTo',
            type: 'int',
            args:[{ name: 'o', type: 'Object' }],
            body: [''
              +'if ( o == null ) return 1;'
              +'if ( o == this ) return 0;'
              +'if ( ! ( o instanceof foam.core.FObject ) ) return 1;'
              +'if ( getClass() != o.getClass() ) {'
                +'return getClassInfo().getId().compareTo(((foam.core.FObject)o).getClassInfo().getId());'
              +'}'
              +cls.name+' o2 = ('+ cls.name + ') o;\n'
              +'int cmp;\n'].concat(props.map(function(f) {
                return 'cmp = ' + foam.String.constantize(f.name) + '.compare(this, o2);\n'
                  +'if ( cmp != 0 ) return cmp;';
              })).join('\n')+'\n'
              +'  return 0;\n'
          });
        }

        // If the model doesn't explicitly define a value, then compute based
        // on number of properties.
        if ( ! this.model_.hasOwnProperty('javaGenerateConvenienceConstructor') )
          this.model_.javaGenerateConvenienceConstructor = props.length && props.length < 7;

        if ( this.model_.javaGenerateConvenienceConstructor ) {
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
          // Apply builder pattern if not abstract.
          foam.java.Builder.create({ properties: this.getAxiomsByClass(foam.core.Property)
            .filter(flagFilter)
            .filter(function(p) {
            return p.generateJava && p.javaInfoType;
          }) }).buildJavaClass(cls);
        }
      }

      return cls;
    }
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'AbstractMethodJavaRefinement',
  refines: 'foam.core.AbstractMethod',
  flags: ['java'],

  properties: [
    {
      class: 'String',
      name: 'javaCode',
      flags: ['java'],
    },
    { class: 'foam.java.JavaType' },
    {
      class: 'Boolean',
      name: 'final'
    },
    {
      class: 'Boolean',
      name: 'abstract',
      value: false
    },
    { class: 'String', name: 'visibility', value: 'public' },
    {
      class: 'StringArray',
      name: 'javaThrows'
    },
    {
      class: 'Boolean',
      name: 'javaSupport',
      expression: function(flags) {
        return foam.util.flagFilter(['java'])(this);
      }
    },
    {
      class: 'Boolean',
      name: 'remote'
    }
  ],

  methods: [
    function buildMethodInfoInitializer(cls) {
      // Add MethodInfo field for each method
      initializerString = `new foam.core.MethodInfo(){
@Override
public String getName(){
  return "${this.name}";
}
@Override
public Object call(foam.core.X x, Object receiver, Object[] args){
`;
      // See if call needs try catch block
      var exceptions = this.javaThrows.length > 0;
      if ( exceptions ) initializerString += `    try {
        `;

      if ( this.javaType != 'void' ) initializerString += '  return ';
      // Use ((typeCast)receiver).methodName() to call method because of rare collisions between inner and outer class method names
      initializerString += `((${cls.name})receiver).${this.name}(`;
      argsString = '';
      for ( var i = 0 ; this.args && i < this.args.length ; i++ ) {
        if ( this.args[i].javaType )
          argsString += '(' + this.args[i].javaType.replace('...', '[]').replace('final ', '') + `)(args[${ i }])`;
        else if ( this.args[i].type )
          argsString += '(' + this.args[i].type.replace('...', '[]').replace('final ', '') + `)(args[${ i }])`;
        else if ( this.args[i].class )
          argsString += '(' + this.args[i].class.replace('...', '[]').replace('final ', '') + `)(args[${ i }])`;
        else
          continue;
        if ( i != this.args.length - 1 ) argsString += ', ';
      }
      initializerString += argsString + ');\n';

      // Close try block
      if ( exceptions ) { initializerString += `          }
         catch (Throwable t) {
           foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) x.get("logger");
           logger.error(t.getMessage());
         }\n
        `
      }

      if ( exceptions || this.javaType == 'void' ) {
        initializerString += "return null;"
      }

      initializerString += `}
};
`;
      return initializerString;
    },

    function buildJavaClass(cls) {
      if ( ! this.javaSupport ) return;
      if ( ! this.javaCode && ! this.abstract ) return;

      cls.method({
        name: this.name,
        type: this.javaType || 'void',
        visibility: this.visibility,
        static: this.isStatic(),
        abstract: this.abstract,
        final: this.final,
        synchronized: this.synchronized,
        remote: this.remote,
        throws: this.javaThrows,
        documentation: this.documentation,
        args: this.args && this.args.map(function(a) {
          return {
            name: a.name,
            type: a.javaType
          };
        }),
        body: this.javaCode ? this.javaCode : ''
      });

      var initializerString = this.buildMethodInfoInitializer(cls);

      // Create MethodInfo field
      methodInfoName = foam.String.constantize(this.name);
      field = cls.field({
        name: methodInfoName,
        visibility: 'public',
        static: true,
        final: true,
        type: 'foam.core.MethodInfo',
        initializer: initializerString,
        order: 0,
      });

      var info = cls.getField('classInfo_');
      if ( info ) info.addAxiom(cls.name + '.' + methodInfoName);

    },
    function isStatic() {
      return false;
    }
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'MessageJavaRefinement',
  refines: 'foam.i18n.MessageAxiom',
  flags: ['java'],

  methods: [
    function buildJavaClass(cls) {
      if ( this.flags && this.flags.length && this.flags.indexOf('java') == -1 ) {
        return;
      }
      cls.constant({
        name: this.name,
        type: 'String',
        documentation: this.documentation,
        value: foam.java.asJavaValue(this.message)
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'ConstantJavaRefinement',
  refines: 'foam.core.Constant',
  flags: ['java'],

  properties: [
    {
      name: 'javaValue',
      expression: function(value) {
        return foam.java.asJavaValue(value);
      }
    },
    { class: 'foam.java.JavaType' }
  ],

  methods: [
    function buildJavaClass(cls) {
      if ( this.flags && this.flags.length && this.flags.indexOf('java') == -1 ) {
        return;
      }

      if ( ! this.javaType ) {
        this.__context__.warn('Skipping constant ', this.name, ' with unknown type.');
        return;
      }

      cls.constant({
        name: this.name,
        type: this.javaType,
        value: this.javaValue,
        documentation: this.documentation
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'ActionJavaRefinement',
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
        documentation: this.documentation,
        body: this.javaCode
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'MethodJavaRefinement',
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
  package: 'foam.java',
  name: 'ProxiedMethodJavaRefinement',
  refines: 'foam.core.ProxiedMethod',
  flags: ['java'],

  properties: [
    {
      name: 'javaCode',
      getter: function() {
        // TODO: This could be an expression if the copyFrom in createChildMethod
        // didn't finalize its value
        if ( this.name == 'find' ) {
          console.log(this.name, 'returns', this.javaType);
        }
        var code = '';

        if ( this.javaType && this.javaType !== 'void' ) {
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
  package: 'foam.java',
  name: 'ImportJavaRefinement',
  refines: 'foam.core.Import',
  flags: ['java'],

  properties: [
    { class: 'foam.java.JavaType' }
  ],

  methods: [
    function buildJavaClass(cls) {
      if ( this.javaType == 'null' ) return;
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
  package: 'foam.java',
  name: 'FObjectJavaRefinement',
  refines: 'foam.core.FObject',
  flags: ['java'],
  methods: [
    {
      name: 'asJavaValue',
      code: function() {
        var self = this;
        var props = self.cls_.getAxiomsByClass(foam.core.Property)
          .filter(function(a) {
            return self.hasOwnProperty(a.name);
          })
          .map(function(p) {
            return `.set${foam.String.capitalize(p.name)}(${foam.java.asJavaValue(self[p.name], p)})`
          })
        return `
new ${self.cls_.id}.Builder(foam.core.EmptyX.instance())
  ${props.join('\n')}
  .build()
        `
      },
    },
    {
      name: 'toString',
      type: 'String',
      code: foam.core.FObject.prototype.toString
    }
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'AbstractEnumJavaRefinement',
  refines: 'foam.core.AbstractEnum',
  flags: ['java'],
  methods: [
    {
      name: 'asJavaValue',
      code: function() {
        var self = this;
        return `${self.cls_.id}.${self.name}`
      },
    }
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'AbstractInterfaceJavaRefinement',
  refines: 'foam.core.AbstractInterface',
  flags: ['java'],
  axioms: [
    {
      installInClass: function(cls) {
        cls.buildJavaClass = function(cls) {
          cls = cls || foam.java.Interface.create();

          cls.name          = this.model_.name;
          cls.package       = this.model_.package;
          cls.documentation = this.model_.documentation;
          cls.implements    = (this.implements || [])
            .concat(this.model_.javaExtends || []);

          var axioms = this.getAxioms().filter(foam.util.flagFilter(['java']));

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
  package: 'foam.java',
  name: 'JavaCompareImplementor',
  flags: ['java'],

  properties: [
    ['javaCompare', ''],
    ['javaComparePropertyToObject', ''],
    ['javaComparePropertyToValue', '']
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'IntJavaRefinement',
  refines: 'foam.core.Int',
  flags: ['java'],
  mixins: [ 'foam.java.JavaCompareImplementor' ],

  properties: [
    ['javaType',       'int'],
    ['javaInfoType',   'foam.core.AbstractIntPropertyInfo']
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'ByteJavaRefinement',
  refines: 'foam.core.Byte',
  flags: ['java'],
  mixins: [ 'foam.java.JavaCompareImplementor' ],

  properties: [
    ['javaType',       'byte'],
    ['javaInfoType',   'foam.core.AbstractBytePropertyInfo']
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'ShortJavaRefinement',
  refines: 'foam.core.Short',
  flags: ['java'],
  mixins: [ 'foam.java.JavaCompareImplementor' ],

  properties: [
    ['javaType',       'short'],
    ['javaInfoType',   'foam.core.AbstractShortPropertyInfo']
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'LongJavaRefinement',
  refines: 'foam.core.Long',
  flags: ['java'],
  mixins: [ 'foam.java.JavaCompareImplementor' ],

  properties: [
    ['javaType',                     'long'],
    ['javaInfoType',                 'foam.core.AbstractLongPropertyInfo']
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'DoubleJavaRefinement',
  refines: 'foam.core.Double',
  flags: ['java'],
  mixins: [ 'foam.java.JavaCompareImplementor' ],

  properties: [
    ['javaType',       'double'],
    ['javaInfoType',   'foam.core.AbstractDoublePropertyInfo']
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'FloatJavaRefinement',
  refines: 'foam.core.Float',
  flags: ['java'],
  mixins: [ 'foam.java.JavaCompareImplementor' ],

  properties: [
    ['javaType',     'float'],
    ['javaInfoType', 'foam.core.AbstractFloatPropertyInfo']
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'EnumJavaRefinement',
  refines: 'foam.core.Enum',
  flags: ['java'],

  properties: [
    { class:           'foam.java.JavaType' },
    ['javaInfoType',   'foam.core.AbstractEnumPropertyInfo'],
    ['javaJSONParser', 'foam.lib.json.IntParser.instance()'],
    ['javaCSVParser',  'foam.lib.json.IntParser.instance()']
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
  package: 'foam.java',
  name: 'AbstractEnumJavaRefinement',
  refines: 'foam.core.AbstractEnum',
  flags: ['java'],

  axioms: [
    {
      installInClass: function(cls) {
        cls.buildJavaClass = function(cls) {
          cls = cls || foam.java.Enum.create();

          cls.name       = this.name;
          cls.package    = this.package;
          cls.extends    = this.extends;
          cls.values     = this.VALUES;
          cls.implements = [ 'foam.core.FEnum' ];

          // TODO: needed for now because Enums don't extend FObject
          // but a better solution would be to remove setters from
          // Enums and not call asserNotFrozen in first place. KGR
          cls.method({
            name: 'assertNotFrozen',
            visibility: 'public',
            type: 'void',
            body: `/* nop */`
          });

          var flagFilter = foam.util.flagFilter(['java']);
          var axioms = this.getAxioms().filter(flagFilter);
          for ( var i = 0 ; i < axioms.length ; i++ ) {
            axioms[i].buildJavaClass && axioms[i].buildJavaClass(cls);
          }

          var properties = this.getAxiomsByClass(foam.core.Property)
            .filter(flagFilter)
            .filter(p => p.generateJava && p.javaInfoType);

          cls.method({
            name: cls.name,
            args: properties.map(function(p) {
              return {
                name: p.name,
                type: p.javaType
              };
            }),
            body: properties.map(function(p) {
              return `set${foam.String.capitalize(p.name)}(${p.name});`;
            }).join('\n')
          });

          this.VALUES.sort( function (a, b) {
            return (a.ordinal < b.ordinal)
              ? -1
              : 1;
          });

          cls.declarations = this.VALUES.map(function(v) {
            return `${v.name}(${properties.map(p => foam.java.asJavaValue(v[p])).join(', ')})`;
          }).join(',\n  ');

          cls.method({
            name: 'labels',
            type: 'String[]',
            visibility: 'public',
            static: true,
            body: `
return new String[] {
  ${this.VALUES.map(v => foam.java.asJavaValue(v.label)).join(', ')}
};
            `
          });

          cls.method({
            name: 'forOrdinal',
            type: cls.name,
            visibility: 'public',
            static: true,
            args: [ { name: 'ordinal', type: 'int' } ],
            body: `
switch (ordinal) {
${this.VALUES.map(v => `\tcase ${v.ordinal}: return ${cls.name}.${v.name};`).join('\n')}
  default: return null;
}`
          });

          cls.method({
            name: 'forLabel',
            type: cls.name,
            visibility: 'public',
            static: true,
            args: [ { name: 'label', type: 'String' } ],
            body: `
switch (label) {
${this.VALUES.map(v => `\tcase "${v.label}": return ${cls.name}.${v.name};`).join('\n')}
  default: return null;
}`
          });

          return cls;
        };
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'DateTimeJavaRefinement',
  refines: 'foam.core.DateTime',
  flags: ['java'],
  mixins: [ 'foam.java.JavaCompareImplementor' ],

  properties: [
    ['javaInfoType',    'foam.core.AbstractDatePropertyInfo'],
    ['javaJSONParser',  'foam.lib.json.DateParser.instance()'],
    ['sqlType',         'TIMESTAMP WITHOUT TIME ZONE']
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
            return (java.util.Date) fromString((String) o);
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
  package: 'foam.java',
  name: 'DateJavaRefinement',
  refines: 'foam.core.Date',
  flags: ['java'],
  mixins: [ 'foam.java.JavaCompareImplementor' ],

   properties: [
       ['javaInfoType',    'foam.core.AbstractDatePropertyInfo'],
       ['javaJSONParser',  'foam.lib.json.DateParser.instance()'],
       ['sqlType',         'DATE']
   ],

   methods: [
     function createJavaPropertyInfo_(cls) {
       var info = this.SUPER(cls);
       var m = info.getMethod('cast');
       m.body = `
        try {
          if ( o instanceof Number ) {
            return new java.util.Date(((Number) o).longValue());
          }
          if ( o instanceof String ) {
            o = (java.util.Date) fromString((String) o);
          }
          // TODO(Minsun): convert the Date to be Noon time in its timezone
          return (java.util.Date) o;
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }`;

       return info;
     }
   ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'MapJavaRefinement',
  refines: 'foam.core.Map',
  flags: ['java'],

  properties: [
    ['javaType',       'java.util.Map'],
    ['javaInfoType',   'foam.core.AbstractMapPropertyInfo'],
    ['javaJSONParser', 'foam.lib.json.MapParser.instance()'],
    ['javaFactory',    'return new java.util.HashMap();'],
    ['javaCompare',    '']
  ],

  methods: [
    function createJavaPropertyInfo_(cls) {
      var info = this.SUPER(cls);

      var getValueClass = info.getMethod('getValueClass');
      getValueClass.body = 'return java.util.Map.class;';

      return info;
    }
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'ListJavaRefinement',
  refines: 'foam.core.List',
  flags: ['java'],

  properties: [
    ['javaType',       'java.util.List'],
    ['javaInfoType',   'foam.core.AbstractListPropertyInfo'],
    ['javaJSONParser', 'foam.lib.json.ListParser.instance()'],
    ['javaFactory',    'return new java.util.ArrayList();'],
    ['javaCompare',    '']
  ],

  methods: [
    function createJavaPropertyInfo_(cls) {
      var info = this.SUPER(cls);

      var getValueClass = info.getMethod('getValueClass');
      getValueClass.body = 'return java.util.List.class;';

      return info;
    }
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'StringJavaRefinement',
  refines: 'foam.core.String',
  flags: ['java'],
  mixins: [ 'foam.java.JavaCompareImplementor' ],

  properties: [
    ['javaInfoType',    'foam.core.AbstractStringPropertyInfo'],
    {
      name: 'sqlType',
      expression: function(width) {
        return 'VARCHAR(' + width + ')';
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.java',
  name: 'FormattedStringJavaRefinement',
  refines: 'foam.core.FormattedString',
  flags: ['java'],
  documentation: `
    Override setter for formattedstrings so that we only store the unformatted data
    TODO: Add the ability to get a formatted version of the data 
  `,  

  properties: [
    {
      name: 'javaSetter',
      factory: function() {
        return `
          assertNotFrozen();
          // remove all non-numeric characters
          val = val.replaceAll("[^\\\\\d]", "");
          ${this.name}_ = val;
          ${this.name}IsSet_ = true;`;
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.java',
  name: 'FObjectPropertyJavaRefinement',
  refines: 'foam.core.FObjectProperty',
  flags: ['java'],
  properties: [
    ['javaInfoType', 'foam.core.AbstractFObjectPropertyInfo'],
    ['javaCompare',    ''],
    {
      name: 'javaJSONParser',
      expression: function(of) {
        return 'foam.lib.json.FObjectParser.create('
          + (of ? of.id + '.class' : '') + ')';
      }
    },
    {
      name: 'javaFromCSVLabelMapping',
      value: `
        foam.core.AbstractFObjectPropertyInfo prop = this;

        java.util.Map<String, foam.lib.csv.FromCSVSetter> map2 = new java.util.HashMap<>();
        prop.of().getAxiomsByClass(foam.core.PropertyInfo.class).forEach(a -> {
          foam.core.PropertyInfo p = (foam.core.PropertyInfo) a;
          p.fromCSVLabelMapping(map2);
        });

        for ( java.util.Map.Entry<String, foam.lib.csv.FromCSVSetter> entry : map2.entrySet() ) {
          map.put(getName() + "." + entry.getKey(), new foam.lib.csv.FromCSVSetter() {
            public void set(foam.core.FObject obj, String str) {
              try {
                if ( prop.get(obj) == null ) prop.set(obj, prop.of().newInstance());
                entry.getValue().set((foam.core.FObject) prop.get(obj), str);
              } catch ( Throwable t ) {
                t.printStackTrace(); // cannot use logging from logging.
              }
            }
          });
        }
      `
    }
  ],
  methods: [
    function createJavaPropertyInfo_(cls) {
      var info = this.SUPER(cls);
      if ( this.of &&
           this.of !== foam.core.FObject &&
           ! foam.core.InterfaceModel.isInstance(this.of.model_) ) {
        info.method({
          name: 'of',
          visibility: 'public',
          type: 'foam.core.ClassInfo',
          body: `return ${this.of.id}.getOwnClassInfo();`
        });
      }
      return info;
    }
  ],
});

foam.CLASS({
  package: 'foam.java',
  name: 'StringArrayJavaRefinement',
  refines: 'foam.core.StringArray',
  flags: ['java'],

  properties: [
    ['javaType',       'String[]'],
    ['javaInfoType',   'foam.core.AbstractArrayPropertyInfo'],
    ['javaJSONParser', 'foam.lib.json.StringArrayParser.instance()'],
    ['javaFactory',    'return new String[0];'],
    {
      name: 'javaValue',
      expression: function(value) {
        if ( ! value ) {
          return null;
        }

        return 'new String[] {\"' + value.join('\",\"') + '\"}';
      }
    },
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
  result = foam.util.SafetyUtil.compare(values1[i], values2[i]);
  if ( result != 0 ) return result;
}
return 0;*/
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'ArrayJavaRefinement',
  refines: 'foam.core.Array',
  flags: ['java'],

  properties: [
    {
      name: 'javaType',
      expression: function(type) {
        return type ? foam.java.toJavaType(type) : 'Object[]'
      }
    },
    ['javaInfoType',   'foam.core.AbstractArrayPropertyInfo'],
    ['javaJSONParser', 'foam.lib.json.ArrayParser.instance()']
  ],

  methods: [
    function createJavaPropertyInfo_(cls) {
      var info     = this.SUPER(cls);
      var compare  = info.getMethod('compare');
      compare.body = this.compareTemplate();

      // TODO: Change to ClassInfo return type once primitive support is added
      info.method({
        name: 'of',
        visibility: 'public',
        type: 'String',
        body: 'return "' + (this.of ? this.of.id ? this.of.id : this.of : null) + '";'
      });

      if ( this.javaType != 'byte[]' && this.javaType != 'Object[]' )
        info.getMethod('cast').body = 'Object[] a = (Object[]) o; return java.util.Arrays.copyOf(a, a.length, ' + this.javaType + '.class);';

      // TODO: **********************************************************
      // add 'if' to avoid breaking build, but check why, KGR
      var isDefaultValue = info.getMethod('isDefaultValue');
      if ( isDefaultValue ) isDefaultValue.body = 'return java.util.Arrays.equals(get_(o), null);';

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
  package: 'foam.java',
  name: 'FObjectArrayJavaRefinement',
  refines: 'foam.core.FObjectArray',
  flags: ['java'],

  properties: [
    { class: 'foam.java.JavaType' },
    {
      name: 'javaFactory',
      expression: function(type) {
        return `return new ${foam.core.type.toType(type).type.toJavaType()}[0];`;
      }
    },
    {
      name: 'javaJSONParser',
      expression: function(of) {
        var id = of ? of.id ? of.id : of : null;
        return 'foam.lib.json.FObjectArrayParser.create('
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
  flags: ['java'],
  properties: [
    ['javaType', 'ArrayList'],
    ['javaInfoType', 'foam.core.AbstractPropertyInfo'],
    ['javaJSONParser', 'oam.lib.json.ArrayParser.instance()']
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
  package: 'foam.java',
  name: 'BooleanJavaRefinement',
  refines: 'foam.core.Boolean',
  flags: ['java'],
  properties: [
    ['javaType',       'boolean'],
    ['javaInfoType',   'foam.core.AbstractBooleanPropertyInfo'],
    ['javaCompare',    '']
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'ObjectJavaRefinement',
  refines: 'foam.core.Object',
  flags: ['java'],
  properties: [
    ['javaInfoType',    'foam.core.AbstractObjectPropertyInfo'],
    ['javaCompare',    '']
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'ClassJavaRefinement',
  refines: 'foam.core.Class',
  flags: ['java'],
  properties: [
    ['javaType',       'foam.core.ClassInfo'],
    ['javaInfoType',   'foam.core.AbstractClassPropertyInfo'],
    ['javaJSONParser', 'foam.lib.json.ClassReferenceParser.instance()']
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'ProxyJavaRefinement',
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
    ['javaJSONParser', 'foam.lib.json.FObjectParser.instance()']
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'ReferenceJavaRefinement',
  refines: 'foam.core.Reference',
  flags: [ 'java' ],

  properties: [
    {
      name: 'referencedProperty',
      documentation: `
        Used to ensure we use the right types for this
        value in statically typed languages.
      `,
      transient: true,
      expression: function(of) {
        return of.ID.cls_ == foam.core.IDAlias ? of.ID.targetProperty : of.ID;
      }
    },
    { name: 'type',            factory: function() { return this.referencedProperty.type; } },
    { name: 'javaType',        factory: function() { return this.referencedProperty.javaType; } },
    { name: 'javaJSONParser',  factory: function() { return this.referencedProperty.javaJSONParser; } },
    { name: 'javaQueryParser', factory: function() { return this.referencedProperty.javaQueryParser; } },
    { name: 'javaInfoType',    factory: function() { return this.referencedProperty.javaInfoType; } }
  ],

  methods: [
    function buildJavaClass(cls) {
      this.SUPER(cls);
      cls.method({
        name: `find${foam.String.capitalize(this.name)}`,
        visibility: 'public',
        type: this.of.id,
        args: [ { name: 'x', type: 'foam.core.X' } ],
        body: `return (${this.of.id})((foam.dao.DAO) x.get("${this.unauthorizedTargetDAOKey || this.targetDAOKey}")).find_(x, (Object) get${foam.String.capitalize(this.name)}());`
      });
    }
  ]
});

foam.CLASS({
  package: 'foam.java',
  name: 'MultitonJavaRefinement',
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
        final: true,
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
  package: 'foam.java',
  name: 'IDAliasJavaRefinement',
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
  package: 'foam.java',
  name: 'MultiPartIDJavaRefinement',
  refines: 'foam.core.MultiPartID',
  flags: ['java'],

  properties: [
    ['javaJSONParser', 'foam.lib.json.ExprParser.instance()'],
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
    },
    {
      name: 'toString',
      factory: function() {
        var arr = [];
        for ( var i = 0 ; i < this.propNames.length ; i++ ) {
          var name = foam.String.capitalize(this.propNames[i]);

          arr.push(`val.get${name}())`);
        }
        return 'return ' + arr.join(' + "-" + ') + ';';
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'ModelJavaRefinement',
  refines: 'foam.core.Model',
  flags: ['java'],

  properties: [
     {
      class: 'Boolean',
      name: 'javaGenerateDefaultConstructor',
      value: true
    },
    {
      class: 'Boolean',
      name: 'javaGenerateConvenienceConstructor',
      value: true
    },
    {
      class: 'AxiomArray',
      of: 'foam.java.JavaImport',
      name: 'javaImports',
      adaptArrayElement: function(o) {
        return typeof o === 'string' ?
          foam.java.JavaImport.create({import: o}) :
          foam.java.JavaImport.create(o);
      }
    },
    {
      class: 'String',
      name: 'javaName',
      factory: function() { return this.id; }
    },
    {
      class: 'AxiomArray',
      of: 'foam.java.JavaImplements',
      name: 'javaImplements',
      adaptArrayElement: function(o) {
        return foam.String.isInstance(o) ?
          foam.java.JavaImplements.create({ name: o }) :
          foam.java.JavaImplements.create(o);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'ListenerJavaRefinement',
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
  package: 'foam.java',
  name: 'RequiresJavaRefinement',
  refines: 'foam.core.Requires',
  flags: ['java'],
  properties: [
    {
      name: 'javaPath',
      expression: function(path) {
        return path;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'FunctionJavaRefinement',
  refines: 'foam.core.Function',
  flags: ['java'],
  properties: [
    ['javaType', 'java.util.function.Function']
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'PromisedMethodRefinement',
  refines: 'foam.core.PromisedMethod',
  flags: ['java'],
  properties: [
    {
      name: 'javaCode',
      getter: function() {
        return `
          try {
            synchronized ( getDelegate() ) {
              while ( ! getDelegate().isPropertySet("${this.property}") ) getDelegate().wait();
            }
          } catch (Exception e) {
            throw new RuntimeException(e);
          }
          ${this.javaType != 'void' ? 'return ' : ''}getDelegate()
              .${this.name}(${this.args.map(a => a.name).join(', ')});
        `;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'PromisedRefinement',
  refines: 'foam.core.Promised',
  flags: ['java'],
  properties: [
    ['javaInfoType', 'foam.core.AbstractFObjectPropertyInfo'],
    {
      name: 'javaType',
      expression: function(of) { return of; }
    },
    {
      name: 'javaPostSet',
      expression: function(name, stateName) {
        return `
set${foam.String.capitalize(stateName)}(val);
try {
  synchronized ( this ) {
    this.notifyAll();
  }
} catch (Exception e) {
  throw new RuntimeException(e);
}
        `;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'DAOPropertyJavaRefinement',
  refines: 'foam.dao.DAOProperty',
  flags: ['java'],
  properties: [
    ['javaCompare',    '']
  ]
});

foam.CLASS({
  package: 'foam.java',
  name: 'TemplateAxiomJavaRefinement',
  refines: 'foam.templates.TemplateAxiom',
  flags: ['java'],

  requires: [
    'foam.parse.Grammar',
    'foam.templates.TemplateUtil'
  ],

  methods: [

    function buildJavaClass(cls) {
    var result = this.TemplateUtil.create().compileJava(this.template, this.name, this.args || []);
      var args = [{ type: 'java.lang.StringBuilder', name: 'builder' }];
      args.push()
      this.args.forEach(a => args.push({type: a.type, name: a.name}));
      cls.method({
        name: 'build' + this.name.charAt(0).toUpperCase() + this.name.slice(1),
        type: 'void',
        args: args,
        body: `
          ${result};
        `
      });
      return;
    }
  ]
});
