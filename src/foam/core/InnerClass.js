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
  Classes can have "inner-classes" which are classes which are defined within
  the scope of a class itself rather than being top-level classes which reside
  in a package or globally. This helps to avoid polluting namespaces with classes
  which are only used by a single class.

<pre>
  Ex.
  // Classes can have inner-Classes.
  foam.CLASS({
    name: 'InnerClassTest',
    classes: [
      { name: 'InnerClass1', properties: ['a', 'b'] },
      { name: 'InnerClass2', properties: ['x', 'y'] }
    ],
    methods: [
      function init() {
        var ic1 = this.InnerClass1.create({a:1, b:2});
        var ic2 = this.InnerClass2.create({x:5, y:10});
        log(ic1.a, ic1.b, ic2.x, ic2.y);
      }
    ]
  });
  InnerClassTest.create();
</pre>
*/
foam.CLASS({
  package: 'foam.core',
  name: 'InnerClass',

  documentation: 'Axiom for defining inner-classes. An inner-class is a class defined in the scope of the outer/owner class. This avoids poluting the package namespace with classes which are only used internally by a class.',

  properties: [
    {
      name: 'name',
      getter: function() { return this.model.name; }
    },
    {
      name: 'model',
      adapt: function(_, m) {
        return this.modelAdapt_(m);
      }
    }
  ],

  methods: [
    function modelAdapt_(m) {
      return foam.core.Model.isInstance(m) ? m :
        foam.core.EnumModel.isInstance(m)  ? m :
        foam.core.InnerClass.isInstance(m) ? this.modelAdapt_(m.model) :
        m.class                            ? foam.lookup(m.class).create(m) :
        foam.core.Model.create(m);
    },

    function installInClass(cls) {
      this.model.package = cls.id;
      cls[this.model.name] = this.model.buildClass();
      // TODO: the inner-class name doesn't include the outer class name,
      // which is why we need to add it. But this also breaks CSS, so that
      // should be fixed and then remove the second parameter. KGR
      foam.register(cls[this.model.name], cls.id + '.' + this.model.name);
    },

    function installInProto(proto) {
      // get class already created in installInClass();
      var name = this.model.name;
      var cls  = proto.cls_[name];

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
  package: 'foam.core',
  name: 'ModelInnerClassRefinement',
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
        return foam.core.InnerClass.isInstance(o) ? o :
          o.model ? foam.core.InnerClass.create(o) :
          foam.core.InnerClass.create({model: o});
      }
    }
  ]
});
