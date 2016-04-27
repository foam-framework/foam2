/*
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

/**
  Implements provide a delcaration of a classes intent to implement
  an interface. Since interfaces can also have implementations, it
  can also be used to provide mix-ins, which is a safe form of
  multiple-inheritance.
<pre>
  Ex.
  foam.CLASS({
    name: 'SalaryI',
    properties: [ 'salary' ]
  });

  foam.CLASS({
    name: 'Employee',
    extends: 'Person',
    implements: [ 'SalaryI' ]
  });
</pre>
  Employee extends Person through regular inheritance, but
  the axioms from SalaryI are also added to the class.
  Any number of mix-ins/interfaces can be specified.
*/
foam.CLASS({
  package: 'foam.core',
  name: 'Implements',

  // documentation: 'Implements Axiom',

  properties: [
    { name: 'name', getter: function() { return 'implements_' + this.path; } },
    'path'
  ],

  methods: [
    function installInClass(cls) {
      var m = foam.lookup(this.path);
      if ( ! m ) throw 'No such interface or trait: ' + this.path;
      cls.installModel(m.model_);
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.Model',
  properties: [
    {
      class: 'AxiomArray',
      of: 'Implements',
      name: 'implements',
      adaptArrayElement: function(o) {
        return typeof o === 'string' ?
          foam.core.Implements.create({path: o}) :
          foam.core.Implements.create(o)         ;
      }
    }
  ]
});
