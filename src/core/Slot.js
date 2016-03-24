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
  Slots are observable values which can change over time.

  Slots are simple single-value Model-View-Controller Models, but since
  another meaning of 'Model' is already heavily used in FOAM, Slot is
  used to avoid overloading the term.

  <ul>Types of Slots include:
    <li>PropertySlot
    <li>ExpressionSlot
    <li>ConstantSlot
</ul>
*/
foam.CLASS({
  package: 'foam.core',
  name: 'Slot', // ???: Rename AbstractSlot or make an Interface
  extends: null,

  methods: [
    /**
      Link two Slots together, setting both to other's value.
      Returns a Destroyable which can be used to break the link.
    */
    function link(other) {
      var sub1 = this.follow(other);
      var sub2 = other.follow(this);

      return {
        destroy: function() {
          sub1.destroy();
          sub2.destroy();
          sub1 = sub2 = null;
        }
      };
    },

    /**
      Have this Slot dynamically follow other's value.
      Returns a Destroyable which can be used to cancel the binding.
    */
    function follow(other) {
      return other.sub(function() {
        this.set(other.get());
      }.bind(this));
    }
  ]
});


/**
  PropertySlot represents object properties as Slots.
  Created with calling obj.prop$ or obj.slot('prop').
  For internal use only.
 */
foam.CLASS({
  package: 'foam.core.internal',
  name: 'PropertySlot',
  extends: 'foam.core.Slot',

  methods: [
    function initArgs() { },

    function get() {
      return this.prop.get(this.obj);
    },

    function set(value) {
      return this.prop.set(this.obj, value);
    },

    function getPrev() {
      return this.oldValue;
    },

    function setPrev(value) {
      return this.oldValue = value;
    },

    function sub(l) {
      return this.obj.sub('propertyChange', this.prop.name, l);
    },

    function unsub(l) {
      this.obj.unsub('propertyChange', this.prop.name, l);
    },

    function isDefined() {
      return this.obj.hasOwnProperty(this.prop.name);
    },

    function clear() {
      this.obj.clearProperty(this.prop.name);
    }
  ]
});


/** Tracks dependencies for a dynamic function and invalidates is they change. */
foam.CLASS({
  package: 'foam.core',
  name: 'ExpressionSlot',
  implements: [ 'foam.core.Slot' ],

  properties: [
    'args',
    'fn',
    {
      name: 'value',
      factory: function() {
        return this.fn.apply(this, this.args.map(function(a) {
          return a.get();
        }));
      }
    }
  ],

  methods: [
    function init() {
      for ( var i = 0 ; i < this.args.length ; i++ )
        this.onDestroy(this.args[i].sub(this.invalidate));
    },

    function get() {
      return this.value;
    },

    function set() { /* nop */ },

    function sub(l) {
      return this.SUPER('propertyChange', 'value', l);
    },

    function unsub(l) {
      this.SUPER('propertyChange', 'value', l);
    }
  ],

  listeners: [
    function invalidate() { this.clearProperty('value'); }
  ]
});


/** Tracks dependencies for a dynamic function and invalidates is they change. */
foam.CLASS({
  package: 'foam.core',
  name: 'ConstantSlot',
  implements: [ 'foam.core.Slot' ],

  properties: [
    {
      name: 'value',
      getter: function() { return this.value_; },
      setter: function() {}
    }
  ],

  methods: [
    function initArgs(args) { this.value_ = args && args.value; },

    function get() { return this.value; },

    function set() { /* nop */ },

    function sub(l) { /* nop */ },

    function unsub(l) { /* nop */ }
  ]
});
