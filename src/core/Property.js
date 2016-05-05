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
  A Property is a high-level instance variable.

  Properties contain more information than typical variable declarations.
  Such as: label, help text, pre/post-set callbacks, default value,
  value factory, units, etc.

  A sub-class or refinement can include a partial Property definition which
  will override or add meta-information to the Property.
**/
foam.CLASS({
  package: 'foam.core',
  name: 'Property',
  extends: 'FObject',

  properties: [
    {
      name: 'name',
      required: true
    },
    {
      name: 'label',
      expression: function(name) { return foam.String.labelize(name); }
    },
    // TODO: document these properties in detail
    /* User-level help. */
    'help',
    'hidden',
    'value',
    'factory',
    'adapt',
    'preSet',
    'postSet',
    'expression',
    'getter',
    'setter',
    'final',
    'required',
    'assertValue',
    [
      /**
        Compare two values taken from this property.
        <p>Used by Property.compare().
        It is a property rather than a method so that it can be configured
        without subclassing.
      */
      'comparePropertyValues',
      function(o1, o2) { return foam.util.compare(o1, o2); }
    ],
    {
      name: 'f',
      factory: function() {
        var name = this.name;
        return function f(o) { return o[name]; }
      }
    },
    {
      name: 'compare',
      factory: function() {
        var comparePropertyValues = this.comparePropertyValues;
        var f = this.f;
        return function compare(o1, o2) {
          return comparePropertyValues(f(o1), f(o2));
        }
      }
    }
  ],

  methods: [
    /**
      Handle overriding of Property definition from parent class by
      copying undefined values from parent Property, if it exists.
    */
    function installInClass(c) {
      var prop = this;
      var superProp = c.__proto__.getAxiomByName(prop.name);

      if ( superProp ) {
        prop = prop.cls_ === foam.core.Property ?
          superProp.clone().copyFrom(prop) :
          prop.cls_.create().copyFrom(superProp).copyFrom(this) ;

        c.axiomMap_[prop.name] = prop;
      }

      var cName = foam.String.constantize(prop.name);
      var prev = c[cName];

      // Detect constant name collisions
      if ( prev && prev.name !== prop.name ) {
        throw 'Class constant conflict: ' +
          c.id + '.' + cName + ' from: ' + prop.name + ' and ' + prev.name;
      }

      c[cName] = prop;
    },

    /**
      Install a property onto a prototype from a Property definition.
      (Property is 'this').
    */
    function installInProto(proto) {
      // Take Axiom from class rather than using 'this' directly,
      // since installInClass() may have created a modified version
      // to inherit Property Properties from a super-Property.
      var prop        = proto.cls_.getAxiomByName(this.name);
      var name        = prop.name;
      var adapt       = prop.adapt
      var assertValue = prop.assertValue;
      var preSet      = prop.preSet;
      var postSet     = prop.postSet;
      var factory     = prop.factory;
      var value       = prop.value;
      var hasValue    = typeof value !== 'undefined';
      var slotName    = name + '$';
      var isFinal     = prop.final;
      var eFactory    = this.exprFactory(prop.expression);

      // This costs us about 4% of our boot time.
      // If not in debug mode we should share implementations like in F1.
      // TODO: doc
      Object.defineProperty(proto, slotName, {
        get: function propertySlotGetter() {
          return prop.toSlot(this);
        },
        set: function propertySlotSetter(slot2) {
          prop.toSlot(this).link(slot2);
        },
        configurable: true,
        enumerable: false
      });

      // TODO: doc
      var getter =
        prop.getter ? prop.getter :
        factory ? function factoryGetter() {
          return this.hasOwnProperty(name) ?
            this.instance_[name] :
            this[name] = factory.call(this) ;
        } :
        eFactory ? function eFactoryGetter() {
          return this.hasOwnProperty(name) ? this.instance_[name]   :
                 this.hasOwnPrivate_(name) ? this.getPrivate_(name) :
                 this.setPrivate_(name, eFactory.call(this)) ;
        } :
        hasValue ? function valueGetter() {
          var v = this.instance_[name];
          return typeof v !== 'undefined' ? v : value ;
        } :
        function simpleGetter() { return this.instance_[name]; };

      var setter = prop.setter ? prop.setter :
        function propSetter(newValue) {
          // ???: Should clearProperty() call set(undefined)?
          if ( newValue === undefined ) {
            this.clearProperty(name);
            return;
          }

          // Get old value but avoid triggering factory if present
          // TODO: expand
          var oldValue =
            factory  ? ( this.hasOwnProperty(name) ? this[name] : undefined ) :
            eFactory ? ( this.hasOwnPrivate_(name) || this.hasOwnProperty(name) ? this[name] : undefined ) :
            this[name] ;

          if ( adapt )  newValue = adapt.call(this, oldValue, newValue, prop);

          if ( assertValue ) assertValue.call(this, newValue, prop);

          if ( preSet ) newValue = preSet.call(this, oldValue, newValue, prop);

          // ???: Should newValue === undefined check go here instead?

          this.instance_[name] = newValue;

          if ( isFinal ) {
            Object.defineProperty(this, name, {
              value: newValue,
              writable: false,
              configurable: true // ???: is this needed?
            });
          }

          this.pubPropertyChange_(prop, oldValue, newValue);

          // FUTURE: pub to a global topic to support dynamic()

          if ( postSet ) postSet.call(this, oldValue, newValue, prop);
        };

      Object.defineProperty(proto, name, {
        get: getter,
        set: setter,
        configurable: true
      });
    },

    /* Validate an object which has this Property. */
    function validateInstance(o) {
      if ( this.required && ! o[this.name] ) {
        throw 'Required property ' +
            o.cls_.id + '.' + this.name +
            ' not defined.';
      }
    },

    /**
     * Create a factory function from an expression function.
     * Function arguments are validated in debug.js.
     **/
    function exprFactory(e) {
      if ( ! e ) return null;

      var argNames = foam.Function.argsArray(e);
      var name     = this.name;

      // FUTURE: determine how often the value is being invalidated,
      // and if it's happening often, then don't unsubscribe.
      return function() {
        var self = this;
        var args = new Array(argNames.length);
        var subs = [];
        var l    = function() {
          if ( ! self.hasOwnProperty(name) ) self.clearPrivate_(name);
          for ( var i = 0 ; i < subs.length ; i++ ) subs[i].destroy();
        };
        for ( var i = 0 ; i < argNames.length ; i++ ) {
          subs.push(this.slot(argNames[i]).sub(l));
          args[i] = this[argNames[i]];
        }
        return e.apply(this, args);
      };
    },

    /** Returns a developer-readable description of this Property. **/
    function toString() { return this.name; },

    /** Flyweight getter for this Property. **/
    function get(o) { return o[this.name]; },

    /** Flyweight setter for this Property. **/
    function set(o, value) {
      o[this.name] = value;
      return this;
    },

    function exportAs(obj) {
      /** Export obj.name$ instead of just obj.name. **/
      return this.toSlot(obj);
    },

    function toSlot(obj) {
      var slotName = this.slotName_ || ( this.slotName_ = this.name + '$' );
      var slot     = obj.getPrivate_(slotName);

      if ( ! slot ) {
        slot = foam.core.internal.PropertySlot.create();
        slot.obj  = obj;
        slot.prop = this;
        obj.setPrivate_(slotName, slot);
      }

      return slot;
    },

    function cloneProperty(
      /* any // The value to clone */         value,
      /* object // Add values to this map to
         have them installed on the clone. */ cloneMap
    ) {
      /** Override to provide special deep cloning behavior. */
      cloneMap[this.name] = ( value && value.clone ) ? value.clone() : value;
    }
  ]
});


/**
  A Simple Property skips the regular FOAM Property getter/setter/instance_
  mechanism. In gets installed on the CLASS as a Property constant, but isn't
  added to the prototype at all. From this point of view, it's mostly just for
  documentation. Simple Properties are used only in special cases to maximize
  performance and/or minimize memory use.
  Used for MDAO indices and Slots.

  USE WITH EXTREME CAUTION (OR NOT AT ALL).
*/
foam.CLASS({
  package: 'foam.core',
  name: 'Simple',
  extends: 'Property',

  methods: [
    function installInProto(proto) {}
  ]
});
