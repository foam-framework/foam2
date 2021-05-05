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
  A Property is a high-level instance variable.

  Properties contain more information than typical variable declarations.
  Such as: label, help text, pre/post-set callbacks, default value,
  value factory, units, etc.

  When setting a Propery's value, the callback order is:
    1. adapt()
    2. assertValue()
    3. preSet()
       value updated
       property change event fired
    4. postSet()

   Unless the user has provided a customer 'setter', in which case the order is
     1. setter()

  A sub-class or refinement can include a partial Property definition which
  will override or add meta-information to the Property.
**/
foam.CLASS({
  package: 'foam.core',
  name: 'Property',
  extends: 'FObject',

  requires: [
    'foam.core.internal.PropertySlot',
  ],

  properties: [
    {
      name: 'name',
      required: true
    },
    {
      name: 'label',
      // If not provided, it defaults to the name "labelized".
      expression: function(name) { return foam.String.labelize(name); }
    },

    /* Developer-level documentation. */
    'documentation',

    /* User-level help. Could/should appear in GUI's as online help. */
    'help',

    /* Hidden properties to not appear in GUI's by default. */
    { class: 'Boolean', name: 'hidden' },

    /**
      The default-value of this property.
      A property which has never been set or has been cleared
      by setting it to 'undefined' or cleared with clearProperty()
      will have the default value.
    */
    'value',

    /**
      A factory is a function which initializes the property value
      when accessed for the first time, if not already set.
    */
    'factory',

    /**
      A function of the form:
        Object function(oldValue, newValue)
      adapt is called whenver the property is set. It's intended
      to adapt the value to the appropriate type if required.
      Adapt must return a value. It can return newValue unchanged
      if it was already the appropriate type.
    */
    'adapt',

    /**
      A function of the form:
        Object function(oldValue, newValue)
      preSet is called before the propery's value is updated.
      It can veto the value change by returning a different newValue
      (including returning oldValue to leave the property unchanged).
    */
    'preSet',

    /**
      A function of the form:
        void function(oldValue, newValue) throws Exception
      assertValue can validate newValue and throw an exception if it's an
      invalid value.
    */
    'assertValue',

    /**
      A function of the form:
        void function(oldValue, newValue)
      postSet is called after the Property's value has been updated.
    */
    'postSet',

    /**
      A dynamic function which defines this Property's value.
      Similar to 'factory', except that the function takes arguments
      which are named the same as other properties of this object.
      Whenever the values of any of the argument properties change,
      the value of this Property is invalidated. Like a regular factory,
      an invalidated property will be recalculated by calling the provided
      expression function when accessed. This makes expressions very efficient
      because the value is only recomputed when actually needed.
    */
    'expression',

    /**
      A getter function which completely replaces the normal
      Property getter process. Whenever the property is accessed, getter is
      called and its value is returned.
    */
    'getter',

    /**
      A setter function which completely replaces the normal
      Property setter process. Whenever the property is set, setter is
      called.
      A function of the form:
        void function(newValue)
    */
    'setter',

    [ 'cloneProperty', function(
      /* any // The value to clone */         value,
      /* object // Add values to this map to
         have them installed on the clone. */ cloneMap
      ) {
        /** Override to provide special deep cloning behavior. */
        cloneMap[this.name] = ( value && value.clone ) ? value.clone() :
          foam.util.clone(value);
      }
    ],

    /**
      A final Property can only be set once.
      After being set, its value is final (read-only).
    */
    'final',

    /**
      A required Property can not be set to null, undefined, 0 or "".
     */
    'required',

    /**
      When set to true, the '<model>.ro.<property>' permission is required for a
      user to be able to read this property. If false, any user can read the
      value of this property.
     */
    {
      class: 'Boolean',
      name: 'readPermissionRequired',
      value: false
    },

    /**
      When set to true, the '<model>.rw.<property>' permission is required for a
      user to be able to write this property. If false, any user can set the
      value of this property.
     */
    {
      class: 'Boolean',
      name: 'writePermissionRequired',
      value: false
    },

    /**
      When set, marks the property with the given flags. This can be used for
      things like stripping out platform specific properties when serializing.
     */
    'flags',

    [
      /**
        Called to convert a string into a value suitable for this property.
        Eg. this might convert strings to numbers, or parse RFC 2822 timestamps.
        By default it simply returns the string unchanged.
       */
      'fromString',
      function(str) { return str; }
    ],

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

    [
      'isDefaultValue',
      function(v) { return ! this.comparePropertyValues(this.value, v); }
    ],

    {
      /** Makes Properties useful as map functions. */
      name: 'f',
      transient: true,
      factory: function() {
        var name = this.name;
        return function f(o) { return o != null ? o[name] : null; }
      }
    },

    {
      /** Makes Properties useful as comparators. */
      name: 'compare',
      transient: true,
      factory: function() {
        var comparePropertyValues = this.comparePropertyValues;
        var f = this.f;
        return function compare(o1, o2) {
          return comparePropertyValues(f(o1), f(o2));
        };
      }
    },
    // FUTURE: Move to refinement?
    {
      name: 'diffPropertyValues',
      transient: true,
      value: function(v1, v2, diff) {
        // TODO: instead of array check, have different implementation in ArrayProperty
        if ( Array.isArray(v1) ) {
          var subdiff = foam.Array.diff(v1, v2);
          if ( subdiff.added.length !== 0 || subdiff.removed.length !== 0 ) {
            diff[this.name] = subdiff;
          }
        } else if ( ! foam.util.equals(v1, v2) ) {
          // if the primary value is undefined, use the compareTo of the other
          diff[this.name] = v2;
        }
        return diff;
      }
    },
    {
      name: 'diffProperty',
      transient: true,
      value: function diffProperty(o1, o2, diff, prop) {
        return prop.diffPropertyValues(prop.f(o1), prop.f(o2), diff);
      }
    },
    {
      name: 'forClass_',
      transient: true
    },
    {
      /**
        Identifies properties that contain Personally identifiable information,
        which may fall within the ambit of privacy regulations.
      */
      class: 'Boolean',
      name: 'containsPII'
    },
    {
      /**
        Identifies properties that contain Personally identifiable information which
        may be eligible for deletion on request.
      */
      class: 'Boolean',
      name: 'containsDeletablePII'
    },
    {
      name: 'type',
    },
    {
      class: 'Boolean',
      name: 'sortable',
      value: true
    },
    {
      class: 'Boolean',
      name: 'sheetsOutput'
    },
    'valueToString',
    'unitPropValueToString',
    {
      name: 'dependsOnPropertiesWithNames',
      documentation: 'this axiom contains names of properties which are needed to be set when using projection as they are used for some other axioms of current property (eg tableCellFormatter can use another property\'s value for specific styling)',
      value: []
    }
  ],

  methods: [
    /**
      Handle overriding of Property definition from parent class by
      copying undefined values from parent Property, if it exists.
    */
    function installInClass(c, superProp, existingProp) {
      var prop = this;

      if ( superProp && foam.core.Property.isInstance(superProp) ) {
        prop = superProp.createChildProperty_(prop);

        // If properties would be shadowed by superProp properties, then
        // clear the shadowing property since the new value should
        // take precedence since it was set later.
        var es = foam.core.Property.SHADOW_MAP || {};
        for ( var key in es ) {
          var e = es[key];
          for ( var j = 0 ; j < e.length ; j++ ) {
            if ( this.hasOwnProperty(e[j]) && superProp[key] ) {
              prop.clearProperty(key);
              break;
            }
          }
        }

        c.axiomMap_[prop.name] = prop;
      }

      if ( this.forClass_ && this.forClass_ !== c.id && prop === this ) {
        // Clone this property if it's been installed before.
        prop = this.clone();

        // sourceCls_ isn't a real property so it gets lost during the clone.
        prop.sourceCls_ = c;

        c.axiomMap_[prop.name] = prop;
      }

      prop.forClass_ = c.id;

      // var reinstall = foam.events.oneTime(function reinstall(_,_,_,axiom) {
      //   // We only care about Property axioms.

      //   // FUTURE: we really only care about those properties that affect
      //   // the definition of the property getter and setter, so an extra
      //   // check would help eliminate extra reinstalls.

      //   // Handle special case of axiom being installed into itself.
      //   // For example foam.core.String has foam.core.String axioms for things
      //   // like "label"
      //   // In the future this shouldn't be required if a reinstall is
      //   // only triggered on this which affect getter/setter.
      //   if ( prop.cls_ === c ) {
      //     return;
      //   }

      //   if ( foam.core.Property.isInstance(axiom) ) {
      //     // console.log('**************** Updating Property: ', c.name, prop.name);
      //     c.installAxiom(prop);
      //   }
      // });

      // // If the superProp is updated, then reinstall this property
      // c.__proto__.pubsub_ && c.__proto__.pubsub_.sub(
      //   'installAxiom',
      //   this.name,
      //   reinstall
      // );

      // // If the class of this Property changes, then also reinstall
      // if (
      //   c.id !== 'foam.core.Property' &&
      //   c.id !== 'foam.core.Model'    &&
      //   c.id !== 'foam.core.Method'   &&
      //   c.id !== 'foam.core.FObject'  &&
      //   this.cls_.id !== 'foam.core.FObject'
      // ) {
      //   this.cls_.pubsub_.sub('installAxiom', reinstall);
      // }

      c.installConstant(prop.name, prop);
    },

    /**
      Install a property onto a prototype from a Property definition.
      (Property is 'this').
    */
    function installInProto(proto) {
      // Take Axiom from class rather than using 'this' directly,
      // since installInClass() may have created a modified version
      // to inherit Property Properties from a super-Property.
      var prop = proto.cls_.getAxiomByName(this.name);
      if ( prop !== this ) {
        // Delegate to the installInProto found in the class in case it
        // has custom behaviour it wants to do.  See Class property for
        // and example.
        prop.installInProto(proto);
        return;
      }

      var name        = prop.name;
      var adapt       = prop.adapt;
      var assertValue = prop.assertValue;
      var preSet      = prop.preSet;
      var postSet     = prop.postSet;
      var factory     = prop.factory;
      var getter      = prop.getter;
      var value       = prop.value;
      var hasValue    = typeof value !== 'undefined';
      var slotName    = name + '$';
      var isFinal     = prop.final;
      var eFactory    = this.exprFactory(prop.expression);
      var FIP         = factory && ( prop.name + '_fip' ); // Factory In Progress
      var fip         = 0;

if ( factory && (
     factory.toString().indexOf('/* ignoreWarning */') == -1) && ( 
     factory.toString().indexOf('then(') != -1 ||
     factory.toString().indexOf('await') != -1 ) )
{
  console.error('Invalid Asynchronous Function', proto.cls_.id + '.' + prop.name + '.factory=', factory);
}
if ( eFactory && (
     eFactory.toString().indexOf('/* ignoreWarning */') == -1) && ( 
     eFactory.toString().indexOf('then(') != -1 ||
     eFactory.toString().indexOf('await') != -1 ) )
{
  console.error('Invalid Asynchronous Function', proto.cls_.id + '.' + prop.name + '.expression=', eFactory);
}

      // Factory In Progress (FIP) Support
      // When a factory method is in progress, the object sets a private
      // flag named by the value in FIP.
      // This allows for the detection and elimination of
      // infinite recursions (if a factory accesses another property
      // which in turn tries to access its propery) and allows for
      // the property change event to not be fired when the value
      // is first set by the factory (since the value didn't change,
      // the factory is providing its original value).
      // However, this is expensive, so we keep a global 'fip' variable
      // which indicates that the factory is already being called on any
      // object and then we only track on a per-instance basis when this
      // is on. This eliminates almost all per-instance FIP checks.

      // Property Slot
      // This costs us about 4% of our boot time.
      // If not in debug mode we should share implementations like in F1.
      //
      // Define a PropertySlot accessor (see Slot.js) for this Property.
      // If the property is named 'name' then 'name$' will access a Slot
      // for this Property. The Slot is created when first accessed and then
      // cached.
      // If the Slot is set (to another slot) the two Slots are link()'ed
      // together, meaning they will now dynamically share the same value.
      Object.defineProperty(proto, slotName, {
        get: function propertySlotGetter() {
          return prop.toSlot(this);
        },
        set: function propertySlotSetter(slot2) {
          this.onDetach(prop.toSlot(this).linkFrom(slot2));
        },
        configurable: true,
        enumerable: false
      });

      // Define Property getter and setter based on Property properties.
      // By default, getter and setter stores instance value for property
      // in this.instance_[<name of property>],
      // unless the user provides custom getter and setter methods.

      // Getter
      // Call 'getter' if provided, else return value from instance_ if set.
      // If not set, return value from 'factory', 'expression', or
      // (default) 'value', if provided.
      var get =
        getter ? function() { return getter.call(this, prop); } :
        factory ? function factoryGetter() {
          var v = this.instance_[name];
          if ( v !== undefined ) return v;
          // Indicate the Factory In Progress state
          if ( fip > 10 && this.getPrivate_(FIP) ) {
            console.warn('reentrant factory for property:', name);
            return undefined;
          }

          var oldFip = fip;
          fip++;
          if ( oldFip === 10 ) this.setPrivate_(FIP, true);
          v = factory.call(this, prop);
          // Convert undefined to null because undefined means that the
          // value hasn't been set but it has. Setting it to undefined
          // would prevent propertyChange events if the value were cleared.
          this[name] = v === undefined ? null : v;
          if ( oldFip === 10 ) this.clearPrivate_(FIP);
          fip--;

          return this.instance_[name];
        } :
        eFactory ? function eFactoryGetter() {
          return this.hasOwnProperty(name) ? this.instance_[name]   :
                 this.hasOwnPrivate_(name) ? this.getPrivate_(name) :
                 this.setPrivate_(name, eFactory.call(this)) ;
        } :
        hasValue ? function valueGetter() {
          var v = this.instance_[name];
          return v !== undefined ? v : value ;
        } :
        function simpleGetter() { return this.instance_[name]; };

      var set = prop.setter ? prop.setter :
        ! ( postSet || factory || eFactory || adapt || assertValue || preSet || isFinal ) ?
        function simplePropSetter(newValue) {
          if ( newValue === undefined ) {
            this.clearProperty(name);
            return;
          }

          var oldValue = this.instance_[name] ;
          this.instance_[name] = newValue;
          this.pubPropertyChange_(prop, oldValue, newValue);
        }
        : factory && ! ( postSet || eFactory || adapt || assertValue || preSet || isFinal ) ?
        function factoryPropSetter(newValue) {
          if ( newValue === undefined ) {
            this.clearProperty(name);
            return;
          }

          var oldValue = this.hasOwnProperty(name) ? this[name] : undefined;

          this.instance_[name] = newValue;

          // If this is the result of a factory setting the initial value,
          // then don't fire a property change event, since it hasn't
          // really changed.
          if ( oldValue !== undefined )
            this.pubPropertyChange_(prop, oldValue, newValue);
        }
        :
        function propSetter(newValue) {
          // ???: Should clearProperty() call set(undefined)?
          if ( newValue === undefined ) {
            this.clearProperty(name);
            return;
          }

          // Getting the old value but avoid triggering factory or expression if
          // present. Factories and expressions (which are also factories) can be
          // expensive to generate, and if the value has been explicitly set to
          // some value, then it isn't worth the expense of computing the old
          // stale value.
          var oldValue =
            factory  ? ( this.hasOwnProperty(name) ? this[name] : undefined ) :
            eFactory ?
                ( this.hasOwnPrivate_(name) || this.hasOwnProperty(name) ?
                  this[name] :
                  undefined ) :
            this[name] ;

          if ( adapt ) newValue = adapt.call(this, oldValue, newValue, prop);

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

          // If this is the result of a factory setting the initial value,
          // then don't fire a property change event, since it hasn't
          // really changed.
          if ( ! factory || oldValue !== undefined )
            this.pubPropertyChange_(prop, oldValue, newValue);

          // FUTURE: pub to a global topic to support dynamic()

          if ( postSet ) postSet.call(this, oldValue, newValue, prop);
        };

      Object.defineProperty(proto, name, {
        get: get,
        set: set,
        configurable: true
      });
    },

    /** Validate an object which has this Property. */
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

      var argNames = foam.Function.argNames(e);
      var name     = this.name;

      // FUTURE: determine how often the value is being invalidated,
      // and if it's happening often, then don't unsubscribe.
      return function exportedFactory() {
        var self = this;
        var args = new Array(argNames.length);
        var subs = [];
        var l    = function() {
          if ( ! self.hasOwnProperty(name) ) {
            var oldValue = self[name];
            self.clearPrivate_(name);

            // Avoid creating slot and publishing event if no listeners
            if ( self.hasListeners('propertyChange', name) ) {
              self.pub('propertyChange', name, self.slot(name));
            }
          }
          for ( var i = 0 ; i < subs.length ; i++ ) subs[i].detach();
        };
        for ( var i = 0 ; i < argNames.length ; i++ ) {
          var slot = this.slot(argNames[i]);
          // This check was introduced to handle optional imports not having a
          // slot when the import isn't found in the context.
          if (slot) {
            var s = slot.sub(l);
            s && subs.push(s);
            args[i] = slot.get();
          }
        }
        var ret = e.apply(this, args);
        if ( ret === undefined ) this.__context__.warn('Expression returned undefined: ', e, this.name);
        return ret;
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

    /**
     * Handles property inheritance.  Builds a new version of
     * this property to be installed on classes that inherit from
     * this but define their own property with the same name as this.
     */
    function createChildProperty_(child) {
      var prop = this.clone();

      if ( child.cls_ !== foam.core.Property &&
           child.cls_ !== this.cls_ )
      {
        if ( this.cls_ !== foam.core.Property ) {
          this.__context__.warn('Unsupported change of property type from', this.cls_.id, 'to', child.cls_.id, 'property name', this.name);
        }

        return child;
      }

      prop.sourceCls_ = child.sourceCls_;

      for ( var key in child.instance_ ) {
        prop.instance_[key] = child.instance_[key];
      }

      return prop;
    },

    function exportAs(obj, sourcePath) {
      /** Export obj.name$ instead of just obj.name. */

      var slot = this.toSlot(obj);

      for ( var i = 0 ; sourcePath && i < sourcePath.length ; i++ ) {
        slot = slot.dot(sourcePath[i]);
      }

      return slot;
    },

    function toSlot(obj) {
      /** Create a Slot for this Property. */
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

    function clone(opt_X) {
      return this.shallowClone(opt_X);
    }
  ]
});
