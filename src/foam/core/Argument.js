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

foam.CLASS({
  package: 'foam.core',
  name: 'Argument',

  documentation: 'Describes one argument of a function or method.',

  properties: [
    {
      /** The name of the argument */
      name: 'name'
    },
    {
      name: 'type'
    },
    {
      name: 'of',
      postSet: function(_, of) {
        console.warn("Deprecated usaged of Argument.of", this.name, of);
        this.type = of;
      }
    },
    {
      class: 'String',
      name: 'documentation',
      value: ''
    }
  ]
});

foam.CLASS({
  package: 'foam.core',
  name: 'MethodArgumentRefine',
  refines: 'foam.core.AbstractMethod',
  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.core.Argument',
      name: 'args',
      adaptArrayElement: function(e, obj) {
        var ctx = obj.__subContext__ || foam;
        var of = e.class || this.of;
        var cls = ctx.lookup(of);

        return cls.isInstance(e) ? e :
          foam.String.isInstance(e) ? cls.create({ name: e }) :
          cls.create(e, obj);
      }
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.AbstractMethod',
  package: 'foam.core',
  name: 'CreateChildRefines',
  documentation: `
    Overwrites the createChildMethod_ to merge in details from the parent method
    into the child method like return types, arguments, and any other method
    properties. This allows a model to not need to list these details when
    implementing an interface or overriding a parent's method.
  `,
  methods: [
    function createChildMethod_(child) {
      var result = child.clone();
      var props = child.cls_.getAxiomsByClass(foam.core.Property);
      for ( var i = 0 ; i < props.length ; i++ ) {
        var prop = props[i];
        if ( this.hasOwnProperty(prop.name) && ! child.hasOwnProperty(prop.name) ) {
          prop.set(result, prop.get(this));
        }
      }

      // Special merging behaviour for args.
      var i = 0;
      var resultArgs = [];
      for ( ; i < this.args.length ; i++ ) resultArgs.push(this.args[i].clone().copyFrom(child.args[i]));
      for ( ; i < child.args.length ; i++ ) resultArgs.push(child.args[i]);
      result.args = resultArgs; // To trigger the adaptArrayElement

      return result;
    },
  ]
});
