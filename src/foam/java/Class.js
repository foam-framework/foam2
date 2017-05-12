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
        o.out('// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!\n');
        
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

        o.out(this.abstract ? 'abstract ' : '');
        o.out(this.isEnum ? 'enum ' : 'class ', this.name);

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

      if (this.isEnum) this.writeDeclarations(o);

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
