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

/** Add new Axiom types (Implements, Constants, Topics, Properties, Methods and Listeners) to Model. */
foam.CLASS({
  refines: 'foam.core.Model',

  // documentation: 'Add new Axiom types (Implements, Constants, Topics, Properties, Methods and Listeners) to Model.',

  properties: [
    {
      class: 'AxiomArray',
      of: 'Requires',
      name: 'requires',
      adaptArrayElement: function(o) {
        if ( typeof o === 'string' ) {
          var a = o.split(' as ');
          var m = a[0];
          var path = m.split('.');
          var as = a[1] || path[path.length-1];
          return foam.core.Requires.create({path: m, as: as});
        }

        return foam.core.Requires.create(o);
      }
    },
    {
      class: 'AxiomArray',
      of: 'Imports',
      name: 'imports',
      adaptArrayElement: function(o) {
        if ( typeof o === 'string' ) {
          var a = o.split(' as ');
          var m = a[0];
          var as = a[1] || m;
          return foam.core.Imports.create({key: m, as: as});
        }

        return foam.core.Imports.create(o);
      }
    },
    {
      name: 'exports',
      postSet: function(_, xs) {
        this.axioms_.push.call(
          this.axioms_,
          foam.core.Exports.create({bindings: xs}));
      }
    },
    {
      class: 'AxiomArray',
      of: 'Implements',
      name: 'implements',
      adaptArrayElement: function(o) {
        return typeof o === 'string' ?
          foam.core.Implements.create({path: o}) :
          foam.core.Implements.create(o)         ;
      }
    },
    {
      class: 'AxiomArray',
      of: 'InnerClass',
      name: 'classes',
      // TODO: is this needed?
      adaptArrayElement: function(o) {
        return foam.core.InnerClass.isInstance(o) ?
          o :
          foam.core.InnerClass.create({model: o}) ;
      }
    },
    {
      class: 'AxiomArray',
      of: 'Constant',
      name: 'constants',
      adapt: function(_, a, prop) {
        if ( ! a ) return [];
        if ( ! Array.isArray(a) ) {
          var cs = [];
          for ( var key in a ) {
            cs.push(foam.core.Constant.create({name: key, value: a[key]}));
          }
          return cs;
        }
        var b = new Array(a.length);
        for ( var i = 0 ; i < a.length ; i++ ) {
          b[i] = prop.adaptArrayElement(a[i]);
        }
        return b;
      }
    },
    {
      name: 'ids',
      postSet: function(_, ids) {
        this.axioms_.push.call(
          this.axioms_,
          foam.core.Identity.create({ids: ids}));
      }
    },
    {
      class: 'AxiomArray',
      of: 'Topic',
      name: 'topics',
      adaptArrayElement: function(o) {
        return typeof o === 'string'        ?
          foam.core.Topic.create({name: o}) :
          foam.core.Topic.create(o)         ;
      }
    },
    {
      class: 'AxiomArray',
      of: 'Property',
      name: 'properties',
      adaptArrayElement: foam.core.Model.PROPERTIES.adaptArrayElement
    },
    {
      class: 'AxiomArray',
      of: 'Method',
      name: 'methods',
      adaptArrayElement: function(o) {
        if ( typeof o === 'function' ) {
          console.assert(o.name, 'Method must be named');
          var m = foam.core.Method.create();
          m.name = o.name;
          m.code = o;
          return m;
        }
        // TODO: check that not already a Method
        return foam.core.Method.create(o);
      }
    },
    {
      class: 'AxiomArray',
      of: 'Listener',
      name: 'listeners',
      adaptArrayElement: function(o) {
        if ( typeof o === 'function' ) {
          console.assert(o.name, 'Listener must be named');
          return foam.core.Listener.create({name: o.name, code: o});
        }
        // TODO: check that not already a Listener
        return foam.core.Listener.create(o);
      }
    }
  ]
});

foam.boot.phase3();

foam.CLASS({
  refines: 'foam.core.FObject',

  // documentation: 'Upgrade FObject to fully bootstraped form.',

  topics: [ 'propertyChange' ],

  axioms: [
    {
      name: 'X',
      installInProto: function(p) {
        Object.defineProperty(p, 'X', {
          get: function() {
            var x = this.getPrivate_('X');
            if ( ! x ) {
              var ySource = this.getPrivate_('ySource');
              if ( ySource ) {
                this.setPrivate_('X', x = ySource.Y || ySource.X);
                this.setPrivate_('ySource', undefined);
              } else {
                // TODO: Why isn't this an error?
                // console.error('Missing X in ', this.cls_.id);
                return undefined;
              }
            }
            return x;
          },
          set: function(x) {
            if ( x ) {
              this.setPrivate_(foam.core.FObject.isInstance(x) ? 'ySource' : 'X', x);
            }
          }
        });
      }
    }
  ],

  methods: [
    /**
      Called to process constructor arguments.
      Replaces simpler version defined in original FObject definition.
    */
    function initArgs(args, X) {
      this.X = X || foam.X;
      if ( ! args ) return;

      // If args are just a simple {} map, just copy
      if ( args.__proto__ === Object.prototype || ! args.__proto__ ) {
        for ( var key in args ) {
          if ( this.cls_.getAxiomByName(key) ) {
            this[key] = args[key];
          } else {
            this.unknownArg(key, args[key]);
          }
        }
      }
      // If an FObject, copy values from instance_
      else if ( args.instance_ ) {
        for ( var key in args.instance_ ) {
          if ( this.cls_.getAxiomByName(key) ) this[key] = args[key];
        }
      }
      // Else call copyFrom(), which is the slowest version because
      // it is O(# of properties) not O(# of args)
      else {
        this.copyFrom(args);
      }
    },

    function unknownArg(key, value) {
      // NOP
    },

    function copyFrom(o) {
      // TODO: should walk through Axioms with initAgents instead
      var a = this.cls_.getAxiomsByClass(foam.core.Property);
      for ( var i = 0 ; i < a.length ; i++ ) {
        var name = a[i].name;
        if ( typeof o[name] !== 'undefined' ) this[name] = o[name];
      }
      return this;
    },

    /**
      Undefine a Property's value.
      The value will revert to either the Property's 'value' or
      'expression' value, if they're defined or undefined if they aren't.
      A propertyChange event will be fired, even if the value doesn't change.
    */
    function clearProperty(name) {
      if ( this.hasOwnProperty(name) ) {
        var oldValue = this[name];
        this.instance_[name] = undefined
        this.pub('propertyChange', name, this.slot(name));
      }
    },

    function onDestroy(dtor) {
      /*
        Register a function or a destroyable to be called
        when this object is destroyed.
      */
      var dtors = this.getPrivate_('dtors') || this.setPrivate_('dtors', []);
      dtors.push(dtor);
      return dtor;
    },

    function destroy() {
      /*
        Destroy this object.
        Free any referenced objects and destroy any registered destroyables.
        This object is completely unusable after being destroyed.
       */
      if ( this.destroyed ) return;

      var dtors = this.getPrivate_('dtors');
      if ( dtors ) {
        for ( var i = 0 ; i < dtors.length ; i++ ) {
          var d = dtors[i];
          if ( typeof d === 'function' ) {
            d();
          } else {
            d.destroy();
          }
        }
      }

      this.destroyed = true;

      this.instance_ = null;
      this.private_ = null;
    },

    function toString() {
      // Distinguish between prototypes and instances.
      return this.cls_.name + (this.instance_ ? '' : 'Proto')
    }
  ]
});


foam.boot.end();


/**
 TODO:
  - model validation
    - abstract methods
    - interfaces
  - Slot map() and relate() methods
  - more docs
  - Axiom ordering/priority
  - The defineProperty() and setPrivate() pattern is used in several spots, maybe make a helper function

 ???:
  - ? proxy label, plural from Class to Model

 Future:
  - predicate support for getAxioms() methods.
  - cascading object property change events
  - should destroyables be a linked list for fast removal?
    - should onDestroy be merged with listener support?
  - multi-methods?
  - Topic listener relay
*/
