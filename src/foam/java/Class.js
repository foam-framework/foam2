/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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
  name: 'Class',

  requires: [
    'foam.java.Argument',
    'foam.java.Method'
  ],

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
      class: 'Array',
      name: 'implements'
    },
    {
      class: 'String',
      name: 'visibility',
      value: 'public'
    },
    {
      class: 'Boolean',
      name: 'static'
    },
    {
      class: 'Boolean',
      name: 'final'
    },
    {
      class: 'Boolean',
      name: 'abstract'
    },
    {
      class: 'String',
      name: 'extends'
    },
    {
      class: 'FObjectArray',
      of: 'foam.java.Constant',
      name: 'constants',
      factory: function() { return []; }
    },
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
      of: 'foam.java.Field',
      name: 'allProperties',
      factory: function() { return []; }
    },
    {
      class: 'FObjectArray',
      of: 'foam.java.Class',
      name: 'classes',
      factory: function() { return []; }
    },
    {
      name: 'imports',
      factory: function() { return []; }
    },
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
      class: 'Boolean',
      name: 'isEnum',
      value: false
    },
    {
      name: 'extras',
      factory: function() { return []; }
    }
  ],

  methods: [
    function fromModel(model) {
      this.name     = model.name;
      this.package  = model.package;
      this.abstract = model.abstract;

      cls.extends = this.model_.extends === 'FObject' ?
        undefined : this.model_.extends;

      if ( this.model_.javaExtends )
        cls.extends = this.model_.javaExtends;
    },

    function getField(name) {
      for ( var i  = 0 ; this.fields && i < this.fields.length ; i++ ) {
        if ( this.fields[i].name === name ) return this.fields[i];
      }
    },

    function getConstant(name) {
      for ( var i  = 0 ; this.constants && i < this.constants.length ; i++ ) {
        if ( this.constants[i].name === name ) return this.constants[i];
      }
    },

    function getMethod(name) {
      for ( var i  = 0 ; this.methods && i < this.methods.length ; i++ ) {
        if ( this.methods[i].name === name ) return this.methods[i];
      }
    },

    function field(f) {
      if ( ! foam.core.FObject.isInstance(f) ) {
        f = ( f.class ? this.__context__.lookup(f.class) : foam.java.Field ).create(f, this);
      }

      this.fields.push(f);
      return this;
    },

    function constant(c) {
      this.constants.push(foam.java.Constant.create(c));
      return this;
    },

    function method(m) {
      this.methods.push(foam.java.Method.create(m));
      return this;
    },

    function outputJava(o) {
      var self = this;

      if ( this.anonymous ) {
        o.out('new ', this.extends, '()');
      } else if ( ! this.innerClass ) {
        o.out('// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!\n');
        if ( typeof this.source === 'undefined' ) {
          o.out('// SOURCE: <implied class>\n');
        } else {
          o.out('// SOURCE: ' + this.source + '\n');
        }

        o.out('package ', this.package, ';\n\n');

        this.imports.forEach(function(i) {
          o.out('import ' + i, ';\n');
        });

        o.out('\n');

      } else {
        o.indent();
      }

      if ( this.documentation ) {
        str = foam.java.Util.removeSpacing(this.documentation);
        lines = foam.java.Util.limitSplit(str, 25);
        o.indent();
        o.out('/**\n');
        for ( i = 0 ; i < lines.length ; i++ ) {
          o.indent();
          o.out('* ' + lines[i]);
          o.out('\n');
        }
        o.indent();
        o.out('*/\n');
      }

      if ( ! this.anonymous ) {
        o.out(this.visibility, ' ', this.static ? 'static ' : '');

        o.out(this.final    ? 'final '    : '');
        o.out(this.abstract ? 'abstract ' : '');
        o.out(this.isEnum   ? 'enum '     : 'class ', this.name);

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

      o.out(' {\n\n');

      o.increaseIndent();

      // Look if the class has a method tagged 'remote' : see CPF-278
      var isORBitalDAOed = false;
      for ( m in this.methods ) {
        if ( m.remote ) {
          isORBitalDAOed = true;
          break;
        }
      }
      if ( isORBitalDAOed ) {
        //TODO: add necessary constructs to generated java class that needs to be an ORBitalDAO'able

      }

      if ( this.isEnum ) this.writeDeclarations(o);

      this.constants.forEach(function(c) { o.out(c, '\n'); });

      this.fields.sort(function(o1, o2) {
        return foam.Number.compare(o1.order, o2.order);
      }).forEach(function(f) { if ( ! self.isEnum || ! f.static )  o.out(f, '\n'); });

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
})
