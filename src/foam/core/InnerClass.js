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
<pre>
</pre>
*/
foam.CLASS({
  package: 'foam.core',
  name: 'InnerClass',

  // documentation: 'Inner-Class Axiom',

  properties: [
    {
      name: 'name',
      getter: function() { return this.model.name; }
    },
    {
      name: 'model',
      adapt: function(_, m) {
        return foam.core.Model.isInstance(m) ? m : foam.core.Model.create(m);
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

      // Create a private_ clone of the Class with the create() method decorated
      // to pass 'this' as the context if not explicitly provided.  This ensures
      // that the created object has access to this object's exported bindings.
      Object.defineProperty(proto, name, {
        get: function innerClassGetter() {
          if ( ! this.hasOwnPrivate_(name) ) {
            var parent = this;
            var c      = Object.create(cls);

            c.create = function innerClassCreate(args, ctx) {
              return cls.create(args, ctx || parent);
            };
            this.setPrivate_(name, c);
          }

          return this.getPrivate_(name);
        },
        configurable: true,
        enumerable: false
      });
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.Model',
  properties: [
    {
      class: 'AxiomArray',
      of: 'InnerClass',
      name: 'classes',
      // A custom adaptArrayElement is needed because we're
      // passing the model definition as model:, rather than
      // as all of the arguments to create().
      adaptArrayElement: function(o) {
        return foam.core.InnerClass.isInstance(o) ?
          o :
          foam.core.InnerClass.create({model: o}) ;
      }
    }
  ]
});
