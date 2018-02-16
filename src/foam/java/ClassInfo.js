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
      name: 'axioms',
      factory: function() { return []; }
    },
    {
      name: 'order',
      value: 2
    }
  ],

  methods: [
    function addAxiom(id) {
      this.axioms.push(id);
    },

    function outputJava(o) {
      o.indent();
      o.out('private static final foam.core.ClassInfo classInfo_ = new foam.core.ClassInfoImpl()\n')
      o.increaseIndent();
      o.indent();
      o.out('.setId("', this.id, '")');
      o.out('.setObjClass(', this.id, '.class)');
      for ( var i = 0 ; i < this.axioms.length ; i++ ) {
        o.out('\n');
        o.indent();
        o.out('.addAxiom(', this.axioms[i], ')');
      }
      o.decreaseIndent()
      o.out(';');
    }
  ]
});
