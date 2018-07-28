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
  name: 'Slot', // ???: Rename AbstractSlot or make an Interface

  requires: [
    'foam.core.internal.SubSlot'
  ],

  documentation: `
    Slots are observable values which can change over time.

    Slots are simple single-value Model-View-Controller Models, but since
    another meaning of 'Model' is already heavily used in FOAM, Slot is
    used to avoid overloading the term.

    <ul>Types of Slots include:
      <li>PropertySlot
      <li>ConstantSlot
      <li>ExpressionSlot
    </ul>
  `,

  methods: [
    /**
      Subscribe to the Slot's value, if it has one. If the Slot's
      value changes, then unsubscribe from the previous value and
      resubscribe to the new one.
    */
    function valueSub() {
      var self = this;
      var args = Array.from(arguments);
      var s;
      var l = function() {
        var v = self.get();
        if ( s ) s.detach();
        if ( v ) s = v.sub.apply(v, args);
      };
      l();
      this.sub(l);
    },

    /**
      Create a sub-Slot for this Slot's value. If this Slot's
      value changes, then the sub-Slot becomes the Slot for
      the new value's sub-Slot instead. Useful for creating
      Slot paths without having to rebuild whenever a value
      along the chain changes.
    */
    function dot(name) {
      return this.SubSlot.create({
        parent: this,
        name:   name
      });
    },

    // TODO: remove when all code ported
    function link(other) {
      console.warn('deprecated use of link(), use linkFrom() instead');
      return this.linkFrom(other);
    },

    /**
      Link two Slots together, setting both to other's value.
      Returns a Detachable which can be used to break the link.
      After copying a value from one slot to the other, this implementation
      then copies the value back in case the target slot rejected the value.
    */
    function linkFrom(s2) {
      var s1        = this;
      var feedback1 = false, feedback2 = false;

      // TODO: once all slot types property set 'src', these
      // two listeneners can be merged.
      var l1 = function(e) {
        if ( feedback1 ) return;

        if ( ! foam.util.is(s1.get(), s2.get()) ) {
          feedback1 = true;
          s2.set(s1.get());
          if ( ! foam.util.is(s1.get(), s2.get()) )
            s1.set(s2.get());
          feedback1 = false;
        }
      };

      var l2 = function(e) {
        if ( feedback2 ) return;

        if ( ! foam.util.is(s1.get(), s2.get()) ) {
          feedback2 = true;
          s1.set(s2.get());
          if ( ! foam.util.is(s1.get(), s2.get()) )
            s2.set(s1.get());
          feedback2 = false;
        }
      };

      var sub1 = s1.sub(l1);
      var sub2 = s2.sub(l2)

      l2();

      return {
        detach: function() {
          sub1 && sub1.detach();
          sub2 && sub2.detach();
          sub1 = sub2 = null;
        }
      };
    },

    function linkTo(other) {
      return other.linkFrom(this);
    },

    /**
      Have this Slot dynamically follow other's value.
      Returns a Detachable which can be used to cancel the binding.
    */
    function follow(other) {
      foam.assert(other, 'Slot.follow requires Slot argument.');
      var self = this;
      var l = function() {
        if ( ! foam.util.is(self.get(), other.get()) ) {
          self.set(other.get());
        }
      };
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

    function map(f) {
      return foam.core.ExpressionSlot.create({code: f, args: [this]});
    },

    /**
     * Relate to another Slot.
     * @param f maps from this to other
     * @param fprime maps other to this
     */
    function relateTo(other, f, fPrime) {
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

      sub.onDetach(this.sub(l1));
      sub.onDetach(other.sub(l2));

      l1();

      return sub;
    },

    function relateFrom(other, f, fPrime) {
      return other.relateTo(this, fPrime, f);
    }
  ]
});


foam.CLASS({
  package: 'foam.core.internal',
  name: 'PropertySlot',
  extends: 'foam.core.Slot',

  documentation: `
    Represents object properties as Slots.
    Created with calling obj.prop$ or obj.slot('prop').
    For internal use only.
  `,

  methods: [
    function initArgs() { },
    function init() { },

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
      var s = this.obj.sub('propertyChange', this.prop.name, l);
      s.src = this;
      return s;
    },

    function isDefined() {
      return this.obj.hasOwnProperty(this.prop.name);
    },

    function clear() {
      this.obj.clearProperty(this.prop.name);
    },

    function toString() {
      return 'PropertySlot(' + this.obj.cls_.id + '.' + this.prop.name + ')';
    }
  ]
});


foam.CLASS({
  package: 'foam.core.internal',
  name: 'SubSlot',
  extends: 'foam.core.Slot',

  documentation:
      'For internal use only. Is used to implement the Slot.dot() method.',

  properties: [
    'of',
    'parent', // parent slot, not parent object
    'name',
    'value',
    'prevSub'
  ],

  methods: [
    function init() {
      this.parent.sub(this.parentChange);
      this.parentChange();
    },

    function get() {
      var o = this.parent.get();

      return o && o[this.name];
    },

    function set(value) {
      var o = this.parent.get();

      if ( o ) o[this.name] = value;
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

    function isDefined() {
      return this.parent.get().hasOwnProperty(this.name);
    },

    function clear() {
      this.parent.get().clearProperty(this.name);
    },

    function toString() {
      return 'SubSlot(' + this.parent + ',' + this.name + ')';
    }
  ],

  listeners: [
    function parentChange(s) {
      this.prevSub && this.prevSub.detach();
      var o = this.parent.get();

      // If the parent object changes class, then don't update
      // because a new class will have different sub-slots.
      if ( ( ! this.of  ) && o ) this.of = o.cls_;

      this.prevSub = o && o.slot(this.name).sub(this.valueChange);
      this.valueChange();
    },

    function valueChange() {
      var parentValue = this.parent.get();
      this.value = parentValue ? parentValue[this.name] : undefined;
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'ConstantSlot',

  implements: [ 'foam.core.Slot' ],

  documentation: 'An immutable constant valued Slot.',

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

    function set() {
      throw new Error('Tried to mutate immutable ConstantSlot.');
    },

    function sub(l) { /* nop */ }
  ]
});


/**
*/
foam.CLASS({
  package: 'foam.core',
  name: 'ExpressionSlot',
  implements: [ 'foam.core.Slot' ],

  documentation: `
    Tracks dependencies for a dynamic function and invalidates if they change.

    <pre>
      foam.CLASS({name: 'Person', properties: ['fname', 'lname']});
      var p = Person.create({fname: 'John', lname: 'Smith'});
      var e = foam.core.ExpressionSlot.create({
        args: [ p.fname$, p.lname$ ],
        code: function(f, l) { return f + ' ' + l; }
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

      var p = foam.CLASS({name: 'Person', properties: [ 'f', 'l' ]}).create({f:'John', l: 'Doe'});
      var e = foam.core.ExpressionSlot.create({
        obj: p,
        code: function(f, l) { return f + ' ' + l; }
      });
    </pre>
  `,

  properties: [
    'obj',
    'code',
    {
      name: 'args',
      expression: function(obj) {
        foam.assert(obj, 'ExpressionSlot: "obj" or "args" required.');

        var args = foam.Function.argNames(this.code);
        for ( var i = 0 ; i < args.length ; i++ ) {
          args[i] = obj.slot(args[i]);
        }

        // this.invalidate(); // ???: Is this needed?
        this.subToArgs_(args);

        return args;
      },
      postSet: function(_, args) {
        this.subToArgs_(args);
      }
    },
    {
      name: 'value',
      factory: function() {
        return this.code.apply(this.obj || this, this.args.map(function(a) {
          return a.get();
        }));
      }
    },
    'cleanup_', // detachable to cleanup old subs when obj changes
  ],

  methods: [
    function init() { this.onDetach(this.cleanup); },

    function get() { return this.value; },

    function set() { /* nop */ },

    function sub(l) {
      return arguments.length === 1 ?
        this.SUPER('propertyChange', 'value', l) :
        this.SUPER.apply(this,arguments);
    },

    function subToArgs_(args) {
      this.cleanup();

      var cleanup = foam.core.FObject.create();

      for ( var i = 0 ; i < args.length ; i++ ) {
        cleanup.onDetach(args[i].sub(this.invalidate));
      }

      this.cleanup_ = cleanup;
    }
  ],

  listeners: [
    function cleanup() { this.cleanup_ && this.cleanup_.detach(); },
    function invalidate() { this.clearProperty('value'); }
  ]
});
