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
      o.out(';\n');
    }
  ]
});
