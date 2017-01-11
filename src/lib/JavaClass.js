/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.java',
  name: 'Code',

  properties: [
    {
      class: 'String',
      name: 'data'
    }
  ],

  methods: [
    function outputJava(o) {
      var lines = this.data.split('\n');
      for ( var i = 0 ; i < lines.length ; i++ ) {
        o.indent();
        o.out(lines[i], '\n');
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'CodeProperty',
  extends: 'Property',
  properties: [
    {
      name: 'adapt',
      value: function(o, v) {
        if ( typeof v === 'string' ) return foam.java.Code.create({ data: v });
        return v;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'Outputter',

  properties: [
    {
      name: 'indentLevel_',
      value: 0
    },
    {
      name: 'indentStr',
      value: '  '
    },
    {
      class: 'String',
      name: 'buf_'
    }
  ],

  methods: [
    function indent() {
      for ( var i = 0 ; i < this.indentLevel_ ; i++ ) this.buf_ += this.indentStr;
      return this;
    },

    function out() {
      for ( var i = 0 ; i < arguments.length ; i++ ) {
        if ( arguments[i] != null && arguments[i].outputJava ) { arguments[i].outputJava(this); }
        else this.buf_ += arguments[i];
      }
      return this;
    },

    function increaseIndent() {
      this.indentLevel_++;
    },

    function decreaseIndent() {
      this.indentLevel_--;
    }
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'Argument',

  properties: [
    'type',
    'name'
  ],

  methods: [
    function outputJava(o) {
      o.out(this.type, ' ', this.name);
    }
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'InterfaceMethod',

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'visibility'
    },
    'type',
    {
      class: 'FObjectArray',
      of: 'foam.java.Argument',
      name: 'args'
    },
    {
      name: 'body',
      documentation: 'Dummy property to silence warnings',
      setter: function() {},
      getter: function() {}
    }
  ],

  methods: [
    function outputJava(o) {
      o.indent();
      o.out(this.visibility, this.visibility ? ' ' : '',
        this.type, ' ', this.name, '(');

      for ( var i = 0 ; this.args && i < this.args.length ; i++ ) {
        o.out(this.args[i]);
        if ( i != this.args.length - 1 ) o.out(', ');
      }

      o.out(');\n');
    }
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'Method',

  properties: [
    'name',
    { class: 'String', name: 'visibility' },
    'static',
    'type',
    {
      class: 'FObjectArray',
      of: 'foam.java.Argument',
      name: 'args'
    },
    { class: 'foam.java.CodeProperty', name: 'body' }
  ],

  methods: [
    function outputJava(o) {
      o.indent();
      o.out(this.visibility, this.visibility ? ' ' : '',
        this.static ? 'static ' : '',
        this.type, ' ',
        this.name, '(');
      for ( var i = 0 ; this.args && i < this.args.length ; i++ ) {
        o.out(this.args[i]);
        if ( i != this.args.length - 1 ) o.out(', ');
      }
      o.out(')', ' {\n');

      o.increaseIndent();
      o.out(this.body);
      o.decreaseIndent();
      o.indent();
      o.out('}');
    }
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'Field',

  properties: [
    'name',
    { class: 'String', name: 'visibility' },
    'static',
    'type',
    'final',
    {
      class: 'Int',
      name: 'order',
      value: 0
    },
    { class: 'foam.java.CodeProperty', name: 'initializer' }
  ],

  methods: [
    function outputJava(o) {
      o.indent();
      o.out(this.visibility, this.visibility ? ' ' : '',
        this.static ? 'static ' : '',
        this.final ? 'final ' : '',
        this.type, ' ', this.name);
      if ( this.initializer ) {
        o.increaseIndent();
        o.out(' = ', this.initializer);
        o.decreaseIndent();
      }
      o.out(';');
    }
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'Class',

  properties: [
    'name',
    'package',
    'implements',
    {
      class: 'String',
      name: 'visibility',
      value: 'public'
    },
    {
      class: 'Boolean',
      name: 'static',
      value: false
    },
    'abstract',
    'extends',
    {
      class: 'FObjectArray',
      of: 'foam.java.Method',
      name: 'methods',
      factory: function() { return []; }
    },
    {
      class: 'FObjectArray',
      of: 'foam.java.Field',
      name: 'fields',
      factory: function() { return []; }
    },
    {
      class: 'FObjectArray',
      of: 'foam.java.Class',
      name: 'classes',
      factory: function() { return []; }
    },
    'imports',
    {
      class: 'Boolean',
      name: 'anonymous',
      value: false
    },
    {
      class: 'Boolean',
      name: 'innerClass',
      value: false
    },
    {
      name: 'extras',
      factory: function() { return []; }
    }
  ],

  methods: [
    function getField(name) {
      for ( var i  = 0 ; this.fields && i < this.fields.length ; i++ ) {
        if ( this.fields[i].name === name ) return this.fields[i];
      }
    },
    function getMethod(name) {
      for ( var i  = 0 ; this.methods && i < this.methods.length ; i++ ) {
        if ( this.methods[i].name === name ) return this.methods[i];
      }
    },
    function field(f) {
      if ( ! foam.core.FObject.isInstance(f) ) {
        f = ( f.class ? foam.lookup(f.class) : foam.java.Field ).create(f, this);
      }

      this.fields.push(f);
      return this;
    },

    function method(m) {
      this.methods.push(foam.java.Method.create(m));
      return this;
    },

    function outputJava(o) {
      if ( this.anonymous ) {
        o.out('new ', this.extends, '()');
      } else if ( ! this.innerClass ) {
        o.out('// DO NOT MODIFY BY HAND.\n');
        o.out('// GENERATED CODE (adamvy@google.com)\n');
        o.out('package ', this.package, ';\n\n');

        this.imports && this.imports.forEach(function(i) {
          o.out(i, ';\n');
        });

        o.out('\n');
      } else {
        o.indent();
      }

      if ( ! this.anonymous ) {
        o.out(this.visibility, ' ', this.static ? 'static ' : '');
        o.out(this.abstract ? 'abstract ' : '', 'class ', this.name);

        if ( this.extends ) {
          o.out(' extends ', this.extends);
        }

        if ( this.implements && this.implements.length ) {
          o.out(' implements ');
          for ( var i = 0 ; i < this.implements.length ; i++ ) {
            o.out(this.implements[i]);
            if ( i != this.implements.length - 1 ) o.out(', ');
          }
        }
      }

      o.out(' {\n');

      o.increaseIndent();
      this.fields.sort(function(o1, o2) {
        return o2.order < o1.order
      }).forEach(function(f) { o.out(f, '\n'); });
      this.methods.forEach(function(f) { o.out(f, '\n'); });
      this.classes.forEach(function(c) { o.out(c, '\n'); });
      this.extras.forEach(function(c) { o.out(c, '\n'); });
      o.decreaseIndent();
      o.indent();
      o.out('}');
    },
    function toJavaSource() {
      var output = foam.java.Outputter.create();
      output.out(this);
      return output.buf_;
    }
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'Interface',

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'package'
    },
    {
      class: 'StringArray',
      name: 'extends'
    },
    {
      class: 'String',
      name: 'visibility',
      value: 'public'
    },
    {
      class: 'FObjectArray',
      of: 'foam.java.InterfaceMethod',
      name: 'methods',
      factory: function() { return []; }
    }
  ],

  methods: [
    function method(m) {
      this.methods.push(foam.java.InterfaceMethod.create(m));
      return this;
    },

    function getMethod(name) {
      return this.methods.find(function(m) { return m.name == name; });
    },

    function field() {
    },

    function toJavaSource() {
      var output = foam.java.Outputter.create();
      output.out(this);
      return output.buf_;
    },

    function outputJava(o) {
      if ( this.package ) { o.out('package ', this.package, ';\n\n'); }

      o.out(this.visibility, this.visibility ? ' ' : '',
        'interface ', this.name);

      if ( this.hasDefaultValue('extends') ) {
        o.out(' extends ');
        for ( var i = 0 ; i < this.extends.length ; i++ ) {
          o.out(this.extends[i]);
          if ( i != this.extends.length - 1 ) o.out(', ');
        }
      }

      o.out(' {\n');

      o.increaseIndent();
      for ( var i = 0 ; i < this.methods.length ; i++ ) {
        o.indent();
        o.out(this.methods[i]);
        o.out('\n');
      }

      o.decreaseIndent();
      o.out('}');
    }
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'ClassInfo',

  properties: [
    {
      name: 'name',
      value: 'classInfo_'
    },
    {
      name: 'id'
    },
    {
      name: 'properties',
      factory: function() { return []; }
    },
    {
      name: 'order',
      value: 1
    }
  ],

  methods: [
    function addProperty(id) {
      this.properties.push(id);
    },

    function outputJava(o) {
      o.indent();
      o.out('private static final foam.core.ClassInfo classInfo_ = new foam.core.ClassInfoImpl()\n')
      o.increaseIndent();
      o.indent();
      o.out('.setId("', this.id, '")');
      for ( var i = 0 ; i < this.properties.length ; i++ ) {
        o.out('\n');
        o.indent();
        o.out('.addProperty(', this.properties[i], ')');
      }
      o.decreaseIndent()
      o.out(';');
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
      })
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
  package: 'foam.java',
  name: 'PropertyInfo',
  extends: 'foam.java.Class',

  properties: [
    ['anonymous', true],
    'propName',
    {
      class: 'Boolean',
      name: 'transient',
      value: false
    },
    {
      name: 'getterName',
      expression: function(propName) {
        return 'get' + foam.String.capitalize(propName);
      }
    },
    {
      name: 'setterName',
      expression: function(propName) {
        return 'set' + foam.String.capitalize(propName);
      }
    },
    'sourceCls',
    'propType',
    'jsonParser',
    {
      name: 'methods',
      factory: function() {
        return [
          {
            name: 'getName',
            visibility: 'public',
            type: 'String',
            body: 'return "' + this.propName + '";'
          },
          {
            name: 'get',
            visibility: 'public',
            type: 'Object',
            args: [ { name: 'o', type: 'Object' } ],
            body: 'return get_(o);'
          },
          {
            name: 'get_',
            type: this.propType,
            visibility: 'public',
            args: [ { name: 'o', type: 'Object' } ],
            body: 'return ((' + this.sourceCls.name + ')o).' + this.getterName + '();'
          },
          {
            name: 'set',
            type: 'void',
            visibility: 'public',
            args: [ { name: 'o', type: 'Object' }, { name: 'value', type: 'Object' } ],
            body: '((' + this.sourceCls.name + ')o).' + this.setterName + '(cast(value));'
          },
          {
            name: 'cast',
            type: this.propType,
            visibility: 'public',
            args: [ { name: 'o', type: 'Object' } ],
            body: 'return (' + this.propType + ')o;'
          },
          {
            name: 'compare',
            type: 'int',
            visibility: 'public',
            args: [ { name: 'o1', type: 'Object' }, { name: 'o2', type: 'Object' } ],
            body: 'return compareValues(get_(o1),get_(o2));'
          },
          {
            name: 'jsonParser',
            type: 'foam.lib.parse.Parser',
            visibility: 'public',
            body: 'return new ' + this.jsonParser + '();'
          },
          {
            name: 'getTransient',
            type: 'boolean',
            visibility: 'public',
            body: 'return ' + this.transient + ';'
          }
        ]
      }
    }
  ],
  methods: [
  ]
});


foam.CLASS({
  refines: 'foam.core.Property',
  properties: [
    {
      class: 'String',
      name: 'javaFactory'
    },
    {
      class: 'String',
      name: 'javaValue',
      expression: function(value) {
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
  refines: 'foam.core.Array',

  properties: [
    ['javaType', 'Object[]'],
    ['javaInfoType', 'foam.core.AbstractPropertyInfo'],
    ['javaJSONParser', 'foam.lib.json.ArrayParser']
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
  ],

  methods: [
    function createJavaPropertyInfo_(cls) {
      var info = this.SUPER(cls);
      var compare = info.getMethod('compare');
      compare.body = this.compareTemplate();
      return info;
    }
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'MultiPartGetter',

  properties: [
    'props',
    'clsName'
  ],

  methods: [
    function outputJava(o) {
      var props = this.props;
      if ( props.length == 1 ) {
        o.indent();
        o.out('return get', foam.String.capitalize(props[0].name), '();\n');
        return;
      }

      o.indent();
      o.out('return new foam.core.CompoundKey(new Object[] {\n');
      o.increaseIndent();
      for ( var i = 0 ; i < props.length ; i++ ) {
        o.indent();
        o.out('get', foam.String.capitalize(props[i].name), '()');
        if ( i != props.length - 1 ) o.out(',\n');
      }
      o.decreaseIndent();
      o.out('\n');
      o.indent()
      o.out('}, new foam.core.PropertyInfo[] {\n');
      o.increaseIndent();
      o.indent();
      for ( var i = 0 ; i < props.length ; i++ ) {
        o.out(this.clsName, '.', foam.String.constantize(props[i].name));
        if ( i != props.length - 1 ) o.out(',\n');
      }
      o.out('\n');
      o.decreaseIndent();
      o.indent()
      o.out('});\n');
    }
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'MultiPartSetter',

  properties: [
    'props',
    'clsName'
  ],

  methods: [
    function outputJava(o) {
      var props = this.props;
      if ( props.length == 1 ) {
        o.indent();
        o.out('set', foam.String.capitalize(props[0].name), '((', props[0].javaType, ')val);\n');
        o.indent();
        o.out('return this;\n');
        return;
      }

      o.indent();
      o.out('Object[] values = val.getValues();\n');
      for ( var i = 0 ; i < props.length ; i++ ) {
        o.indent();
        o.out('set', foam.String.capitalize(props[i].name), '((', props[i].javaType, ')values[', i, ']);\n');
      }
      o.indent();
      o.out('return this;\n');
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.MultiPartID',

  properties: [
    ['javaType', 'Object'],
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


foam.CLASS({
  refines: 'foam.core.ProxiedMethod',
  properties: [
    {
      name: 'javaCode',
      expression: function(name, property, returns) {
        var code = '';

        if ( this.returns ) {
          code += 'return ';
        }

        code += 'get' + foam.String.capitalize(property) + '()';
        code += '.' + name + '(';

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
      m.body = 'return ( o instanceof Long ) ?'
             + '((Long)o).intValue() :'
             + '(int)o;'
      return info;
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.FObjectProperty',
  methods: [
    function createJavaPropertyInfo_(cls) {
      var info = this.SUPER(cls);
      if ( this.hasDefaultValue('javaJSONParser') ) {
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