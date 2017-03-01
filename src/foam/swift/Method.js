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
  name: 'Method',

  properties: [
    'name',
    'visibility',
    'returnType',
    'static',
    'class',
    'body',
    'override',
    {
      class: 'FObjectArray',
      of: 'foam.swift.Argument',
      name: 'args'
    },
    {
      class: 'StringArray',
      name: 'annotations'
    },
  ],

  methods: [
    function outputSwift(o) {
      o.indent();

      o.out(
        this.annotations.length ? this.annotations.join('\n') + '\n' : '',
        this.visibility ? this.visibility + ' ' : '',
        this.override ? 'override ' : '',
        this.static ? 'static ' : '',
        this.class ? 'class ' : '',
        this.name != 'init' ? 'func ' : '',
        this.name,
        '(');

      for (var i = 0, arg; arg = this.args[i]; i++) {
        o.out(i > 0 ? ', ' : '');
        arg.outputSwift(o);
      }

      o.out(
        ')',
        this.returnType ? ' -> ' + this.returnType : '',
        ' {\n');

      o.increaseIndent();
      o.indent();
      o.out(this.body, '\n');
      o.decreaseIndent();
      o.indent();
      o.out('}');
    }
  ]
});
