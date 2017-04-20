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

      if ( this.extends.length > 0 ) {
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
