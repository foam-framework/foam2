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

var customMatchers = {
  toMatchGolden: function(util, customEqualityTesters) {
    return {
      compare: function(actual, golden) {
        var _failed = false;
        var expected = golden.str;
        var example = golden.i;
        var message = 'In Example #' + example + '\n';
        if ( actual.length != expected.length ) {
          message += 'Lengths dont match\n' +
            '  Expected: ' + expected.length + '\n' +
            '  Actual:   ' + actual.length + '\n\n';
          _failed = true;
        }

        var min = Math.max(actual.length, expected.length);
        if ( expected.length > 80 ) {
          for ( var i = 0 ; i < min ; i++ ) {
            if ( actual[i] !== expected[i] ) {
              message += 'First difference at ' + i + '\n';
              message += '  Expected:  "' + expected.substring(i-20, i+20) + '"\n';
              message += '  Actual:    "' + actual.substring(i-20, i+20) + '"\n';
              _failed = true;
              break;
            }
          }
        } else {
          message += '  Expected: "' + expected + '"\n';
          message += '  Actual:   "' + actual + '"\n';
        }

        if ( _failed ) return { pass: false, message: message };
        return { pass: true };
      }
    }
  }
};


xdescribe("FOAM By Example", function() {
var log_ = function log_(o) {
  log_.output += o;
};
var log = function() { log_(' <b>&gt;</b> ' + [].join.call(arguments, ' ')); }
var golden = " <b>&gt;</b> {class:\"JSONTest\",n:\"John\",a:42,cs:[\"Peter\",\"Paul\"],\"name That Needs Quoting\":42,defined:\"value\",definedString:\"stringValue\",definedInt:42,definedFloat:42.42,trueBoolean:true,definedFunction:function plus(a, b) { return a + b; },definedFObject:{class:\"JSONTest\",n:\"Janet\",a:32,cs:[\"Kim\",\"Kathy\"]},networkTransient:\"network transient value\"}";
var oldLog, oldAssert, oldWarn, oldError, oldFAssert;
beforeEach(function() {
  oldLog = console.log;
  oldAssert = console.assert;
  oldFAssert = foam.core.FObject.prototype.assert;
  oldWarn = console.warn;
  oldError = console.error;
  console.assert = function(b) {
    if ( ! b ) {
      var args = Array.from(arguments);
      args[0] = "Assertion failed:";
      log.apply(this, args);
      throw "assert";
    }
  };
  foam.core.FObject.prototype.assert = console.assert;
  console.log = function() { log_([].join.call(arguments, " ")); };
  console.log.put = console.log.bind(console);
  console.log.str = oldLog.str;
  console.log.json = oldLog.json;
  console.warn = function() { log_("warn: " + [].join.call(arguments, " ")); };
  console.error = function() { log_("error: " + [].join.call(arguments, " ")); };
  log_.output = "";
  jasmine.addMatchers(customMatchers);
});
afterEach(function() {
  console.assert = oldAssert;
  console.log = oldLog;
  console.warn = oldWarn;
  console.error = oldError;
  foam.core.FObject.prototype.assert = oldFAssert;
});
it("", function() {


// Example 1
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {

// Define a new class with foam.CLASS
foam.CLASS({
  name: 'Test',
  properties: [
    // short-form
    'a',
    // long-form
    {
      name: 'b'
    }
  ],
  methods: [
    // short-form
    function f1() { return 1; },
    // long-form
    {
      name: 'f2',
      code: function() { return 2; }
    }
  ]
});
log(Test);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 1, str: " <b>&gt;</b> TestClass" });


// Example 2
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Use class.describe() to learn about the class
Test.describe();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 2, str: "CLASS:   Testextends: FObjectAxiom Type           Source Class   Name----------------------------------------------------Property             Test           aProperty             Test           bMethod               Test           f1Method               Test           f2Method               FObject        initArgsMethod               FObject        initMethod               FObject        hasOwnPropertyMethod               FObject        clearPropertyMethod               FObject        setPrivate_Method               FObject        getPrivate_Method               FObject        hasOwnPrivate_Method               FObject        clearPrivate_Method               FObject        pubPropertyChange_Method               FObject        validateMethod               FObject        lookupMethod               FObject        assertMethod               FObject        errorMethod               FObject        logMethod               FObject        warnMethod               FObject        createListenerList_Method               FObject        listeners_Method               FObject        notify_Method               FObject        hasListenersMethod               FObject        pubMethod               FObject        pub_Method               FObject        subMethod               FObject        slotMethod               FObject        isDestroyedMethod               FObject        onDestroyMethod               FObject        destroyMethod               FObject        equalsMethod               FObject        compareToMethod               FObject        diffMethod               FObject        hashCodeMethod               FObject        cloneMethod               FObject        copyFromMethod               FObject        toStringanonymous            FObject        __context__Method               FObject        unknownArgTopic                FObject        propertyChangeMethod               FObject        describeMethod               FObject        stringifyMethod               FObject        toE\n" });


// Example 3
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Create an instance of Test
var o = Test.create();
log(o);
log(o.a, o.b);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 3, str: " <b>&gt;</b> Test <b>&gt;</b>  " });


// Example 4
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Create an instance with a map argument to initialize properties
var o = Test.create({a:1, b:'foo'});
log(o.a, o.b);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 4, str: " <b>&gt;</b> 1 foo" });


// Example 5
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Objects have a reference to their class in .cls_
log(o.cls_.name);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 5, str: " <b>&gt;</b> Test" });


// Example 6
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Test Class membership with Class.isInstance()
log(Test.isInstance(o), Test.isInstance('foo'));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 6, str: " <b>&gt;</b> true false" });


// Example 7
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Call Methods
log(o.f1(), o.f2());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 7, str: " <b>&gt;</b> 1 2" });


// Example 8
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Update Properties
o.a++;
o.b = 'bar';
log(o.a, o.b);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 8, str: " <b>&gt;</b> 2 bar" });


// Example 9
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Multiple properties can be updated at once using copyFrom().
o.copyFrom({a: 42, b: 'rosebud'});
log(o.a, o.b);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 9, str: " <b>&gt;</b> 42 rosebud" });


// Example 10
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Call toString on an object
log(o.toString());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 10, str: " <b>&gt;</b> Test" });


// Example 11
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Call describe() on an object to see its Property values
o.describe();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 11, str: "Instance of TestAxiom Type           Name           Value----------------------------------------------------Property             a              42Property             b              rosebud\n" });


// Example 12
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Properties and Methods are types of Axioms
// Get an array of all Axioms belonging to a Class by calling getAxioms.
Test.getAxioms().forEach(function(a) { console.log(a.cls_ && a.cls_.name, a.name); });
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 12, str: "Property aProperty bMethod f1Method f2Method initArgsMethod initMethod hasOwnPropertyMethod clearPropertyMethod setPrivate_Method getPrivate_Method hasOwnPrivate_Method clearPrivate_Method pubPropertyChange_Method validateMethod lookupMethod assertMethod errorMethod logMethod warnMethod createListenerList_Method listeners_Method notify_Method hasListenersMethod pubMethod pub_Method subMethod slotMethod isDestroyedMethod onDestroyMethod destroyMethod equalsMethod compareToMethod diffMethod hashCodeMethod cloneMethod copyFromMethod toString __context__Method unknownArgTopic propertyChangeMethod describeMethod stringifyMethod toE" });


// Example 13
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Find an Axiom for a class using getAxiomByName
log(Test.getAxiomByName('a'));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 13, str: " <b>&gt;</b> a" });


// Example 14
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Find all Axioms of a particular class using getAxiomsByClass
log(Test.getAxiomsByClass(foam.core.Method));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 14, str: " <b>&gt;</b> foam.core.Method,foam.core.Method,foam.core.Method,foam.core.Method,foam.core.Method,foam.core.Method,foam.core.Method,foam.core.Method,foam.core.Method,foam.core.Method,foam.core.Method,foam.core.Method,foam.core.Method,foam.core.Method,foam.core.Method,foam.core.Method,foam.core.Method,foam.core.Method,foam.core.Method,foam.core.Method,foam.core.Method,foam.core.Method,foam.core.Method,foam.core.Method,foam.core.Method,foam.core.Method,foam.core.Method,foam.core.Method,foam.core.Method,foam.core.Method,foam.core.Method,foam.core.Method,foam.core.Method,foam.core.Method,foam.core.Method,foam.core.Method,foam.core.Method,foam.core.Method,foam.core.Method" });


// Example 16
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Property constants contain map functions
log(Test.getAxiomsByClass(foam.core.Method).map(foam.core.Method.NAME.f));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 16, str: " <b>&gt;</b> f1,f2,initArgs,init,hasOwnProperty,clearProperty,setPrivate_,getPrivate_,hasOwnPrivate_,clearPrivate_,pubPropertyChange_,validate,lookup,assert,error,log,warn,createListenerList_,listeners_,notify_,hasListeners,pub,pub_,sub,slot,isDestroyed,onDestroy,destroy,equals,compareTo,diff,hashCode,clone,copyFrom,toString,unknownArg,describe,stringify,toE" });


// Example 17
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Property constants contain comparators
log(Test.getAxiomsByClass(foam.core.Method).sort(foam.core.Method.NAME.compare).map(foam.core.Method.NAME.f));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 17, str: " <b>&gt;</b> assert,clearPrivate_,clearProperty,clone,compareTo,copyFrom,createListenerList_,describe,destroy,diff,equals,error,f1,f2,getPrivate_,hashCode,hasListeners,hasOwnPrivate_,hasOwnProperty,init,initArgs,isDestroyed,listeners_,log,lookup,notify_,onDestroy,pub,pub_,pubPropertyChange_,setPrivate_,slot,stringify,sub,toE,toString,unknownArg,validate,warn" });


// Example 18
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// If a Class defineds an init() method, itss called
// when an object is created.
foam.CLASS({
  name: 'InitTest',
  methods: [ function init() { log('Just Born!'); } ]
});
InitTest.create();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 18, str: " <b>&gt;</b> Just Born!" });


// Example 19
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Default Values can be defined for Properties
foam.CLASS({
  name: 'DefaultValueTest',
  properties: [
    { name: 'a', value: 42 },
    { name: 'b', value: 'foo' },
    { name: 'c' }
  ]
});
var o = DefaultValueTest.create();
log(o.a, o.b, o.c);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 19, str: " <b>&gt;</b> 42 foo " });


// Example 20
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// .hasOwnProperty() tells you if a Property has been set
log(o.hasOwnProperty('a'), o.hasOwnProperty('b'), o.hasOwnProperty('c'));
o.a = 99;
o.b = 'bar';
o.c = 'test';
log(o.hasOwnProperty('a'), o.hasOwnProperty('b'), o.hasOwnProperty('c'));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 20, str: " <b>&gt;</b> false false false <b>&gt;</b> true true true" });


// Example 21
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// .clearProperty() reverts a value back to its value
log(o.hasOwnProperty('a'), o.a);
o.clearProperty('a');
log(o.hasOwnProperty('a'), o.a);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 21, str: " <b>&gt;</b> true 99 <b>&gt;</b> false 42" });


// Example 22
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// factories
// Properties can have factory methods which create their initial value
// when they are first accessed.
foam.CLASS({
  name: 'FactoryTest',
  properties: [
    {
      name: 'a',
      factory: function() { log('creating value'); return 42; }
    }
  ]
});
var o = FactoryTest.create();
log(o.a);
// Factory not called value accessed second time:
log(o.a);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 22, str: " <b>&gt;</b> creating value <b>&gt;</b> 42 <b>&gt;</b> 42" });


// Example 23
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Factory not called if value supplied in constructor
var o = FactoryTest.create({a: 42});
log(o.a);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 23, str: " <b>&gt;</b> 42" });


// Example 24
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Factory not called if value set before first access
var o = FactoryTest.create();
o.a = 42;
log(o.a);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 24, str: " <b>&gt;</b> 42" });


// Example 25
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Factory called again if clearProperty() called:
var o = FactoryTest.create();
log(o.a);
o.clearProperty('a');
log(o.a);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 25, str: " <b>&gt;</b> creating value <b>&gt;</b> 42 <b>&gt;</b> creating value <b>&gt;</b> 42" });


// Example 26
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// getters and setters
// Properties can define their own getter and setter functions.
foam.CLASS({
  name: 'GetterSetter',
  properties: [
    'radius',
    {
      name: 'diameter',
      getter: function() { return this.radius * 2; },
      setter: function(diameter) { this.radius = diameter / 2; }
    }
  ]
});
var o = GetterSetter.create();
o.diameter = 10;
log(o.radius, o.diameter);
o.radius = 10;
log(o.radius, o.diameter);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 26, str: " <b>&gt;</b> 5 10 <b>&gt;</b> 10 20" });


// Example 27
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Properties can specify an 'adapt' function which is called whenever
// the properties' value is updated. It's the adapt function's responsibility
// to convert or coerce the type if necessary.
// Both the previous value of the property and the proposed new value are
// passed to adapt.  Adapt returns the desired new value, which may be different
// from the newValue it's provided.
foam.CLASS({
  name: 'AdaptTest',
  properties: [
    {
      name: 'flag',
      adapt: function(oldValue, newValue) {
        log('adapt ', oldValue, newValue);
        // adapt to a boolean
        return !! newValue;
      }
    }
  ]
});
var o = AdaptTest.create({flag:true});
o.flag = null;
log(o.flag);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 27, str: " <b>&gt;</b> adapt   true <b>&gt;</b> adapt  true  <b>&gt;</b> false" });


// Example 28
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Properties can specify a 'preSet' function which is called whenever
// the properties' value is updated, just after 'adpat', if present.
// Both the previous value of the property and the proposed new value are
// passed to preSet.  PreSet returns the desired new value, which may be different
// from the newValue it's provided.
foam.CLASS({
  name: 'PreSetTest',
  properties: [
    {
      name: 'a',
      preSet: function(oldValue, newValue) {
        log('preSet p1');
        return 'Mr. ' + newValue;
      }
    }
  ]
});
var o = PreSetTest.create({a: 'Smith'});
o.a = 'Jones';
log(o.a);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 28, str: " <b>&gt;</b> preSet p1 <b>&gt;</b> preSet p1 <b>&gt;</b> Mr. Jones" });


// Example 29
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Properties can specify a 'postSet' function which is called after
// the properties' value is updated.  PostSet has no return value.
foam.CLASS({
  name: 'PostSetTest',
  properties: [
    {
      name: 'a',
      postSet: function(oldValue, newValue) {
        log('postSet', oldValue, newValue);
      }
    }
  ]
});
var o = PostSetTest.create({a: 'Smith'});
o.a = 'Jones';
o.a = 'Green';
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 29, str: " <b>&gt;</b> postSet  Smith <b>&gt;</b> postSet Smith Jones <b>&gt;</b> postSet Jones Green" });


// Example 30
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Properties can define 'adapt', 'preSet', and 'postSet' all at once.
foam.CLASS({
  name: 'AdaptPrePostTest',
  properties: [
    {
      name: 'a',
      adapt: function(oldValue, newValue) {
        log('adapt: ', oldValue, newValue);
        return newValue + 1;
      },
      preSet: function(oldValue, newValue) {
        log('preSet: ', oldValue, newValue);
        return newValue + 1;
      },
      postSet: function(oldValue, newValue) {
        log('postSet: ', oldValue, newValue);
      }
    }
  ]
});
var o = AdaptPrePostTest.create();
o.a = 1;
o.a = 10;
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 30, str: " <b>&gt;</b> adapt:   1 <b>&gt;</b> preSet:   2 <b>&gt;</b> postSet:   3 <b>&gt;</b> adapt:  3 10 <b>&gt;</b> preSet:  3 11 <b>&gt;</b> postSet:  3 12" });


// Example 31
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Classes can also define Constnts.
foam.CLASS({
  name: 'ConstantTest',
  constants: {
    MEANING_OF_LIFE: 42,
    FAVOURITE_COLOR: 'green'
  }
});
var o = ConstantTest.create();
log(o.MEANING_OF_LIFE, o.FAVOURITE_COLOR);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 31, str: " <b>&gt;</b> 42 green" });


// Example 32
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Constants can also be accessed from the Class
log(ConstantTest.MEANING_OF_LIFE, ConstantTest.FAVOURITE_COLOR);
log(o.cls_.MEANING_OF_LIFE, o.cls_.FAVOURITE_COLOR);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 32, str: " <b>&gt;</b> 42 green <b>&gt;</b> 42 green" });


// Example 33
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Constants are constant
o.MEANING_OF_LIFE = 43;
log(o.MEANING_OF_LIFE);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 33, str: " <b>&gt;</b> 42" });


// Example 34
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Classes can be subclassed with 'extends:'.
// Methods in subclasses can override methods from ancestor classes, as is
// done below with toString().  Employee.toString() calls its parent classes
// toString() method by calling 'this.SUPER()'.
foam.CLASS({
  name: 'Person',
  properties: [ 'name', 'sex' ],
  methods: [
    function toString() { return this.name + ' ' + this.sex; }
  ]
});
foam.CLASS({
  name: 'Employee',
  extends: 'Person',
  properties: [ 'salary' ],
  methods: [
    function toString() { return this.SUPER() + ' ' + this.salary; }
  ]
});
var p = Person.create({name: 'John', sex: 'M'});
log(p.toString());
var e = Employee.create({name: 'Jane', sex: 'F', salary: 50000});
log(e.toString());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 34, str: " <b>&gt;</b> John M <b>&gt;</b> Jane F 50000" });


// Example 35
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Test if one class is a sub-class of another:
log(Person.isSubClass(Employee), Employee.isSubClass(Person));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 35, str: " <b>&gt;</b> true false" });


// Example 36
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// A Class is considered a sub-class of itself:
log(Person.isSubClass(Person));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 36, str: " <b>&gt;</b> true" });


// Example 37
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// FObject is the root class of all other classes:
log(foam.core.FObject.isSubClass(Employee), foam.core.FObject.isSubClass(Person));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 37, str: " <b>&gt;</b> true true" });


// Example 38
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// isSubClass() isn't confused by classes with the same name in different packages
foam.CLASS({
  package: 'com.acme.package',
  name: 'Person'
});
log(com.acme.package.Person.isSubClass(Person));
log(Person.isSubClass(com.acme.package.Person));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 38, str: " <b>&gt;</b> false <b>&gt;</b> false" });


// Example 39
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// isSubClass() works for interfaces
foam.CLASS({
  package: 'test',
  name: 'ThingI',
  methods: [ function foo() { log('foo'); } ]
});
foam.CLASS({
  package: 'test',
  name: 'C1',
  implements: [ 'test.ThingI' ]
});
log(test.ThingI.isSubClass(test.C1));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 39, str: " <b>&gt;</b> true" });


// Example 40
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// isSubClass() works for sub-interfaces
foam.CLASS({
  package: 'test',
  name: 'Thing2I',
  implements: [ 'test.ThingI' ]
});
foam.CLASS({
  package: 'test',
  name: 'Thing3I',
  implements: [ 'test.ThingI' ]
});
foam.CLASS({
  package: 'test',
  name: 'C2',
  implements: [ 'test.Thing2I' ]
});
var o = test.C2.create();
o.foo();
log(test.ThingI.isSubClass(test.C2));
log(test.Thing2I.isSubClass(test.C2));
log(test.Thing3I.isSubClass(test.C2));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 40, str: " <b>&gt;</b> foo <b>&gt;</b> true <b>&gt;</b> true <b>&gt;</b> false" });


// Example 41
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Larger package and imports/exports demo.
foam.CLASS({
  package: 'demo.bank',
  name: 'Account',
  imports: [ 'reportDeposit' ],
  properties: [
    { name: 'id'      },
    { name: 'status'  },
    { name: 'balance', value: 0 }
  ],
  methods: [
    {
      name: "setStatus",
      code: function (status) {
        this.status = status;
      }
    },
    {
      name: "deposit",
      code: function (amount) {
        this.balance += amount;
        this.reportDeposit(this.id, amount, this.balance);
        console.log('Bank: ', this.__context__.Bank);
        return this.balance;
      }
    },
    {
      name: "withdraw",
      code: function (amount) {
        this.balance -= amount;
        return this.balance;
      }
    }
  ]
});
foam.CLASS({
  package: 'demo.bank',
  name: 'SavingsAccount',
  extends: 'demo.bank.Account',
  methods: [
    {
      name: "withdraw",
      code: function (amount) {
        // charge a fee
        this.balance -= 0.05;
        return this.SUPER(amount);
      }
    }
  ]
});
foam.CLASS({
  package: 'demo.bank',
  name: 'AccountTester',
  requires: [
    'demo.bank.Account as A',
    'demo.bank.SavingsAccount'
  ],
  imports: [ 'log as l' ],
  exports: [
    'reportDeposit',
    'as Bank' // exports 'this'
  ],
  methods: [
    function reportDeposit(id, amount, bal) {
      this.l('Deposit: ', id, amount, bal);
    },
    function test() {
      var a = this.A.create({id: 42});
      a.setStatus(true);
      a.deposit(100);
      a.withdraw(10);
      a.describe();
      var s = this.SavingsAccount.create({id: 43});
      s.setStatus(true);
      s.deposit(100);
      s.withdraw(10);
      s.describe();
    }
  ]
});
var a = demo.bank.AccountTester.create(null);
a.test();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 41, str: "Deposit:  42 100 100Bank:  demo.bank.AccountTesterInstance of AccountAxiom Type           Name           Value----------------------------------------------------Property             id             42Property             status         trueProperty             balance        90\nDeposit:  43 100 100Bank:  demo.bank.AccountTesterInstance of SavingsAccountAxiom Type           Name           Value----------------------------------------------------Property             id             43Property             status         trueProperty             balance        89.95\n" });


// Example 42
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// In addition to being extended, a Class can also be refined.
// Refinement upgrades the existing class rather than create a
// new sub-class. In the following example we add 'salary' to
// the person class, rather than creating a new Employee sub-class.
foam.CLASS({
  name: 'Person',
  properties: [ 'name', 'sex' ],
  methods: [
    function toString() { return this.name + ' ' + this.sex; }
  ]
});
var oldPerson = Person.create({name: 'John', sex: 'M'});
log(oldPerson.toString());
foam.CLASS({
  refines: 'Person',
  properties: [ { class: 'Float', name: 'salary', value: 0 } ],
  methods: [
    function toString() { return this.name + ' ' + this.sex + ' ' + this.salary; }
  ]
});
Person.describe();
var e = Person.create({name: 'Jane', sex: 'F', salary: 50000});
log(e.toString());
log(oldPerson.toString());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 42, str: " <b>&gt;</b> John MCLASS:   Personextends: FObjectAxiom Type           Source Class   Name----------------------------------------------------Property             Person         nameProperty             Person         sexMethod               Person         toStringFloat                Person         salaryMethod               FObject        initArgsMethod               FObject        initMethod               FObject        hasOwnPropertyMethod               FObject        clearPropertyMethod               FObject        setPrivate_Method               FObject        getPrivate_Method               FObject        hasOwnPrivate_Method               FObject        clearPrivate_Method               FObject        pubPropertyChange_Method               FObject        validateMethod               FObject        lookupMethod               FObject        assertMethod               FObject        errorMethod               FObject        logMethod               FObject        warnMethod               FObject        createListenerList_Method               FObject        listeners_Method               FObject        notify_Method               FObject        hasListenersMethod               FObject        pubMethod               FObject        pub_Method               FObject        subMethod               FObject        slotMethod               FObject        isDestroyedMethod               FObject        onDestroyMethod               FObject        destroyMethod               FObject        equalsMethod               FObject        compareToMethod               FObject        diffMethod               FObject        hashCodeMethod               FObject        cloneMethod               FObject        copyFromanonymous            FObject        __context__Method               FObject        unknownArgTopic                FObject        propertyChangeMethod               FObject        describeMethod               FObject        stringifyMethod               FObject        toE\n <b>&gt;</b> Jane F 50000 <b>&gt;</b> John M 0" });


// Example 43
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Refine a Property
log(Person.SALARY.cls_.name);
foam.CLASS({
  refines: 'Person',
  properties: [ { name: 'salary', value: 30000 } ]
});
log(Person.SALARY.cls_.name);
var o = Person.create({name:'John'});
log(o.salary);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 43, str: " <b>&gt;</b> Float <b>&gt;</b> Property <b>&gt;</b> 30000" });


// Example 44
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Currently unsupported and unlikely to be supported.
// Refine a Property Class
foam.CLASS({ name: 'Salary', extends: 'Float' });
foam.CLASS({ name: 'Emp', properties: [ { class: 'Salary', name: 'salary' } ] });
foam.CLASS({ refines: 'Salary', properties: [ {name: 'value', value: 30000} ]});
log(Emp.create().salary);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 44, str: " <b>&gt;</b> 0" });


// Example 45
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Refine foam.core Property Class
foam.CLASS({ name: 'Emp2', properties: [ { class: 'Float', name: 'salary' } ] });
foam.CLASS({ refines: 'Float', properties: [ [ 'javaClass', 'Float' ] ]});
log(Emp2.SALARY.javaClass);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 45, str: " <b>&gt;</b> Float" });


// Example 46
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Currently unsupported and unlikely to be supported.
// Refine a SuperProperty Class
foam.CLASS({ name: 'SuperClass', properties: [ 'p1' ]});
foam.CLASS({ name: 'SubClass', extends: 'SuperClass', properties: [ 'p1' ]});
foam.CLASS({ refines: 'SuperClass', properties: [ { name: 'p1', value: 42 } ]});
log('super: ', SuperClass.create().p1, 'sub: ', SubClass.create().p1);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 46, str: " <b>&gt;</b> super:  42 sub:  " });


// Example 47
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Currently unsupported and unlikely to be supported.
// Refine a SuperProperty Class
foam.CLASS({ name: 'SuperClass', properties: [ 'p1' ]});
foam.CLASS({ name: 'MidClass', extends: 'SuperClass' });
foam.CLASS({ name: 'SubClass', extends: 'MidClass', properties: [ 'p1' ]});
foam.CLASS({ refines: 'SuperClass', properties: [ { name: 'p1', value: 42 } ]});
log('super: ', SuperClass.create().p1, 'mid: ', MidClass.create().p1, 'sub: ', SubClass.create().p1);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 47, str: " <b>&gt;</b> super:  42 mid:  42 sub:  " });


// Example 48
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// TODO: BooleanProperty
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 48, str: "" });


// Example 49
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// TODO: IntProperty
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 49, str: "" });


// Example 50
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// TODO: StringProperty
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 50, str: "" });


// Example 51
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// TODO: ArrayProperty
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 51, str: "" });


// Example 52
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Listeners are pre-bound Methods, suitable for use as callbacks (DOM, or otherwise).
foam.CLASS({
  name: 'ListenerTest',
  properties: [ 'name' ],
  methods: [ function m1() { console.log('m1', this.name); } ],
  listeners: [ function l1() { console.log('l1', this.name); } ]
});
var o = ListenerTest.create({name: 'Steve'});
// When called as methods, the same as Methods.
log(o.m1(), o.l1());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 52, str: "m1 Stevel1 Steve <b>&gt;</b>  " });


// Example 53
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// But when called as functions, the method forgets its 'self' and doesn't work,
// but the listener does.
var m = o.m1, l = o.l1;
log(m(), l());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 53, str: "m1 l1 Steve <b>&gt;</b>  " });


// Example 54
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// It's an error to make a listener both isMerged and isFramed.
foam.CLASS({
  name: 'MergedAndFramedTest',
  listeners: [
    {
      name: 'l',
      isMerged: true,
      isFramed: true,
      code: function() { log('listener'); }
    }
  ]
});
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 54, str: " <b>&gt;</b> Assertion failed: Listener can't be both isMerged and isFramed:  l <b>&gt;</b> Exception:  assert" });


// Example 59
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Listeners, like Methods, have SUPER support.
foam.CLASS({
  name: 'Alarm',
  listeners: [
    function alarm() { console.log('alarm'); }
  ]
});
foam.CLASS({
  name: 'LongAlarm',
  extends: 'Alarm',
  listeners: [
    function alarm() { console.log('LongAlarm:'); this.SUPER(); this.SUPER(); this.SUPER(); }
  ]
});
Alarm.create().alarm();
LongAlarm.create().alarm();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 59, str: "alarmLongAlarm:alarmalarmalarm" });


// Example 60
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Actions are methods which have extra information to make it easier
// to call them from GUI's. Extra information includes things like:
// a label, speech label, functions to determine if the action is currently
// available and enabled, user help text, etc.
foam.CLASS({
  name: 'ActionTest',
  properties: [ 'enabled', 'available' ],
  actions: [
    function shortForm() { log('short action'); },
    {
      name: 'longForm',
      isAvailable: function() { return this.available; },
      isEnabled: function() { return this.enabled; },
      code: function() { log('long action'); }
    }
  ]
});
var o = ActionTest.create();
o.shortForm();
o.longForm(); // Won't be called because is not enabled or available yet
log(o.enabled = true);
o.longForm(); // Won't be called because is not available yet
log(o.available = true);
o.longForm();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 60, str: " <b>&gt;</b> short action <b>&gt;</b> true <b>&gt;</b> true <b>&gt;</b> long action" });


// Example 61
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// In addition to class-inheritance, FOAM also supports
// interfaces, which are a form of multiple-inheritance which
// copy Axioms from another model.
foam.CLASS({
  name: 'SampleI',
  properties: [ 't1', 't2', 't3' ],
  methods: [
    function tfoo() { console.log('ffoo'); },
    function tbar() { console.log('tbar'); }
  ]
});
foam.CLASS({
  name: 'ImplementsTest',
  implements: ['SampleI'],
  properties: [ 'p1', 'p2', 'p3' ],
  methods: [
    function foo() { console.log('foo'); },
    function bar() { console.log('bar'); }
  ]
});
ImplementsTest.describe();
var tt = ImplementsTest.create({p1:1, t1:2});
tt.describe();
tt.tfoo(); // From SampleI
tt.foo();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 61, str: "CLASS:   ImplementsTestextends: FObjectAxiom Type           Source Class   Name----------------------------------------------------Implements           ImplementsTest implements_SampleIProperty             ImplementsTest p1Property             ImplementsTest p2Property             ImplementsTest p3Method               ImplementsTest fooMethod               ImplementsTest barProperty             ImplementsTest t1Property             ImplementsTest t2Property             ImplementsTest t3Method               ImplementsTest tfooMethod               ImplementsTest tbarMethod               FObject        initArgsMethod               FObject        initMethod               FObject        hasOwnPropertyMethod               FObject        clearPropertyMethod               FObject        setPrivate_Method               FObject        getPrivate_Method               FObject        hasOwnPrivate_Method               FObject        clearPrivate_Method               FObject        pubPropertyChange_Method               FObject        validateMethod               FObject        lookupMethod               FObject        assertMethod               FObject        errorMethod               FObject        logMethod               FObject        warnMethod               FObject        createListenerList_Method               FObject        listeners_Method               FObject        notify_Method               FObject        hasListenersMethod               FObject        pubMethod               FObject        pub_Method               FObject        subMethod               FObject        slotMethod               FObject        isDestroyedMethod               FObject        onDestroyMethod               FObject        destroyMethod               FObject        equalsMethod               FObject        compareToMethod               FObject        diffMethod               FObject        hashCodeMethod               FObject        cloneMethod               FObject        copyFromMethod               FObject        toStringanonymous            FObject        __context__Method               FObject        unknownArgTopic                FObject        propertyChangeMethod               FObject        describeMethod               FObject        stringifyMethod               FObject        toE\nInstance of ImplementsTestAxiom Type           Name           Value----------------------------------------------------Property             p1             1Property             p2             Property             p3             Property             t1             2Property             t2             Property             t3             \nffoofoo" });


// Example 62
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Unlike regular inheritance with extends:, classes
// can implement: from multiple sources.
foam.CLASS({
  name: 'Sample2I',
  properties: [ 'tb1', 'tb2', 'tb3' ],
  methods: [
    function tbfoo() { console.log('ffoo'); },
    function tbbar() { console.log('tbar'); }
  ]
});
foam.CLASS({
  name: 'ImplementsTest2',
  implements: ['SampleI', 'Sample2I']
});
ImplementsTest2.describe();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 62, str: "CLASS:   ImplementsTest2extends: FObjectAxiom Type           Source Class   Name----------------------------------------------------Implements           ImplementsTest implements_SampleIImplements           ImplementsTest implements_Sample2IProperty             ImplementsTest tb1Property             ImplementsTest tb2Property             ImplementsTest tb3Method               ImplementsTest tbfooMethod               ImplementsTest tbbarProperty             ImplementsTest t1Property             ImplementsTest t2Property             ImplementsTest t3Method               ImplementsTest tfooMethod               ImplementsTest tbarMethod               FObject        initArgsMethod               FObject        initMethod               FObject        hasOwnPropertyMethod               FObject        clearPropertyMethod               FObject        setPrivate_Method               FObject        getPrivate_Method               FObject        hasOwnPrivate_Method               FObject        clearPrivate_Method               FObject        pubPropertyChange_Method               FObject        validateMethod               FObject        lookupMethod               FObject        assertMethod               FObject        errorMethod               FObject        logMethod               FObject        warnMethod               FObject        createListenerList_Method               FObject        listeners_Method               FObject        notify_Method               FObject        hasListenersMethod               FObject        pubMethod               FObject        pub_Method               FObject        subMethod               FObject        slotMethod               FObject        isDestroyedMethod               FObject        onDestroyMethod               FObject        destroyMethod               FObject        equalsMethod               FObject        compareToMethod               FObject        diffMethod               FObject        hashCodeMethod               FObject        cloneMethod               FObject        copyFromMethod               FObject        toStringanonymous            FObject        __context__Method               FObject        unknownArgTopic                FObject        propertyChangeMethod               FObject        describeMethod               FObject        stringifyMethod               FObject        toE\n" });


// Example 63
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// FOAM also has Property-Inheritance.
// Test that a sub-class Property inherits its parent Property's class
foam.CLASS({
  name: 'PropertyInheritA',
  properties: [ {class: 'Boolean', name: 'sameName'} ]
});
foam.CLASS({
  name: 'PropertyInheritB',
  extends: 'PropertyInheritA',
  properties: [ 'sameName' ]
});
log(PropertyInheritA.SAME_NAME.cls_.id, PropertyInheritB.SAME_NAME.cls_.id);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 63, str: " <b>&gt;</b> foam.core.Boolean foam.core.Boolean" });


// Example 64
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
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
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 64, str: " <b>&gt;</b> 1 2 5 10" });


// Example 65
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Inner-classes can also be accessed from the outer-class
InnerClassTest.InnerClass1.describe();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 65, str: "CLASS:   InnerClass1extends: FObjectAxiom Type           Source Class   Name----------------------------------------------------Property             InnerClass1    aProperty             InnerClass1    bMethod               FObject        initArgsMethod               FObject        initMethod               FObject        hasOwnPropertyMethod               FObject        clearPropertyMethod               FObject        setPrivate_Method               FObject        getPrivate_Method               FObject        hasOwnPrivate_Method               FObject        clearPrivate_Method               FObject        pubPropertyChange_Method               FObject        validateMethod               FObject        lookupMethod               FObject        assertMethod               FObject        errorMethod               FObject        logMethod               FObject        warnMethod               FObject        createListenerList_Method               FObject        listeners_Method               FObject        notify_Method               FObject        hasListenersMethod               FObject        pubMethod               FObject        pub_Method               FObject        subMethod               FObject        slotMethod               FObject        isDestroyedMethod               FObject        onDestroyMethod               FObject        destroyMethod               FObject        equalsMethod               FObject        compareToMethod               FObject        diffMethod               FObject        hashCodeMethod               FObject        cloneMethod               FObject        copyFromMethod               FObject        toStringanonymous            FObject        __context__Method               FObject        unknownArgTopic                FObject        propertyChangeMethod               FObject        describeMethod               FObject        stringifyMethod               FObject        toE\n" });


// Example 66
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Inner-classes do not appear in the global namespace
log(! global.InnerClass1);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 66, str: " <b>&gt;</b> true" });


// Example 67
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Similar to Inner-classes, there's also Inner-enums
foam.CLASS({
  name: 'InnerEnumTest',
  enums: [
    { name: 'InnerEnum', values: [
    { name: 'OPEN',   label: 'Open'   },
    { name: 'CLOSED', label: 'Closed' }
    ] }
  ],
  methods: [
    function init() {
      log(this.InnerEnum.OPEN, this.InnerEnum.CLOSED)
    }
  ]
});
InnerEnumTest.create();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 67, str: " <b>&gt;</b> OPEN CLOSED" });


// Example 68
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Inner-enums can also be accessed from the outer-class
InnerEnumTest.InnerEnum.describe();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 68, str: "CLASS:   InnerEnumextends: Axiom Type           Source Class   Name----------------------------------------------------Int                  InnerEnum      ordinalString               InnerEnum      nameString               InnerEnum      labelMethod               InnerEnum      toStringanonymous            InnerEnum      enum_createEnumValue            InnerEnum      OPENEnumValue            InnerEnum      CLOSEDMethod               FObject        initArgsMethod               FObject        initMethod               FObject        hasOwnPropertyMethod               FObject        clearPropertyMethod               FObject        setPrivate_Method               FObject        getPrivate_Method               FObject        hasOwnPrivate_Method               FObject        clearPrivate_Method               FObject        pubPropertyChange_Method               FObject        validateMethod               FObject        lookupMethod               FObject        assertMethod               FObject        errorMethod               FObject        logMethod               FObject        warnMethod               FObject        createListenerList_Method               FObject        listeners_Method               FObject        notify_Method               FObject        hasListenersMethod               FObject        pubMethod               FObject        pub_Method               FObject        subMethod               FObject        slotMethod               FObject        isDestroyedMethod               FObject        onDestroyMethod               FObject        destroyMethod               FObject        equalsMethod               FObject        compareToMethod               FObject        diffMethod               FObject        hashCodeMethod               FObject        cloneMethod               FObject        copyFromanonymous            FObject        __context__Method               FObject        unknownArgTopic                FObject        propertyChangeMethod               FObject        describeMethod               FObject        stringifyMethod               FObject        toE\n" });


// Example 69
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Inner-enums do not appear in the global namespace
log(! global.InnerEnum);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 69, str: " <b>&gt;</b> true" });


// Example 70
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Objects support pub() for pubing events,
// and sub() for listening for pubed events.
foam.CLASS({
  name: 'PubSubTest'
});
var o = PubSubTest.create();
// Install a listener that listens to all events
o.sub(function() { console.log('global listener: ', [].join.call(arguments, ' ')); });
o.sub('alarm', function() { console.log('alarm: ', [].join.call(arguments, ' ')); });
o.pub('alarm', 'on');
o.pub('lifecycle', 'loaded');
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 70, str: "global listener:  [object Object] alarm onalarm:  [object Object] alarm onglobal listener:  [object Object] lifecycle loaded" });


// Example 71
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Test publishing with many args
o.pub(1);
o.pub(1,2);
o.pub(1,2,3);
o.pub(1,2,3,4);
o.pub(1,2,3,4,5);
o.pub(1,2,3,4,5,6);
o.pub(1,2,3,4,5,6,7);
o.pub(1,2,3,4,5,6,7,8);
o.pub(1,2,3,4,5,6,7,8,9);
o.pub(1,2,3,4,5,6,7,8,9,10);
o.pub(1,2,3,4,5,6,7,8,9,10,11);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 71, str: "global listener:  [object Object] 1global listener:  [object Object] 1 2global listener:  [object Object] 1 2 3global listener:  [object Object] 1 2 3 4global listener:  [object Object] 1 2 3 4 5global listener:  [object Object] 1 2 3 4 5 6global listener:  [object Object] 1 2 3 4 5 6 7global listener:  [object Object] 1 2 3 4 5 6 7 8global listener:  [object Object] 1 2 3 4 5 6 7 8 9global listener:  [object Object] 1 2 3 4 5 6 7 8 9 10global listener:  [object Object] 1 2 3 4 5 6 7 8 9 10 11" });


// Example 72
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// A Class can declare 'Topics' that it publishes events for.
foam.CLASS({
  name: 'TopicTest',
  topics: [ 'alarm' ]
});
var o = TopicTest.create();
o.sub('alarm', function(_, __, state) { console.log('alarm: ', state); });
// The next line uses the Topic and is slightly shorter than the equivalent above.
o.alarm.sub(function(_, __, state) { console.log('alarm (topic): ', state); });
o.alarm.pub('on');
o.pub('alarm', 'off');
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 72, str: "alarm (topic):  onalarm:  onalarm (topic):  offalarm:  off" });


// Example 73
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Objects implicitly pub events on the 'propertyChange' topic when
// property values change.
foam.CLASS({
  name: 'PropertyChangeTest',
  properties: [ 'a', 'b' ]
});
o = PropertyChangeTest.create();
// Listen for all propertyChange events:
o.propertyChange.sub(function(sub, p, name, dyn) { console.log('propertyChange: ', p, name, dyn.getPrev(), dyn.get()); });
// Listen for only changes to the 'a' Property:
o.propertyChange.sub('a', function(sub, p, name, dyn) { console.log('propertyChange.a: ', p, name, dyn.getPrev(), dyn.get()); });
o.a = 42;
o.b = 'bar';
o.a++;
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 73, str: "propertyChange:  propertyChange a  42propertyChange.a:  propertyChange a  42propertyChange:  propertyChange b  barpropertyChange:  propertyChange a 42 43propertyChange.a:  propertyChange a 42 43" });


// Example 74
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// There are three ways to unsubscribe a listener
// 1. Call .destroy() on the Destroyable that sub() returns
var sub = o.sub(l);
o.pub('fire');
sub.destroy();
o.pub("fire again, but nobody's listenering");
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 74, str: "l1 Steve" });


// Example 75
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// 2. Destroy the subscription, which is supplied to the listener
var l = function(sub) {
  sub.destroy();
  console.log.apply(console.log, arguments);
};
o.sub(l);
o.pub('fire');
o.pub("fire again, but nobody's listenering");
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 75, str: "[object Object] fire" });


// Example 76
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// 3. If you only want to receive the first event, decorate your
// listener with foam.events.oneTime() and it will cancel the subscription
// when it receives the first event.
o.sub(foam.events.oneTime(function() { console.log.apply(console.log, arguments); }));
o.pub('fire');
o.pub("fire again, but nobody's listenering");
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 76, str: "[object Object] fire" });


// Example 77
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Slots are like Object-Oriented pointers.
// A property's slot is accessed as 'name'$.
// get() is used to dereference the value of a slot
var p = Person.create({name: 'Bob'});
var dyn = p.name$;
log(dyn.get());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 77, str: " <b>&gt;</b> Bob" });


// Example 78
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// set() is used to set a Slot's value:
dyn.set('John');
log(p.name, dyn.get());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 78, str: " <b>&gt;</b> John John" });


// Example 79
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Calling obj.slot('name') is the same as obj.name$.
var p = Person.create({name: 'Bob'});
var dyn = p.slot('name');
log(dyn.get());
dyn.set('John');
log(dyn.get());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 79, str: " <b>&gt;</b> Bob <b>&gt;</b> John" });


// Example 80
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Nested slots
foam.CLASS({ name: 'Holder', properties: [ 'data' ] });
var p1 = Person.create({name: 'John'});
var p2 = Person.create({name: 'Paul'});
var h = Holder.create({data: p1});
var s = h.data$.dot('name');
s.sub(function() { console.log('change: ', arguments, h.data.name); });
log(s.get());
s.set('George');
log(p1.name);
p1.name = 'Ringo';
log('Setting to p2');
h.data = p2;
log(s.get());
s.set('George');
log(p2.name);
p2.name = 'Ringo';
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 80, str: " <b>&gt;</b> Johnchange:  [object Arguments] George <b>&gt;</b> Georgechange:  [object Arguments] Ringo <b>&gt;</b> Setting to p2change:  [object Arguments] Paul <b>&gt;</b> Paulchange:  [object Arguments] George <b>&gt;</b> Georgechange:  [object Arguments] Ringo" });


// Example 81
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Nested subscription
// Subscribe to the value of the slot data$, removing the
// subscription and resubscribing to the new value of data$
// if it changes.
foam.CLASS({ name: 'Holder', properties: [ 'data' ] });
var p1 = Person.create({name: 'John'});
var p2 = Person.create({name: 'Paul'});
var h = Holder.create({data: p1});
h.data$.valueSub(function(e) { console.log('sub change: ', e.src.name, Array.from(arguments).join(' ')); });
p1.name = 'Peter';
p2.name = 'Mary';
h.data = p2;
p1.name = 'James';
p2.name = 'Ringo';
p2.pub('test','event');
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 81, str: "sub change:  Peter [object Object] propertyChange name PropertySlot(Person.name)sub change:  Ringo [object Object] propertyChange name PropertySlot(Person.name)sub change:  Ringo [object Object] test event" });


// Example 82
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Two-Way Data-Binding
// Slots can be assigned, causing two values to be
// bound to the same value.
var p1 = Person.create(), p2 = Person.create();
p1.name$ = p2.name$;
p1.name = 'John';
log(p1.name, p2.name);
p2.name = 'Steve';
log(p1.name, p2.name);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 82, str: " <b>&gt;</b> John John <b>&gt;</b> Steve Steve" });


// Example 83
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Another way to link two Slots is to call .linkFrom() on one of them.
var p1 = Person.create({name:'p1'}), p2 = Person.create({name:'p2'});
var d = p1.name$.linkFrom(p2.name$);
p1.name = 'John';
log(p1.name, p2.name);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 83, str: " <b>&gt;</b> John John" });


// Example 84
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// But this style of link can be broken by calling .destroy()
// on the object return from .linkFrom/To().
d.destroy();
p2.name = 'Steve';
log(p1.name, p2.name);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 84, str: " <b>&gt;</b> John Steve" });


// Example 85
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// linkTo() is the same as linkFrom(), except that the initial value
// is taken from 'this' instead of the other object.
var p1 = Person.create({name:'p1'}), p2 = Person.create({name:'p2'});
var d = p1.name$.linkTo(p2.name$);
p1.name = 'John';
log(p1.name, p2.name);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 85, str: " <b>&gt;</b> John John" });


// Example 86
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Two values can be linked through a relationship,
// which provides functions to adapt between the two values.
foam.CLASS({
  name: 'Temperature',
  properties: [
    { class: 'Float', name: 'f' },
    { class: 'Float', name: 'c' }
  ],
  methods: [
    function init() {
      this.f$.relateTo(
        this.c$,
        function c2f(f) { log('f', f); return 9/5 * f + 32; },
        function f2c(c) { log('fp', c); return 5/9 * ( c - 32 ); });
    }
  ]
});
var t = Temperature.create();
log(t.stringify());
t.f = 100;
log(t.stringify());
t.c = 100;
log(t.stringify());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 86, str: " <b>&gt;</b> f 0 <b>&gt;</b> {\n	class: \"Temperature\",\n	f: 0,\n	c: 32\n} <b>&gt;</b> f 100 <b>&gt;</b> {\n	class: \"Temperature\",\n	f: 100,\n	c: 212\n} <b>&gt;</b> fp 100 <b>&gt;</b> {\n	class: \"Temperature\",\n	f: 37.77777777777778,\n	c: 100\n}" });


// Example 87
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// One-Way Data-Binding
// Calling .linkFrom()/.linkTo() creates a two-way data-binding, meaning a change in either
// value is reflected in the other.  But FOAM supports one-way data-binding as well.
// To do this, use the .follow() method.
var d = p1.name$.follow(p2.name$);
p2.name = 'Ringo'; // Will update p1 and p2
p2.name = 'Paul'; // Will update p1 and p2
log(p1.name, p2.name);
p1.name = 'George'; // Will only update p1
log(p1.name, p2.name);
d.destroy();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 87, str: " <b>&gt;</b> Paul Paul <b>&gt;</b> George George" });


// Example 88
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Follow copies the initial value.
p1 = Person.create();
p2 = Person.create({name:'John'});
p1.name$.follow(p2.name$);
log(p1.name, p2.name);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 88, str: " <b>&gt;</b> John John" });


// Example 89
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// One-Way Data-Binding, with Map function (mapFrom)
var d = p1.name$.mapFrom(p2.name$, function(n) {
  return "Mr. " + n;
});
p1.name$.clear();
p2.name$.clear();
p2.name = 'Ringo'; // Will update p1 and p2
log(p1.name, p2.name);
p1.name = 'George'; // Will only update p1
log(p1.name, p2.name);
d.destroy();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 89, str: " <b>&gt;</b> Ringo Ringo <b>&gt;</b> George Ringo" });


// Example 90
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// One-Way Data-Binding, with Map function (mapTo)
var d = p2.name$.mapTo(p1.name$, function(n) {
  return "Mr. " + n;
});
p1.name$.clear();
p2.name$.clear();
p2.name = 'Ringo'; // Will update p1 and p2
log(p1.name, p2.name);
p1.name = 'George'; // Will only update p1
log(p1.name, p2.name);
d.destroy();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 90, str: " <b>&gt;</b> Ringo Ringo <b>&gt;</b> George Ringo" });


// Example 91
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Slots also let you check if the value is defined by calling isDefined().
// Calling obj.name$.isDefined() is equivalent to obj.hasOwnProperty('name');
foam.CLASS({name: 'IsDefinedTest', properties: [ { name: 'a', value: 42 } ]});
var o = IsDefinedTest.create();
var dv = o.a$;
log(dv.isDefined());
dv.set(99);
log(dv.isDefined());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 91, str: " <b>&gt;</b> false <b>&gt;</b> true" });


// Example 92
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// You can reset a Slot to its default value by calling .clear().
// Calling obj.name$.clear() is equivalent to obj.clearProperty('name');
dv.clear();
log(dv.get(), dv.isDefined());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 92, str: " <b>&gt;</b> 42 false" });


// Example 93
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// ConstantSlot creates an immutable slot.
var s = foam.core.ConstantSlot.create({value: 42});
log(s.get());
s.value = 66;
s.set(66);
log(s.get());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 93, str: " <b>&gt;</b> 42 <b>&gt;</b> 42" });


// Example 94
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// ExpressionSlot creates a Slot from a list of Slots
// and a function which combines them into a new value.
foam.CLASS({name: 'Person', properties: ['fname', 'lname']});
var p = Person.create({fname: 'John', lname: 'Smith'});
var e = foam.core.ExpressionSlot.create({
  args: [ p.fname$, p.lname$],
  code: function(f, l) { return f + ' ' + l; }
});
log(e.get());
e.sub(log);
p.fname = 'Steve';
p.lname = 'Jones';
log(e.get());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 94, str: " <b>&gt;</b> John Smith <b>&gt;</b> [object Object] propertyChange value PropertySlot(foam.core.ExpressionSlot.value) <b>&gt;</b> Steve Jones" });


// Example 95
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// ExpressionSlot can also be supplied an object to work with, and then takes slots from function argument names.
var p = foam.CLASS({name: 'Person', properties: [ 'f', 'l' ]}).create({f:'John', l: 'Smith'});
var e = foam.core.ExpressionSlot.create({
  obj: p,
  code: function(f, l) { return f + ' ' + l; }
});
log(e.get());
e.sub(log);
p.f = 'Steve';
p.l = 'Jones';
log(e.get());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 95, str: " <b>&gt;</b> John Smith <b>&gt;</b> [object Object] propertyChange value PropertySlot(foam.core.ExpressionSlot.value) <b>&gt;</b> Steve Jones" });


// Example 96
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Destroy the ExpressionSlot to prevent further updates.
e.destroy();
p.fname = 'Steve';
p.lname = 'Jones';
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 96, str: "" });


// Example 97
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// The same functionality of ExpressionSlot is built into Properties
// with the 'expression' feature. Expression properties are invalidated
// whenever of their listed source values change, but are only recalculated
// when their value is accessed.
foam.CLASS({
  name: 'Person',
  properties: [
    'fname',
    'lname',
    {
      name: 'name',
      expression: function(fname, lname) { return fname + ' ' + lname; }
    }
  ]
});
var p = Person.create({fname: 'John', lname: 'Smith'});
p.describe();
p.sub(log);
p.fname = 'Steve';
log(p.fname, p.lname, ' = ', p.name);
p.lname = 'Jones';
log(p.fname, p.lname, ' = ', p.name);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 97, str: "Instance of PersonAxiom Type           Name           Value----------------------------------------------------Property             fname          JohnProperty             lname          SmithProperty             name           John Smith\n <b>&gt;</b> [object Object] propertyChange fname PropertySlot(Person.fname) <b>&gt;</b> [object Object] propertyChange name PropertySlot(Person.name) <b>&gt;</b> Steve Smith  =  Steve Smith <b>&gt;</b> [object Object] propertyChange lname PropertySlot(Person.lname) <b>&gt;</b> [object Object] propertyChange name PropertySlot(Person.name) <b>&gt;</b> Steve Jones  =  Steve Jones" });


// Example 98
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Expression properties can also be explicitly set, at which point the
// dynamic expression no longer holds.
log(p.name, p.hasOwnProperty('name'));
p.name = 'Kevin Greer';
log(p.name, p.hasOwnProperty('name'));
p.fname = 'Sebastian';
log(p.fname, p.lname, ':', p.name);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 98, str: " <b>&gt;</b> Steve Jones false <b>&gt;</b> [object Object] propertyChange name PropertySlot(Person.name) <b>&gt;</b> Kevin Greer true <b>&gt;</b> [object Object] propertyChange fname PropertySlot(Person.fname) <b>&gt;</b> Sebastian Jones : Kevin Greer" });


// Example 99
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Clearing a set expression property has it revert to its expression value.
log(p.name, p.hasOwnProperty('name'));
p.clearProperty('name');
log(p.name, p.hasOwnProperty('name'));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 99, str: " <b>&gt;</b> Kevin Greer true <b>&gt;</b> [object Object] propertyChange name PropertySlot(Person.name) <b>&gt;</b> Steve Jones false" });


// Example 100
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Destroyables (objects with a destroy() method) or functions
// can be registered to be called when an object is destroyed.
var o = foam.core.FObject.create();
var o2 = foam.core.FObject.create();
o.onDestroy(function() { log('destroy 1'); });
o2.onDestroy(function() { log('destroy 2'); });
o.onDestroy(o2);
o.destroy();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 100, str: " <b>&gt;</b> destroy 2 <b>&gt;</b> destroy 1" });


// Example 101
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// It doesn't hurt to try and destroy an object more than once.
o.destroy();
o.destroy();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 101, str: "" });


// Example 102
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// If an Object is destroyed, it will unsubscribe from any
// subscriptions which subsequently try to deliver events.
var source = foam.core.FObject.create();
var sink = foam.CLASS({
  name: 'Sink',
  listeners: [
    function l() {
      log('ping');
    }
  ]
}).create();
source.sub(sink.l);
source.pub('ping');
source.pub('ping');
sink.destroy();
source.pub('ping');
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 102, str: " <b>&gt;</b> ping <b>&gt;</b> pingwarn: Destroying stale subscription for Sink" });


// Example 103
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Model validation, extends and refines are mutually-exclusive
foam.CLASS({
  name: 'EandRTest',
  extends: 'FObject',
  refines: 'Model'
});
EandRTest.model_.validate();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 103, str: " <b>&gt;</b> Exception:  EandRTest: \"extends\" and \"refines\" are mutually exclusive." });


// Example 104
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Model validation, properties must have names
foam.CLASS({
  name: 'ValidationTest',
  properties: [
    { name: '' }
  ]
});
ValidationTest.model_.validate();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 104, str: " <b>&gt;</b> Exception:  Required property foam.core.Property.name not defined." });


// Example 105
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Action validation, actions must have names
foam.CLASS({
  name: 'ActionNameValidation',
  actions: [
    { name: '', code: function() {} }
  ]
});
ActionNameValidation.model_.validate();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 105, str: " <b>&gt;</b> Exception:  Required property foam.core.Action.name not defined." });


// Example 106
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Action validation, actions must have code
foam.CLASS({
  name: 'ActionCodeValidation',
  actions: [
    { name: 'test' }
  ]
});
ActionCodeValidation.model_.validate();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 106, str: " <b>&gt;</b> Exception:  Required property foam.core.Action.code not defined." });


// Example 107
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Model validation, properties names must not end with '$'
foam.CLASS({
  name: 'DollarValidationTest',
  properties: [
    { name: 'name$' }
  ]
});
DollarValidationTest.model_.validate();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 107, str: " <b>&gt;</b> Assertion failed: Illegal Property Name: Can't end with \"$\":  name$ <b>&gt;</b> Exception:  assert" });


// Example 108
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Property constants musn't conflict
foam.CLASS({
  name: 'ConstantConflictTest',
  properties: [ 'firstName', 'FirstName' ]
});
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 108, str: " <b>&gt;</b> Exception:  Class constant conflict: ConstantConflictTest.FIRST_NAME from: FirstName and firstName" });


// Example 109
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Properties must not have the same name
foam.CLASS({
  name: 'AxiomConflict1',
  properties: [ 'sameName', 'sameName' ]
});
AxiomConflict1.create();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 109, str: " <b>&gt;</b> Assertion failed: Axiom name conflict in AxiomConflict1 : sameName <b>&gt;</b> Exception:  assert" });


// Example 110
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Methods must not have the same name
foam.CLASS({
  name: 'AxiomConflict2',
  methods: [ function sameName() {}, function sameName() {} ]
});
AxiomConflict2.create();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 110, str: " <b>&gt;</b> Assertion failed: Axiom name conflict in AxiomConflict2 : sameName <b>&gt;</b> Exception:  assert" });


// Example 111
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Axioms must not have the same name
foam.CLASS({
  name: 'AxiomConflict3',
  properties: [ 'sameName' ],
  methods: [ function sameName() {} ]
});
AxiomConflict3.create();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 111, str: " <b>&gt;</b> Assertion failed: Axiom name conflict in AxiomConflict3 : sameName <b>&gt;</b> Exception:  assert" });


// Example 112
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Error if attempt to change a Property to a non-Property
foam.CLASS({
  name: 'AxiomChangeSuper',
  properties: [ 'sameName' ]
});
foam.CLASS({
  name: 'AxiomChangeSub',
  extends: 'AxiomChangeSuper',
  methods: [ function sameName() {} ]
});
AxiomChangeSub.create();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 112, str: " <b>&gt;</b> Exception:  Illegal to change Property to non-Property: AxiomChangeSub.sameName changed to foam.core.Method" });


// Example 113
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Warn if an Axiom changes its class
foam.CLASS({
  name: 'AxiomChangeSuper2',
  methods: [ function sameName() {} ]
});
foam.CLASS({
  name: 'AxiomChangeSub2',
  extends: 'AxiomChangeSuper2',
  properties: [ 'sameName' ]
});
AxiomChangeSub2.create();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 113, str: "warn: Change of Axiom AxiomChangeSub2.sameName type from foam.core.Method to foam.core.Property" });


// Example 114
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Property validation, factory and value
foam.CLASS({
  name: 'PropertyValidationTest',
  properties: [
    {
      name: 't1',
      setter: function() {},
      adapt: function(_,v) { return v; },
      preSet: function(_,v) { return v; },
      postSet: function() {}
    },
    {
      name: 't2',
      getter: function() { return 42; },
      factory: function() { return 42; },
      expression: function() { return 42; },
      value: 42
    }
  ]
});
PropertyValidationTest.model_.validate();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 114, str: "warn: Property PropertyValidationTest.t1 \"adapt\" hidden by \"setter\"warn: Property PropertyValidationTest.t1 \"preSet\" hidden by \"setter\"warn: Property PropertyValidationTest.t1 \"postSet\" hidden by \"setter\"warn: Property PropertyValidationTest.t2 \"factory\" hidden by \"getter\"warn: Property PropertyValidationTest.t2 \"expression\" hidden by \"getter\"warn: Property PropertyValidationTest.t2 \"value\" hidden by \"getter\"warn: Property PropertyValidationTest.t2 \"expression\" hidden by \"factory\"warn: Property PropertyValidationTest.t2 \"value\" hidden by \"factory\"warn: Property PropertyValidationTest.t2 \"value\" hidden by \"expression\"warn: Property PropertyValidationTest.t1 \"adapt\" hidden by \"setter\"warn: Property PropertyValidationTest.t1 \"preSet\" hidden by \"setter\"warn: Property PropertyValidationTest.t1 \"postSet\" hidden by \"setter\"warn: Property PropertyValidationTest.t2 \"factory\" hidden by \"getter\"warn: Property PropertyValidationTest.t2 \"expression\" hidden by \"getter\"warn: Property PropertyValidationTest.t2 \"value\" hidden by \"getter\"warn: Property PropertyValidationTest.t2 \"expression\" hidden by \"factory\"warn: Property PropertyValidationTest.t2 \"value\" hidden by \"factory\"warn: Property PropertyValidationTest.t2 \"value\" hidden by \"expression\"" });


// Example 115
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Required
foam.CLASS({
  name: 'ValidationTest',
  properties: [
    { name: 'test', required: true }
  ]
});
var o = ValidationTest.create({test: '42'});
o.validate();
log('-');
var o = ValidationTest.create();
o.validate();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 115, str: " <b>&gt;</b> - <b>&gt;</b> Exception:  Required property ValidationTest.test not defined." });


// Example 116
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Unknown Properties, detect unknown Model and Property properties
foam.CLASS({
  name: 'ValidationTest',
  unknown: 'foobar',
  properties: [
    { name: 'test', unknown: 'foobar' }
  ]
});
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 116, str: "warn: Unknown property foam.core.Model.unknown: foobarwarn: Unknown property foam.core.Property.unknown: foobar" });


// Example 117
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Contexts can be explicitly created with foam.createSubContext()
// The second argument of createSubContext() is an optional name for the Context
var Y1 = foam.createSubContext({key: 'value', fn: function() { console.log('here'); }}, 'SubContext');
console.log(Y1.key, Y1.fn());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 117, str: "herevalue " });


// Example 118
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Sub-Contexts can be created from other Contexts.
var Y2 = Y1.createSubContext({key: 'value2'});
console.log(Y2.key, Y2.fn());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 118, str: "herevalue2 " });


// Example 120
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Classes can import values from the Context so that they can be accessed from 'this'.
var Y = foam.createSubContext({ myLogger: function(msg) { console.log('log:', msg); }});
foam.CLASS({
  name: 'ImportsTest',
  imports: [ 'myLogger' ],
  methods: [ function foo() {
    this.myLogger('log foo from ImportTest');
  } ]
});
try {
  var o = ImportsTest.create();
  o.foo();
} catch(e) {
  log('Could not import "myLogger" since nobody provided it.');
}
Y.myLogger('test');
var o = ImportsTest.create(null, Y);
o.foo();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 120, str: "warn: Access missing import: myLogger <b>&gt;</b> Could not import \"myLogger\" since nobody provided it.log: testlog: log foo from ImportTest" });


// Example 121
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Classes can export values for use by objects they create.
foam.CLASS({
  name: 'ExportsTest',
  requires: [ 'ImportsTest' ],
  exports: [ 'myLogger' ],
  methods: [
    function init() {
      this.ImportsTest.create().foo();
    },
    function myLogger(msg) {
      console.log('log from ExportsTest:', msg);
    }
  ]
});
ExportsTest.create();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 121, str: "log from ExportsTest: log foo from ImportTest" });


// Example 122
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Packages
// Classes can specify a 'package'.
foam.CLASS({
  package: 'com.acme',
  name: 'Test',
  methods: [ function foo() { console.log('foo from com.acme.Test'); } ]
});
com.acme.Test.create().foo();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 122, str: "foo from com.acme.Test" });


// Example 123
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Classes can requires: other Classes to avoid having to reference them
// by their fully-qualified names.
foam.CLASS({
  name: 'RequiresTest',
  requires: ['com.acme.Test' ],
  methods: [ function foo() { this.Test.create().foo(); } ]
});
RequiresTest.create().foo();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 123, str: "foo from com.acme.Test" });


// Example 124
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Requires can use 'as' to alias required Classes so that they are named something different.
foam.CLASS({
  name: 'RequiresAliasTest',
  requires: ['com.acme.Test as NotTest' ],
  methods: [ function foo() { this.NotTest.create().foo(); } ]
});
RequiresAliasTest.create().foo();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 124, str: "foo from com.acme.Test" });


// Example 125
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Classes can have a unique-id or primary-key.
// By default, this is simply the field named 'id'.
foam.CLASS({
  name: 'Invoice',
  properties: [ 'id', 'desc', 'amount' ]
});
var o = Invoice.create({id: 1, desc: 'Duct Cleaning', amount: 99.99});
log(o.id);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 125, str: " <b>&gt;</b> 1" });


// Example 126
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// But you can also use the 'ids' property to specify that
// the primary key be something other than 'id'.
// In this case, 'id' will become an psedo-property for
// accessing the real 'invoiceId' property.
foam.CLASS({
  name: 'Invoice2',
  ids: [ 'invoiceId' ],
  properties: [ 'invoiceId', 'desc', 'amount' ]
});
var o = Invoice2.create({invoiceId: 1, desc: 'Duct Cleaning', amount: 99.99});
log(o.id, o.invoiceId);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 126, str: " <b>&gt;</b> 1 1" });


// Example 127
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Multi-part unique identifiers are also supported.
foam.CLASS({
  name: 'Invoice3',
  ids: [ 'customerId', 'invoiceId' ],
  properties: [ 'customerId', 'invoiceId', 'desc', 'amount' ]
});
var o = Invoice3.create({customerId: 1, invoiceId: 1, desc: 'Duct Cleaning', amount: 99.99});
log(o.id, o.customerId, o.invoiceId);
o.id = [2, 3];
log(o.id, o.customerId, o.invoiceId);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 127, str: " <b>&gt;</b> 1,1 1 1 <b>&gt;</b> 2,3 2 3" });


// Example 128
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Multi-part ids are comparable
log(Invoice3.ID.compare(
  Invoice3.create({customerId: 1, invoiceId: 2}),
  Invoice3.create({customerId: 1, invoiceId: 1})));
log(Invoice3.ID.compare(
  Invoice3.create({customerId: 1, invoiceId: 1}),
  Invoice3.create({customerId: 1, invoiceId: 2})));
log(Invoice3.ID.compare(
  Invoice3.create({customerId: 1, invoiceId: 1}),
  Invoice3.create({customerId: 1, invoiceId: 1})));
log(Invoice3.ID.compare(
  Invoice3.create({customerId: 2, invoiceId: 1}),
  Invoice3.create({customerId: 1, invoiceId: 1})));
log(Invoice3.ID.compare(
  Invoice3.create({customerId: 1, invoiceId: 1}),
  Invoice3.create({customerId: 2, invoiceId: 1})));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 128, str: " <b>&gt;</b> 1 <b>&gt;</b> -1 <b>&gt;</b> 0 <b>&gt;</b> 1 <b>&gt;</b> -1" });


// Example 129
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// A Classes 'id' is a combination of its package and name.
log(com.acme.Test.id);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 129, str: " <b>&gt;</b> com.acme.Test" });


// Example 130
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// In addition the the built-in Axiom types, you can also
// specify arbitrary Axioms with axioms:
foam.CLASS({
  name: 'AxiomTest',
  axioms: [ foam.pattern.Singleton.create() ],
  methods: [ function init() { log('Creating AxiomTest'); } ]
});
AxiomTest.create();
AxiomTest.create();
log(AxiomTest.create() === AxiomTest.create());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 130, str: " <b>&gt;</b> Creating AxiomTest <b>&gt;</b> true" });


// Example 131
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
//
foam.CLASS({
  name: 'AxiomSubTest',
  extends: 'AxiomTest',
  methods: [ function init() { log('Creating AxiomSubTest'); } ]
});
AxiomSubTest.create();
AxiomSubTest.create();
log(AxiomSubTest.create() === AxiomSubTest.create());
log(AxiomSubTest.create() === AxiomTest.create());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 131, str: " <b>&gt;</b> Creating AxiomSubTest <b>&gt;</b> true <b>&gt;</b> false" });


// Example 132
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Stdlib
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 132, str: "" });


// Example 134
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// foam.events.consoleLog
foam.CLASS({name: 'ConsoleLogTest'});
var o = ConsoleLogTest.create();
o.sub(foam.events.consoleLog());
o.pub();
o.pub('foo');
o.pub('foo','bar');
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 134, str: "[object Object][object Object],foo[object Object],foo,bar" });


// Example 135
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// foam.Function.memoize1() memozies a one-argument function so that if called again
// with the same argument, the previously generated value will be returned
// rather than calling the function again.
var f = foam.Function.memoize1(function(x) { log('calculating ', x); return x*x; });
log(f(2));
log(f(2));
log(f(4));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 135, str: " <b>&gt;</b> calculating  2 <b>&gt;</b> 4 <b>&gt;</b> 4 <b>&gt;</b> calculating  4 <b>&gt;</b> 16" });


// Example 136
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// A call to memoize1() with no arguments will trigger a failed assertion.
log(f());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 136, str: " <b>&gt;</b> Assertion failed: Memoize1'ed functions must take exactly one argument. <b>&gt;</b> Exception:  assert" });


// Example 137
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// A call to memoize1() with more than one argument will trigger a failed assertion.
log(f(1,2));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 137, str: " <b>&gt;</b> Assertion failed: Memoize1'ed functions must take exactly one argument. <b>&gt;</b> Exception:  assert" });


// Example 138
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// foam.Function.argsStr() returns a function's arguments an a string.
log(foam.Function.argsStr(function(a,b,fooBar) { }));
log(typeof foam.Function.argsStr(function() { }));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 138, str: " <b>&gt;</b> a,b,fooBar <b>&gt;</b> string" });


// Example 139
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// foam.Function.formalArgs() returns a function's arguments an an array.
log(foam.Function.formalArgs(function(a,b,fooBar) { }));
log(Array.isArray(foam.Function.formalArgs(function() { })));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 139, str: " <b>&gt;</b> a,b,fooBar <b>&gt;</b> true" });


// Example 140
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// foam.String.constantize converts strings from camelCase to CONSTANT_FORMAT
log(foam.String.constantize('foo'));
log(foam.String.constantize('fooBar'));
log(foam.String.constantize('fooBar12'));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 140, str: " <b>&gt;</b> FOO <b>&gt;</b> FOO_BAR <b>&gt;</b> FOO_BAR12" });


// Example 141
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// foam.String.capitalize capitalizes strings
log(foam.String.capitalize('Abc def'));
log(foam.String.capitalize('abc def'));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 141, str: " <b>&gt;</b> Abc def <b>&gt;</b> Abc def" });


// Example 142
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// foam.String.labelize converts from camelCase to labels
log(foam.String.labelize('camelCase'));
log(foam.String.labelize('firstName'));
log(foam.String.labelize('someLongName'));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 142, str: " <b>&gt;</b> Camel Case <b>&gt;</b> First Name <b>&gt;</b> Some Long Name" });


// Example 143
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// foam.String.multiline lets you build multi-line strings
// from function comments.
log(foam.String.multiline(function(){/*This is
a
multi-line
string*/}));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 143, str: " <b>&gt;</b> This is\na\nmulti-line\nstring" });


// Example 144
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// foam.String.pad() pads a string to the specified length.
var s = foam.String.pad('foobar', 10);
log(s, s.length);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 144, str: " <b>&gt;</b> foobar     10" });


// Example 145
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// foam.String.pad() pads a string to the specified length, right justifying if given a negative number.
var s = foam.String.pad('foobar', -10);
log(s, s.length);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 145, str: " <b>&gt;</b>     foobar 10" });


// Example 146
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Basic templates
foam.CLASS({
  name: 'TemplateTest',
  properties: [
    'name'
  ],
  templates: [
    {
      name: 'hello',
      template: 'Hello, my name is <%= this.name %>.'
    }
  ]
});
var o = TemplateTest.create({ name: 'Adam' });
log(o.hello());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 146, str: " <b>&gt;</b> Hello, my name is Adam." });


// Example 147
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
foam.CLASS({
  name: 'TemplateTest',
  properties: [
    'name'
  ],
  templates: [
    {
      name: 'greet',
      args: [
        'stranger'
      ],
      template: 'Hello <%= stranger %>, my name is <%= this.name %>.'
    }
  ]
});
var o = TemplateTest.create({ name: 'Adam' });
log(o.greet("Bob"));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 147, str: " <b>&gt;</b> Hello Bob, my name is Adam." });


// Example 148
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
foam.CLASS({
  name: 'TemplateTest',
  properties: [ 'name' ],
  templates: [
    {
      name: 'greeter',
      args: [ 'stranger' ],
      template: 'Hello <%= stranger %>'
    },
    {
      name: 'greet',
      args: ['stranger'],
      template: '<% this.greeter(output, stranger); %>, my name is <%= this.name %>'
    }
  ]
});
var o = TemplateTest.create({ name: 'Adam' });
log(o.greet("Alice"));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 148, str: " <b>&gt;</b> Hello Alice, my name is Adam" });


// Example 149
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// More
foam.CLASS({
  name: 'TemplateTest',
  properties: [ 'name' ],
  templates: [
    {
      name: 'complexTemplate',
      template: 'Use raw JS code for loops and control structures' +
        '<% for ( var i = 0 ; i < 10; i++ ) { %>\n' +
        'i is: "<%= i %>" <% if ( i % 2 == 0 ) { %> which is even!<% } '+
        '} %>' +
        '\n\n' +
        'Use percent signs to shortcut access to local properties\n' +
        'For instance, my name is %%name\n'
    }
  ]
});
log(TemplateTest.create({ name: 'Adam' }).complexTemplate());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 149, str: " <b>&gt;</b> Use raw JS code for loops and control structures\ni is: \"0\"  which is even!\ni is: \"1\" \ni is: \"2\"  which is even!\ni is: \"3\" \ni is: \"4\"  which is even!\ni is: \"5\" \ni is: \"6\"  which is even!\ni is: \"7\" \ni is: \"8\"  which is even!\ni is: \"9\" \n\nUse percent signs to shortcut access to local properties\nFor instance, my name is Adam\n" });


// Example 150
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Multi-line templates can be defined as function comments.
foam.CLASS({
  name: 'MultiLineTemplateTest',
  properties: [ 'name' ],
  templates: [
    {
      name: 'complexTemplate',
      template: function() {/*
        Use raw JS code for loops and control structures
        <% for ( var i = 0 ; i < 10; i++ ) { %>
        i is: "<%= i %>" <% if ( i % 2 == 0 ) { %> which is even!<% }
        } %>
        Use percent signs to shortcut access to local properties
        For instance, my name is %%name
      */}
    }
  ]
});
log(MultiLineTemplateTest.create({ name: 'Adam' }).complexTemplate());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 150, str: " <b>&gt;</b> \n        Use raw JS code for loops and control structures\n        \n        i is: \"0\"  which is even!\n        i is: \"1\" \n        i is: \"2\"  which is even!\n        i is: \"3\" \n        i is: \"4\"  which is even!\n        i is: \"5\" \n        i is: \"6\"  which is even!\n        i is: \"7\" \n        i is: \"8\"  which is even!\n        i is: \"9\" \n        Use percent signs to shortcut access to local properties\n        For instance, my name is Adam\n      " });


// Example 151
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// JSON Support
foam.CLASS({
  name: 'JSONTest',
  properties: [
    { name: 'name', shortName: 'n' },
    { class: 'Int', name: 'age', shortName: 'a' },
    { class: 'StringArray', name: 'children', shortName: 'cs' },
    { name: 'name That Needs Quoting' },
    { name: 'undefined' },
    { name: 'defined' },
    { class: 'String', name: 'undefinedString' },
    { class: 'String', name: 'definedString' },
    { class: 'String', name: 'defaultString', value: 'default' },
    { class: 'Int', name: 'undefinedInt' },
    { class: 'Int', name: 'definedInt' },
    { class: 'Int', name: 'defaultInt', value: 3 },
    { class: 'Float', name: 'undefinedFloat' },
    { class: 'Float', name: 'definedFloat' },
    { class: 'Float', name: 'defaultFloat', value: 3.14 },
    { class: 'Boolean', name: 'undefinedBoolean' },
    { class: 'Boolean', name: 'trueBoolean' },
    { class: 'Boolean', name: 'falseBoolean' },
    { class: 'Boolean', name: 'defaultBoolean', value: true },
    { class: 'Function', name: 'undefinedFunction' },
    { class: 'Function', name: 'definedFunction' },
    { name: 'undefinedFObject' },
    { name: 'definedFObject' },
    { name: 'transient', transient: true },
    { name: 'networkTransient', networkTransient: true },
    { name: 'storageTransient', storageTransient: true },
//    { name: '' },
  ]
});
var o = foam.json.parse({
  class: 'JSONTest',
  name: 'John',
  age: 42,
  children: ['Peter', 'Paul']});
o.describe();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 151, str: "Instance of JSONTestAxiom Type           Name           Value----------------------------------------------------Property             name           JohnInt                  age            42StringArray          children       Peter,PaulProperty             name That Need Property             undefined      Property             defined        String               undefinedStrin String               definedString  String               defaultString  defaultInt                  undefinedInt   0Int                  definedInt     0Int                  defaultInt     3Float                undefinedFloat 0Float                definedFloat   0Float                defaultFloat   3.14Boolean              undefinedBoole falseBoolean              trueBoolean    falseBoolean              falseBoolean   falseBoolean              defaultBoolean trueFunction             undefinedFunct function () {}Function             definedFunctio function () {}Property             undefinedFObje Property             definedFObject Property             transient      Property             networkTransie Property             storageTransie \n" });


// Example 152
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
//
o = JSONTest.create({
  name: 'John',
  age: 42,
  children: ['Peter', 'Paul'],
  "name That Needs Quoting": 42,
  defined: 'value',
  definedString: 'stringValue',
  definedInt: 42,
  defaultInt: 3,
  definedFloat: 42.42,
  defaultFloat: 3.14,
  trueBoolean: true,
  falseBoolean: false,
  defaultBoolean: true,
  definedFunction: function plus(a, b) { return a + b; },
  definedFObject: JSONTest.create({
    name: 'Janet',
    age: 32,
    children: [ 'Kim', 'Kathy' ]
  }),
  transient: 'transient value',
  networkTransient: 'network transient value',
  storageTransient: 'storage transient value'
});
// Default JSON formatting
log(foam.json.stringify(o));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 152, str: " <b>&gt;</b> {class:\"JSONTest\",name:\"John\",age:42,children:[\"Peter\",\"Paul\"],\"name That Needs Quoting\":42,defined:\"value\",definedString:\"stringValue\",definedInt:42,definedFloat:42.42,trueBoolean:true,definedFunction:function plus(a, b) { return a + b; },definedFObject:{class:\"JSONTest\",name:\"Janet\",age:32,children:[\"Kim\",\"Kathy\"]},networkTransient:\"network transient value\",storageTransient:\"storage transient value\"}" });


// Example 153
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Convert to a JSON object (instead of a String)
log(foam.json.stringify(JSONTest.create(foam.json.objectify(o))));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 153, str: " <b>&gt;</b> {class:\"JSONTest\",name:\"John\",age:42,children:[\"Peter\",\"Paul\"],\"name That Needs Quoting\":42,defined:\"value\",definedString:\"stringValue\",definedInt:42,definedFloat:42.42,trueBoolean:true,definedFunction:function plus(a, b) { return a + b; },definedFObject:{class:\"JSONTest\",name:\"Janet\",age:32,children:[\"Kim\",\"Kathy\"]},networkTransient:\"network transient value\",storageTransient:\"storage transient value\"}" });


// Example 154
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
// Or as a method on Objects
log(o.stringify());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 154, str: " <b>&gt;</b> {\n	class: \"JSONTest\",\n	name: \"John\",\n	age: 42,\n	children: [\n		\"Peter\",\n		\"Paul\"\n	],\n	\"name That Needs Quoting\": 42,\n	undefined: null,\n	defined: \"value\",\n	undefinedString: \"\",\n	definedString: \"stringValue\",\n	defaultString: \"default\",\n	undefinedInt: 0,\n	definedInt: 42,\n	defaultInt: 3,\n	undefinedFloat: 0,\n	definedFloat: 42.42,\n	defaultFloat: 3.14,\n	undefinedBoolean: false,\n	trueBoolean: true,\n	falseBoolean: false,\n	defaultBoolean: true,\n	undefinedFunction: function () {},\n	definedFunction: function plus(a, b) { return a + b; },\n	undefinedFObject: null,\n	definedFObject: {\n		class: \"JSONTest\",\n		name: \"Janet\",\n		age: 32,\n		children: [\n			\"Kim\",\n			\"Kathy\"\n		],\n		\"name That Needs Quoting\": null,\n		undefined: null,\n		defined: null,\n		undefinedString: \"\",\n		definedString: \"\",\n		defaultString: \"default\",\n		undefinedInt: 0,\n		definedInt: 0,\n		defaultInt: 3,\n		undefinedFloat: 0,\n		definedFloat: 0,\n		defaultFloat: 3.14,\n		undefinedBoolean: false,\n		trueBoolean: false,\n		falseBoolean: false,\n		defaultBoolean: true,\n		undefinedFunction: function () {},\n		definedFunction: function () {},\n		undefinedFObject: null,\n		definedFObject: null,\n		networkTransient: null,\n		storageTransient: null\n	},\n	networkTransient: \"network transient value\",\n	storageTransient: \"storage transient value\"\n}" });


// Example 155
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
//
log(foam.json.Pretty.stringify(o));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 155, str: " <b>&gt;</b> {\n	class: \"JSONTest\",\n	name: \"John\",\n	age: 42,\n	children: [\n		\"Peter\",\n		\"Paul\"\n	],\n	\"name That Needs Quoting\": 42,\n	undefined: null,\n	defined: \"value\",\n	undefinedString: \"\",\n	definedString: \"stringValue\",\n	defaultString: \"default\",\n	undefinedInt: 0,\n	definedInt: 42,\n	defaultInt: 3,\n	undefinedFloat: 0,\n	definedFloat: 42.42,\n	defaultFloat: 3.14,\n	undefinedBoolean: false,\n	trueBoolean: true,\n	falseBoolean: false,\n	defaultBoolean: true,\n	undefinedFunction: function () {},\n	definedFunction: function plus(a, b) { return a + b; },\n	undefinedFObject: null,\n	definedFObject: {\n		class: \"JSONTest\",\n		name: \"Janet\",\n		age: 32,\n		children: [\n			\"Kim\",\n			\"Kathy\"\n		],\n		\"name That Needs Quoting\": null,\n		undefined: null,\n		defined: null,\n		undefinedString: \"\",\n		definedString: \"\",\n		defaultString: \"default\",\n		undefinedInt: 0,\n		definedInt: 0,\n		defaultInt: 3,\n		undefinedFloat: 0,\n		definedFloat: 0,\n		defaultFloat: 3.14,\n		undefinedBoolean: false,\n		trueBoolean: false,\n		falseBoolean: false,\n		defaultBoolean: true,\n		undefinedFunction: function () {},\n		definedFunction: function () {},\n		undefinedFObject: null,\n		definedFObject: null,\n		networkTransient: null,\n		storageTransient: null\n	},\n	networkTransient: \"network transient value\",\n	storageTransient: \"storage transient value\"\n}" });


// Example 156
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
//
log(foam.json.Pretty.clone().copyFrom({outputClassNames: false}).stringify(o));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 156, str: " <b>&gt;</b> {\n	\n	name: \"John\",\n	age: 42,\n	children: [\n		\"Peter\",\n		\"Paul\"\n	],\n	\"name That Needs Quoting\": 42,\n	undefined: null,\n	defined: \"value\",\n	undefinedString: \"\",\n	definedString: \"stringValue\",\n	defaultString: \"default\",\n	undefinedInt: 0,\n	definedInt: 42,\n	defaultInt: 3,\n	undefinedFloat: 0,\n	definedFloat: 42.42,\n	defaultFloat: 3.14,\n	undefinedBoolean: false,\n	trueBoolean: true,\n	falseBoolean: false,\n	defaultBoolean: true,\n	undefinedFunction: function () {},\n	definedFunction: function plus(a, b) { return a + b; },\n	undefinedFObject: null,\n	definedFObject: {\n		\n		name: \"Janet\",\n		age: 32,\n		children: [\n			\"Kim\",\n			\"Kathy\"\n		],\n		\"name That Needs Quoting\": null,\n		undefined: null,\n		defined: null,\n		undefinedString: \"\",\n		definedString: \"\",\n		defaultString: \"default\",\n		undefinedInt: 0,\n		definedInt: 0,\n		defaultInt: 3,\n		undefinedFloat: 0,\n		definedFloat: 0,\n		defaultFloat: 3.14,\n		undefinedBoolean: false,\n		trueBoolean: false,\n		falseBoolean: false,\n		defaultBoolean: true,\n		undefinedFunction: function () {},\n		definedFunction: function () {},\n		undefinedFObject: null,\n		definedFObject: null,\n		networkTransient: null,\n		storageTransient: null\n	},\n	networkTransient: \"network transient value\",\n	storageTransient: \"storage transient value\"\n}" });


// Example 157
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
//
log(foam.json.Strict.stringify(o));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 157, str: " <b>&gt;</b> {\"class\":\"JSONTest\",\"name\":\"John\",\"age\":42,\"children\":[\"Peter\",\"Paul\"],\"name That Needs Quoting\":42,\"undefined\":null,\"defined\":\"value\",\"undefinedString\":\"\",\"definedString\":\"stringValue\",\"defaultString\":\"default\",\"undefinedInt\":0,\"definedInt\":42,\"defaultInt\":3,\"undefinedFloat\":0,\"definedFloat\":42.42,\"defaultFloat\":3.14,\"undefinedBoolean\":false,\"trueBoolean\":true,\"falseBoolean\":false,\"defaultBoolean\":true,\"undefinedFunction\":\"function () {}\",\"definedFunction\":\"function plus(a, b) { return a + b; }\",\"undefinedFObject\":null,\"definedFObject\":{\"class\":\"JSONTest\",\"name\":\"Janet\",\"age\":32,\"children\":[\"Kim\",\"Kathy\"],\"name That Needs Quoting\":null,\"undefined\":null,\"defined\":null,\"undefinedString\":\"\",\"definedString\":\"\",\"defaultString\":\"default\",\"undefinedInt\":0,\"definedInt\":0,\"defaultInt\":3,\"undefinedFloat\":0,\"definedFloat\":0,\"defaultFloat\":3.14,\"undefinedBoolean\":false,\"trueBoolean\":false,\"falseBoolean\":false,\"defaultBoolean\":true,\"undefinedFunction\":\"function () {}\",\"definedFunction\":\"function () {}\",\"undefinedFObject\":null,\"definedFObject\":null,\"networkTransient\":null,\"storageTransient\":null},\"networkTransient\":\"network transient value\",\"storageTransient\":\"storage transient value\"}" });


// Example 158
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
//
log(foam.json.PrettyStrict.stringify(o));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 158, str: " <b>&gt;</b> {\n	\"class\": \"JSONTest\",\n	\"name\": \"John\",\n	\"age\": 42,\n	\"children\": [\n		\"Peter\",\n		\"Paul\"\n	],\n	\"name That Needs Quoting\": 42,\n	\"undefined\": null,\n	\"defined\": \"value\",\n	\"undefinedString\": \"\",\n	\"definedString\": \"stringValue\",\n	\"defaultString\": \"default\",\n	\"undefinedInt\": 0,\n	\"definedInt\": 42,\n	\"defaultInt\": 3,\n	\"undefinedFloat\": 0,\n	\"definedFloat\": 42.42,\n	\"defaultFloat\": 3.14,\n	\"undefinedBoolean\": false,\n	\"trueBoolean\": true,\n	\"falseBoolean\": false,\n	\"defaultBoolean\": true,\n	\"undefinedFunction\": \"function () {}\",\n	\"definedFunction\": \"function plus(a, b) { return a + b; }\",\n	\"undefinedFObject\": null,\n	\"definedFObject\": {\n		\"class\": \"JSONTest\",\n		\"name\": \"Janet\",\n		\"age\": 32,\n		\"children\": [\n			\"Kim\",\n			\"Kathy\"\n		],\n		\"name That Needs Quoting\": null,\n		\"undefined\": null,\n		\"defined\": null,\n		\"undefinedString\": \"\",\n		\"definedString\": \"\",\n		\"defaultString\": \"default\",\n		\"undefinedInt\": 0,\n		\"definedInt\": 0,\n		\"defaultInt\": 3,\n		\"undefinedFloat\": 0,\n		\"definedFloat\": 0,\n		\"defaultFloat\": 3.14,\n		\"undefinedBoolean\": false,\n		\"trueBoolean\": false,\n		\"falseBoolean\": false,\n		\"defaultBoolean\": true,\n		\"undefinedFunction\": \"function () {}\",\n		\"definedFunction\": \"function () {}\",\n		\"undefinedFObject\": null,\n		\"definedFObject\": null,\n		\"networkTransient\": null,\n		\"storageTransient\": null\n	},\n	\"networkTransient\": \"network transient value\",\n	\"storageTransient\": \"storage transient value\"\n}" });


// Example 159
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
//
log(foam.json.Compact.stringify(o));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 159, str: " <b>&gt;</b> {class:\"JSONTest\",name:\"John\",age:42,children:[\"Peter\",\"Paul\"],\"name That Needs Quoting\":42,defined:\"value\",definedString:\"stringValue\",definedInt:42,definedFloat:42.42,trueBoolean:true,definedFunction:function plus(a, b) { return a + b; },definedFObject:{class:\"JSONTest\",name:\"Janet\",age:32,children:[\"Kim\",\"Kathy\"]},networkTransient:\"network transient value\",storageTransient:\"storage transient value\"}" });


// Example 160
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
//
log(foam.json.Short.stringify(o));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 160, str: " <b>&gt;</b> {class:\"JSONTest\",n:\"John\",a:42,cs:[\"Peter\",\"Paul\"],\"name That Needs Quoting\":42,defined:\"value\",definedString:\"stringValue\",definedInt:42,definedFloat:42.42,trueBoolean:true,definedFunction:function plus(a, b) { return a + b; },definedFObject:{class:\"JSONTest\",n:\"Janet\",a:32,cs:[\"Kim\",\"Kathy\"]},networkTransient:\"network transient value\",storageTransient:\"storage transient value\"}" });


// Example 161
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
//
log(foam.json.Network.stringify(o));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 161, str: " <b>&gt;</b> {class:\"JSONTest\",n:\"John\",a:42,cs:[\"Peter\",\"Paul\"],\"name That Needs Quoting\":42,defined:\"value\",definedString:\"stringValue\",definedInt:42,definedFloat:42.42,trueBoolean:true,definedFunction:function plus(a, b) { return a + b; },definedFObject:{class:\"JSONTest\",n:\"Janet\",a:32,cs:[\"Kim\",\"Kathy\"]},storageTransient:\"storage transient value\"}" });


// Example 162
foam.__context__ = foam.createSubContext({});
log_.output = "";
try {
//
log(foam.json.Storage.stringify(o));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 162, str: " <b>&gt;</b> {class:\"JSONTest\",n:\"John\",a:42,cs:[\"Peter\",\"Paul\"],\"name That Needs Quoting\":42,defined:\"value\",definedString:\"stringValue\",definedInt:42,definedFloat:42.42,trueBoolean:true,definedFunction:function plus(a, b) { return a + b; },definedFObject:{class:\"JSONTest\",n:\"Janet\",a:32,cs:[\"Kim\",\"Kathy\"]},networkTransient:\"network transient value\"}" });


});
});

