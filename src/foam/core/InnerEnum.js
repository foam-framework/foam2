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

/**
  Classes can have "inner-enums" which are enums which are defined within
  the scope of a class itself rather than being top-level enums which reside
  in a package or globally. This helps to avoid polluting namespaces with enums
  which are only used by a single class.

<pre>
  Ex.
  // Classes can have inner-Enums.
  foam.CLASS({
    name: 'InnerEnumTest',
    enums: [
      { name: 'InnerEnum', values: [
        { name: 'OPEN',   label: 'Open'   },
        { name: 'CLOSED', label: 'Closed' }
      ] }
    ],
    methods: [
      function init() {
        log(this.InnerEnum.OPEN, this.InnerEnum.CLOSED)
      }
    ]
  });
  InnerEnumTest.create();
</pre>
*/
foam.CLASS({
  package: 'foam.core',
  name: 'InnerEnum',

  documentation: 'Axiom for defining inner-enums. An inner-enum is an enum defined in the scope of the outer/owner class. This avoids poluting the package namespace with enums which are only used internally by a class.',

  properties: [
    {
      name: 'name',
      getter: function() { return this.model.name; }
    },
    {
      name: 'model',
      adapt: function(_, m) {
        return foam.core.EnumModel.isInstance(m) ? m : foam.core.EnumModel.create(m);
      }
    }
  ],

  methods: [
    function installInClass(cls) {
      cls[this.model.name] = this.model.buildClass();
    },

    function installInProto(proto) {
      // get class already created in installInClass();
      var name = this.model.name;
      var cls = proto.cls_[name];
      proto[name] = cls;
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Model',
  properties: [
    {
      class: 'AxiomArray',
      of: 'InnerEnum',
      name: 'enums',
      // A custom adaptArrayElement is needed because we're
      // passing the model definition as model:, rather than
      // as all of the arguments to create().
      adaptArrayElement: function(o) {
        return foam.core.InnerEnum.isInstance(o) ? o :
          o.class ? this.lookup(o.class).create(o) :
          foam.core.InnerEnum.create({model: o}) ;
      }
    }
  ]
});
