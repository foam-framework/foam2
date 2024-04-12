/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
// slot
//A basic Person class
foam.CLASS({
  name: 'Person',
  properties: [ 'name', 'sex' ],
  methods: [
    function toString() {
      return this.name + ' ' + this.sex;
    }
  ]
});

// Slot get: Slots are like Object-Oriented pointers
// A property's slot is accessed as 'name'$.
// get() is used to dereference the value of a slot
// Slot get with slot method: Calling obj.slot('name') is the same as obj.name$
var p = Person.create({
  name: 'Bob'
});
var dyn = p.name$;
console.log("Person name:", dyn, dyn.get());

// Slot set: set() is used to set a Slot's value
dyn.set('John'); // sets p.name implicitly
console.log("Name after set:", p.name, "get():", dyn.get());

/* delete
//Slot get with slot method: Calling obj.slot('name') is the same as obj.name$
var p = Person.create({
  name: 'Bob'
});*/

var dyn = p.slot('name'); // same as p.name$
console.log(dyn);
console.log("slot value:", dyn.get());

dyn.set('John');
console.log("after set:", dyn.get());


// Slot nesting: Slots can be nested with dot() to bind to a sub-property of a
// property value

// Nested slots
foam.CLASS({
  name: 'Holder',
  properties: [ 'data' ]
});
var p1 = Person.create({
  name: 'John'
});
var p2 = Person.create({
  name: 'Paul'
});
var h = Holder.create({
  data: p1
});
// Bind to the 'name' of whatever h.data will be, even if it changes
var s = h.data$.dot('name');

// Note that this listener is called when we swap p2 for p1, since
// p2.name is not the same as p1.name.
var changes = "";
s.sub(function() {
  console.log('    h.data.name change: ', h.data.name);
  changes += h.data.name + " ";
});

console.log('Set to p1:');

console.log("  Initial s:", s.get());

s.set('George');
console.log("  After setting s, p1.name:", p1.name);

p1.name = 'Ringo';
console.log("  After setting p1.name, s:", s.get());

console.log('Setting to p2, which has a different name:');

h.data = p2;
console.log("  Initial s:", s.get());

s.set('George'); // TODO if we have more than one property.
console.log("  After setting s, p2.name:", p2.name);

p2.name = 'Ringo';
console.log("  After setting p2.name, s:", s.get());


// Subscription nesting: Subscribe using valueSub() of the slot, automatically
// resubscribed as the value changes
// Subscribe to the value of the slot data$, removing the
// subscription and resubscribing to the new value of data$
// if it changes.
foam.CLASS({
  name: 'Holder',
  properties: [ 'data' ]
});
var p1 = Person.create({
  name: 'John'
});
var p2 = Person.create({
  name: 'Paul'
});
var h = Holder.create({
  data: p1
});
var changes = "";
h.data$.valueSub(function(e, topic, name, slot) {
  console.log('sub change: ', e.src.name, topic, name);
  changes += topic + ':' + (slot && slot.get()) + ' ';
});

p1.name = 'Peter';
p2.name = 'Mary';
h.data = p2;
p1.name = 'James';
p2.name = 'Ringo';
p2.pub('test', 'event');


// Data Binding two way: Assiging one slot to another binds their values
// Two-Way Data-Binding
// Slots can be assigned, causing two values to be
// bound to the same value.
var p1 = Person.create(),
  p2 = Person.create();
console.log(p1)
console.log(p2)
p1.name$ = p2.name$;
console.log(p1)
console.log(p2)
p1.name = 'John'; // also sets p2.name
console.log("Assigned first:", p1.name, p2.name);
console.log(p1)
console.log(p1.name)
console.log(p2)
p2.name = 'Steve'; // also sets p1.name
console.log("Assigned second: ", p1.name, p2.name);
// (p1.name).toEqual(p2.name)


// Data Binding linkFrom: Another way to link two Slots is to call .linkFrom()
// on one of them
var p1 = Person.create({
  name: 'p1'
});
var p2 = Person.create({
  name: 'p2'
});
var d = p1.name$.linkFrom(p2.name$);
p1.name = 'John';
console.log("Assigned first:", p1.name, p2.name);
// (p1.name).toEqual(p2.name)


// Data Binding linkFrom unbind: linkFrom/To() returns a detachable that unbinds the slots
// But this style of link can be broken by calling .detach()
// on the object return from .linkFrom/To().
d.detach();
p2.name = 'Steve';
console.log("No longer bound:", p1.name, p2.name);

// Data Binding linkTo: 
// linkTo() is the same as linkFrom(), except that the initial value is taken
// from 'this' instead of the other object
// linkTo() is the same as linkFrom(), except that the initial value
// is taken from 'this' instead of the other object.
var p1 = Person.create({
    name: 'p1'
  }),
  p2 = Person.create({
    name: 'p2'
  });
var d = p1.name$.linkTo(p2.name$);
console.log("After linkTo:", p1.name, p2.name);
var name2 = p2.name;

p1.name = 'John';
console.log("Assigned first:", p1.name, p2.name);


// Data Binding relateTo: Two values can be linked through relateTo
// Two values can be linked through a relationship,
// which provides functions to adapt between the two values.
foam.CLASS({
  name: 'Temperature',
  properties: [
    {
      class: 'Float',
      name: 'f'
    },
    {
      class: 'Float',
      name: 'c'
    }
  ],
  methods: [
    function init() {
      this.f$.relateTo(
        this.c$,
        function f2c(c) {
          console.log('f2c', c); return 5 / 9 * (c - 32);
        },
        function c2f(f) {
          console.log('c2f', f); return 9 / 5 * f + 32;
        }
      );
    }
  ]
});

var t = Temperature.create();
console.log("Initial     f:", t.f, " c:", t.c);
t.f = 100;
console.log("Set(f=100)  f:", t.f, " c:", t.c);
t.c = 100;
console.log("Set(c=100)  f:", t.f, " c:", t.c);


// Data Binding one way: The .follow() method binds in one direction only
// Calling .linkFrom()/.linkTo() creates a two-way data-binding, meaning a
// change in either value is reflected in the other. But FOAM supports one-way
// data-binding as well.
// TODO use .follow() method.
var p1 = Person.create({
    name: 'p1'
  }),
  p2 = Person.create({
    name: 'p2'
  });
var d = p1.name$.follow(p2.name$);

p2.name = 'Ringo'; // Will update p1 and p2
p2.name = 'Paul';  // Will update p1 and p2
console.log('Assigned p2:', p1.name, p2.name);
p1.name = 'George'; // Will only update p1
console.log('Assigned p1:', p1.name, p2.name);
d.detach();


// Data Binding one way initialization: Follow copies the initial value of the
// followed slot
p1 = Person.create();
p2 = Person.create({
  name: 'John'
});
console.log("Initial:", p1.name, p2.name);

p1.name$.follow(p2.name$);
console.log("After follow:", p1.name, p2.name);


// TODO mapFrom vs follow
// Data Binding one way mapFrom: One-Way Data-Binding, with Map function (mapFrom)
var p1 = Person.create(),
  p2 = Person.create();
var d = p1.name$.mapFrom(p2.name$, function(n) {
  return n + "es";
});

p2.name = 'Ringo'; // Will update p1 and p2
console.log('Assigned second:', p1.name, p2.name);
p1.name = 'George'; // Will only update p1
console.log('Assigned first:', p1.name, p2.name);
d.detach();


// Slot isDefined: Slots also let you check if the value is defined by calling
// isDefined()
// Calling obj.name$.isDefined() is equivalent to obj.hasOwnProperty('name');
foam.CLASS({
  name: 'IsDefinedTest',
  properties: [ {
    name: 'a',
    value: 42
  } ]
});
var o = IsDefinedTest.create();
var dv = o.a$;
console.log("Default value only, isDefined?", dv.isDefined());
dv.set(99);
console.log("Set to 99, isDefined?", dv.isDefined()); // true

// Slot clear: You can reset a Slot to its default value by calling .clear()
// Calling obj.name$.clear() is equivalent to obj.clearProperty('name');
dv.clear();
console.log("After clearing:", dv.get(), dv.isDefined());


// ConstantSlot: ConstantSlot creates an immutable slot
var s = foam.core.ConstantSlot.create({
  value: 42
});
console.log("Intial value:", s.get());
s.value = 66;
// s.set(66);  error
console.log("After set to 66:", s.get()); // 42

// Expression Slots: ExpressionSlot creates a Slot from a list of Slots and a
// function to comine them
foam.CLASS({
  name: 'Person',
  properties: [ 'fname', 'lname' ]
});
var p = Person.create({
  fname: 'John',
  lname: 'Smith'
});
// When fname or lname changes, the new values are fed into the function
// to produce a new value for ExpressionSlot e
var e = foam.core.ExpressionSlot.create({
  args: [ p.fname$, p.lname$ ],
  code: function(f, l) {
    return f + ' ' + l;
  }
});

console.log("Intial e:", e.get());
var calls = 0;
e.sub(function() {
  console.log("e changed:", e.get());
  calls += 1;
});
p.fname = 'Steve';
p.lname = 'Jones';
console.log("Final e:", e.get());


// Expression Slot with object: ExpressionSlot can use an object to supply the
// source slots
foam.CLASS({
  name: 'Person',
  properties: [ 'f', 'l' ]
});
var p = Person.create({
  f: 'John',
  l: 'Smith'
});
// function arguments 'f' and 'l' are treated as property names on obj
var e = foam.core.ExpressionSlot.create({
  obj: p,
  code: function(f, l) {
    return f + ' ' + l;
  }
});
console.log("Initial e:", e.get());
e.sub(function() {
  console.log("e changed:", e.get());
});
p.f = 'Steve';
p.l = 'Jones';
console.log("Final e:", e.get());

// Expression Slot unbinding: Detach the ExpressionSlot to prevent further updates
calls = 0;
e.detach();
console.log("e detached, setting f and l again...");
p.f = 'Bob';
p.l = 'Roberts';
console.log("Updates since detach:", calls);

// Property Expression Class: The same functionality of ExpressionSlot is built
// into Properties
// Properties have the 'expression' feature
foam.CLASS({
  name: 'Person',
  properties: [
    'fname',
    'lname',
    { // Property Expression Class
      name: 'name',
      expression: function(fname, lname) {
        return fname + ' ' + lname;
      }
    }
  ]
});
var p = Person.create({
  fname: 'John',
  lname: 'Smith'
});


// Property Expressions: Expression properties are invalidated whenever of their
// listed source values change
// Expression properties are invalidated
// whenever of their listed source values change, but are only recalculated
// when their value is accessed.
p.describe();
p.sub(function(sub, propChg, name) {
  console.log("Event:", propChg, name);
});
p.fname = 'Steve';
console.log(p.fname, p.lname, '=', p.name);
p.lname = 'Jones';
console.log(p.fname, p.lname, '=', p.name);


// Property Expression setting: Expression properties can also be explicitly
// set, disabling the dynamic expression.
console.log(p.name, p.hasOwnProperty('name'));
p.name = 'Kevin Greer';
console.log(p.name, p.hasOwnProperty('name'));
p.fname = 'Sebastian';
console.log(p.fname, p.lname, ':', p.name);


// Property Expression: Clearing a set expression property reverts it to expression mode
p.name = "Joe"
console.log("Set directly:", p.name, "hasOwnProperty(name)?", p.hasOwnProperty('name'));
p.clearProperty('name');
console.log("After clearing:", p.name, "hasOwnProperty(name)?", p.hasOwnProperty('name'));


// Detachables or functions can be registered to be called when an object is detached.
// Detachables are objects with a detach() method, such as FObjects
// and sub()-returned subscriptions.
var o = foam.core.FObject.create();
var o2 = foam.core.FObject.create();
var detachs = '';

// onDetach adds a function to be called when the object is detached
o.onDetach(function() {
  console.log('detach 1');
  detachs += '1 ';
});
o2.onDetach(function() {
  console.log('detach 2');
  detachs += '2 ';
});

// cause o2 to be detached when o is detached
o.onDetach(o2);
console.log('step');
o.detach();


// Detachables idempotent: It doesn't hurt to try and detach an object more than once
var o = foam.core.FObject.create();
o.detach();
o.detach();

// TODO error in the results; it will not detach.
// Detachables unsubscribe
// If an Object is detached, it will unsubscribe from any
// subscriptions which subsequently try to deliver events.
var source = foam.core.FObject.create();
var calls = 0;
foam.CLASS({
  name: 'Sink',
  listeners: [
    function l() {
      calls += 1;
      console.log('ping:', calls);
    }
  ]
});
var sink = Sink.create();
source.sub(sink.l);
source.pub('ping');
source.pub('ping');
sink.detach();
source.pub('ping');