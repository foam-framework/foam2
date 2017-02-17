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
  name: 'Field',

  properties: [
    'visibility',
    'name',
    'type',
    'static',
    'final',
    'lazy',
    'override',
    'defaultValue',
    {
      name: 'initializer',
      class: 'String',
    },
    {
      name: 'getter',
      class: 'String',
    },
    {
      name: 'setter',
      class: 'String',
    },
  ],

  methods: [
    function outputSwift(o) {
      o.indent();
      o.out(
        this.override ? 'override ' : '',
        this.visibility ? this.visibility + ' ' : '',
        this.static ? 'static ' : '',
        this.lazy ? 'lazy ' : '',
        this.final ? 'let ' : 'var ',
        this.name);
      if (this.type) o.out(': ', this.type);
      if (this.initializer) {
        o.out(' = {\n');
        o.increaseIndent();
        o.indent();
        o.out(this.initializer, '\n');
        o.decreaseIndent();
        o.indent();
        o.out('}()');
      } else if (this.getter || this.setter) {
        o.out(' {\n');
        o.increaseIndent();
        o.indent();
        if (this.getter) {
          o.out('get {\n');
          o.increaseIndent();
          o.indent();
          o.out(this.getter, '\n');
          o.decreaseIndent();
          o.indent();
          o.out('}\n');
        }
        if (this.setter) {
          o.out('set(value) {\n');
          o.increaseIndent();
          o.indent();
          o.out(this.setter, '\n');
          o.decreaseIndent();
          o.indent();
          o.out('}\n');
        }
        o.decreaseIndent();
        o.indent();
        o.out('}');
      } else if (this.defaultValue) {
        o.out(' = ', this.defaultValue);
      }
    }
  ]
});
