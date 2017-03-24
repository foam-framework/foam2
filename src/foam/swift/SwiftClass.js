/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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
  package: 'foam.swift',
  name: 'SwiftClass',

  requires: [
    'foam.swift.Argument',
    'foam.swift.Field',
    'foam.swift.Method',
    'foam.swift.Outputter'
  ],

  properties: [
    {
      class: 'String',
      name: 'visibility'
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'StringArray',
      name: 'implements'
    },
    {
      class: 'StringArray',
      name: 'imports'
    },
    {
      class: 'FObjectArray',
      of: 'foam.swift.Field',
      name: 'fields',
    },
    {
      class: 'FObjectArray',
      of: 'foam.swift.SwiftClass',
      name: 'classes',
    },
    {
      class: 'FObjectArray',
      of: 'foam.swift.Method',
      name: 'methods',
      factory: function() { return []; }
    },
    {
      class: 'String',
      name: 'code',
    },
  ],

  methods: [
    function method(m) {
      this.methods.push(m);
      return this;
    },
    function field(f) {
      this.fields.push(f);
      return this;
    },
    function outputSwift(o) {
      o.indent();
      o.out('// GENERATED CODE. DO NOT MODIFY BY HAND.\n');
      this.imports.forEach(function(i) { o.out('import ', i, '\n') });
      o.indent();
      o.out(this.visibility ? this.visibility + ' ' : '');
      o.out('class ', this.name);
      if (this.implements.length) o.out(': ', this.implements.join(', '));
      o.out(' {\n');
      o.indent();

      o.increaseIndent();

      this.fields.forEach(function(f) { o.out('\n', f, '\n'); });
      this.methods.forEach(function(f) { o.out('\n', f, '\n'); });
      this.classes.forEach(function(f) { o.out('\n', f, '\n'); });
      o.out(this.code, '\n');

      o.decreaseIndent();
      o.indent();
      o.out('}');
    },
    function toSwiftSource() {
      var output = this.Outputter.create({outputMethod: 'outputSwift'});
      output.out(this);
      return output.buf_;
    }
  ]
});
