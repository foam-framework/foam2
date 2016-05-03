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
        return foam.core.Method.isInstance(o) ? o : foam.core.Method.create(o);
      }
    }
  ]
});


foam.boot.phase3();


foam.CLASS({
  refines: 'foam.core.FObject',

  // documentation: 'Upgrade FObject to fully bootstraped form.',

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

        // If no delcared exports, then sub-context is the same as context.
        Object.defineProperty(p, 'Y', { get: function() { return this.X; } });
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
            // TODO: check that it is a Property
            this[key] = args[key];
          } else {
            this.unknownArg(key, args[key]);
          }
        }
      }
      // If an FObject, copy values from instance_
      else if ( args.instance_ ) {
        for ( var key in args.instance_ ) {
          // TODO: check that it is a Property
          if ( this.cls_.getAxiomByName(key) ) this[key] = args[key];
        }
      }
      // Else call copyFrom(), which is the slowest version because
      // it is O(# of properties) not O(# of args)
      else {
        // TODO: ???: How is this possible?
        this.copyFrom(args);
      }
    },

    /**
      Template method used to report an unknown argument passed
      to a constructor. Is set in debug.js.
    */
    function unknownArg(key, value) {
      // NOP
    }
  ]
});


foam.boot.end();


// TODO: doc
foam.CLASS({
  refines: 'foam.core.Property',

  properties: [
    {
      class: 'Boolean',
      name: 'transient'
    },
    {
      class: 'Boolean',
      name: 'networkTransient',
      expression: function(transient) {
        return transient;
      }
    },
    {
      class: 'Boolean',
      name: 'storageTransient',
      expression: function(transient) {
        return transient;
      }
    }
  ]
});
