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
    <li>ConstantSlot
    <li>ExpressionSlot
</ul>
*/
foam.CLASS({
  package: 'foam.core',
  name: 'Slot', // ???: Rename AbstractSlot or make an Interface
  extends: null,

  methods: [
    /**
    */
    function slot(name) {

    },

    /**
      Link two Slots together, setting both to other's value.
      Returns a Destroyable which can be used to break the link.
    */
    function link(other) {
      var sub1 = this.follow(other);
      var sub2 = other.follow(this);

      return {
        destroy: function() {
          sub1 && sub1.destroy();
          sub2 && sub2.destroy();
          sub1 = sub2 = null;
        }
      };
    },

    /**
      Have this Slot dynamically follow other's value.
      Returns a Destroyable which can be used to cancel the binding.
    */
    function follow(other) {
      var self = this;
      var l = function() { self.set(other.get()); };
      l();
      return other.sub(l);
    },

    /**
     * Maps values from one model to another.
     * @param f maps values from srcValue to dstValue
     */
    function mapFrom(other, f) {
      var self = this;
      var l = function() { self.set(f(other.get())); };
      l();
      return other.sub(l);
    },

    function mapTo(other, f) {
      return other.mapFrom(this, f);
    },

    /**
     * Relate to another Slot.
     * @param f maps from this to other
     * @param fprime maps other to this
     */
    function relate(other, f, fPrime) {
      var self     = this;
      var feedback = false;
      var sub      = foam.core.FObject.create();
      var l1 = function() {
        if ( feedback ) return;
        feedback = true;
        other.set(f(self.get()));
        feedback = false;
      };
      var l2 = function() {
        if ( feedback ) return;
        feedback = true;
        self.set(fPrime(other.get()));
        feedback = false;
      };

      sub.onDestroy(this.sub(l1));
      sub.onDestroy(other.sub(l2));

      l1();

      return sub;
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


/**
  For internal use only.
 */
foam.CLASS({
  package: 'foam.core.internal',
  name: 'SubSlot',
  extends: 'foam.core.Slot',

  properties: [
    'parentSlot',
    'name',
    'value',
    'prevSub'
  ],

  methods: [
    function init() {
      this.parentSlot.sub(this.parentChange);
      this.parentChange();
    },

    function get() {
      return this.parentSlot[this.name];
    },

    function set(value) {
      this.parentSlot[this.name] = value;
    },

    /** Needed? **/
    function getPrev() {
      debugger;
      return this.oldValue;
    },

    /** Needed? **/
    function setPrev(value) {
      debugger;
      return this.oldValue = value;
    },

    function sub(l) {
      return this.SUPER('propertyChange', 'value', l);
    },

    function unsub(l) {
      this.SUPER('propertyChange', 'value', l);
    },

    function isDefined() {
      return this.parentSlot.get().hasOwnProperty(this.name);
    },

    function clear() {
      this.parentSlot.get().clearProperty(this.prop.name);
    }
  ],

  listeners: [
    function parentChange() {
      this.prevSub && this.prevSub.destroy();
      this.prevSub = this.parent.sub('propertyChange', this.name, this.valueChange);
      this.valueChange();
    },

    function valueChange() {
      var parentValue = this.parent.get();
      this.value = parentValue ? parentValue[this.name] : undefined;
    }
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


/**
  Tracks dependencies for a dynamic function and invalidates is they change.

<pre>
foam.CLASS({name: 'Person', properties: ['fname', 'lname']});
var p = Person.create({fname: 'John', lname: 'Smith'});
var e = foam.core.ExpressionSlot.create({
  args: [ p.fname$, p.lname$ ],
  fn: function(f, l) { return f + ' ' + l; }
});
log(e.get());
e.sub(log);
p.fname = 'Steve';
p.lname = 'Jones';
log(e.get());
Output:
 > John Smith
 > [object Object] propertyChange value [object Object]
 > [object Object] propertyChange value [object Object]
 > Steve Jones
</pre>
*/
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
      for ( var i = 0 ; i < this.args.length ; i++ ) {
        this.onDestroy(this.args[i].sub(this.invalidate));
      }
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


// ???: Should there also be an 'obj' option instead of 'args'?
foam.CLASS({
  package: 'foam.core',
  name: 'ExpressionSlotHelper',

  requires: [ 'foam.core.ExpressionSlot' ],

  methods: [
    function expression(fn /* ... args */) {
      return this.ExpressionSlot.create({
        fn: fn,
        args: Array.prototype.slice.call(arguments, 1)
      });
    }
  ]
});