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


describe("FOAM By Example", function() {
var log_ = function log_(o) {
  log_.output += o;
};
var log = function() { log_(' <b>&gt;</b> ' + [].join.call(arguments, ' ')); }
var golden = " <b>&gt;</b> {class:\"JSONTest\",n:\"John\",a:42,cs:[\"Peter\",\"Paul\"],\"name That Needs Quoting\":42,defined:\"value\",definedString:\"stringValue\",definedInt:42,definedFloat:42.42,trueBoolean:true,definedFunction:function plus(a, b) { return a + b; },definedFObject:{class:\"JSONTest\",n:\"Janet\",a:32,cs:[\"Kim\",\"Kathy\"]},networkTransient:\"network transient value\"}";
var oldLog, oldAssert;
beforeEach(function() {
  oldLog = console.log;
  oldAssert = console.assert;
  console.assert = function(b, e) { if ( ! b ) { log('Assertion failed:', e); throw 'assert'; } };
  console.log = function() { log_([].join.call(arguments, ' ')); };
  console.log.put = console.log.bind(console);
  console.log.str = oldLog.str;
  console.log.json = oldLog.json;
  log_.output = "";
  jasmine.addMatchers(customMatchers);
});

afterEach(function() {
  console.assert = oldAssert;
  console.log = oldLog;
});

it("", function() {


// Example 1
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
  expect(log_.output).toMatchGolden({ i: 0, str: " <b>&gt;</b> TestClass" });


// Example 2
log_.output = "";
try {
// Use class.describe() to learn about the class
Test.describe();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 1, str: "CLASS:   Testextends: FObjectAxiom Type           Source Class   Name----------------------------------------------------Property             Test           aProperty             Test           bMethod               Test           f1Method               Test           f2anonymous            FObject        XMethod               FObject        initArgsMethod               FObject        unknownArgMethod               FObject        copyFromMethod               FObject        clearPropertyMethod               FObject        onDestroyMethod               FObject        destroyMethod               FObject        toStringTopic                FObject        propertyChangeMethod               FObject        describeMethod               FObject        equalsMethod               FObject        compareToMethod               FObject        diffMethod               FObject        hashCodeMethod               FObject        cloneMethod               FObject        toJSON\n" });


// Example 3
log_.output = "";
try {
// Create an instance of Test
var o = Test.create();
log(o);
log(o.a, o.b);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 2, str: " <b>&gt;</b> Test <b>&gt;</b>  " });


// Example 4
log_.output = "";
try {
// Create an instance with a map argument to initialize properties
var o = Test.create({a:1, b:'foo'});
log(o.a, o.b);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 3, str: " <b>&gt;</b> 1 foo" });


// Example 5
log_.output = "";
try {
// Objects have a reference to their class in .cls_
log(o.cls_.name);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 4, str: " <b>&gt;</b> Test" });


// Example 6
log_.output = "";
try {
// Test Class membership with Class.isInstance()
log(Test.isInstance(o), Test.isInstance('foo'));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 5, str: " <b>&gt;</b> true false" });


// Example 7
log_.output = "";
try {
// Call Methods
log(o.f1(), o.f2());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 6, str: " <b>&gt;</b> 1 2" });


// Example 8
log_.output = "";
try {
// Update Properties
o.a++;
o.b = 'bar';
log(o.a, o.b);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 7, str: " <b>&gt;</b> 2 bar" });


// Example 9
log_.output = "";
try {
// Multiple properties can be updated at once using copyFrom().
o.copyFrom({a: 42, b: 'rosebud'});
log(o.a, o.b);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 8, str: " <b>&gt;</b> 42 rosebud" });


// Example 10
log_.output = "";
try {
// Call toString on an object
log(o.toString());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 9, str: " <b>&gt;</b> Test" });


// Example 11
log_.output = "";
try {
// Call describe() on an object to see its Property values
o.describe();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 10, str: "Instance of TestAxiom Type           Name           Value----------------------------------------------------Property             a              42Property             b              rosebud\n" });


// Example 12
log_.output = "";
try {
// Properties and Methods are types of Axioms
// Get an array of all Axioms belonging to a Class by calling getAxioms.
Test.getAxioms().forEach(function(a) { console.log(a.cls_ && a.cls_.name, a.name); });
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 11, str: "Property aProperty bMethod f1Method f2 XMethod initArgsMethod unknownArgMethod copyFromMethod clearPropertyMethod onDestroyMethod destroyMethod toStringTopic propertyChangeMethod describeMethod equalsMethod compareToMethod diffMethod hashCodeMethod cloneMethod toJSON" });


// Example 13
log_.output = "";
try {
// Find an Axiom for a class using getAxiomByName
log(Test.getAxiomByName('a'));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 12, str: " <b>&gt;</b> a" });


// Example 14
log_.output = "";
try {
// Find all Axioms of a particular class using getAxiomsByClass
log(Test.getAxiomsByClass(foam.core.Method));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 13, str: " <b>&gt;</b> Method,Method,Method,Method,Method,Method,Method,Method,Method,Method,Method,Method,Method,Method,Method,Method" });


// Example 16
log_.output = "";
try {
// Property constants contain map functions
log(Test.getAxiomsByClass(foam.core.Method).map(foam.core.Method.NAME.f));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 15, str: " <b>&gt;</b> f1,f2,initArgs,unknownArg,copyFrom,clearProperty,onDestroy,destroy,toString,describe,equals,compareTo,diff,hashCode,clone,toJSON" });


// Example 17
log_.output = "";
try {
// Property constants contain comparators
log(Test.getAxiomsByClass(foam.core.Method).sort(foam.core.Method.NAME.compare).map(foam.core.Method.NAME.f));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 16, str: " <b>&gt;</b> clearProperty,clone,compareTo,copyFrom,describe,destroy,diff,equals,f1,f2,hashCode,initArgs,onDestroy,toJSON,toString,unknownArg" });


// Example 18
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
  expect(log_.output).toMatchGolden({ i: 17, str: " <b>&gt;</b> Just Born!" });


// Example 19
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
  expect(log_.output).toMatchGolden({ i: 18, str: " <b>&gt;</b> 42 foo " });


// Example 20
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
  expect(log_.output).toMatchGolden({ i: 19, str: " <b>&gt;</b> false false false <b>&gt;</b> true true true" });


// Example 21
log_.output = "";
try {
// .clearProperty() reverts a value back to its value
log(o.hasOwnProperty('a'), o.a);
o.clearProperty('a');
log(o.hasOwnProperty('a'), o.a);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 20, str: " <b>&gt;</b> true 99 <b>&gt;</b> false 42" });


// Example 22
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
  expect(log_.output).toMatchGolden({ i: 21, str: " <b>&gt;</b> creating value <b>&gt;</b> 42 <b>&gt;</b> 42" });


// Example 23
log_.output = "";
try {
// Factory not called if value supplied in constructor
var o = FactoryTest.create({a: 42});
log(o.a);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 22, str: " <b>&gt;</b> 42" });


// Example 24
log_.output = "";
try {
// Factory not called if value set before first access
var o = FactoryTest.create();
o.a = 42;
log(o.a);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 23, str: " <b>&gt;</b> 42" });


// Example 25
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
  expect(log_.output).toMatchGolden({ i: 24, str: " <b>&gt;</b> creating value <b>&gt;</b> 42 <b>&gt;</b> creating value <b>&gt;</b> 42" });


// Example 26
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
  expect(log_.output).toMatchGolden({ i: 25, str: " <b>&gt;</b> 5 10 <b>&gt;</b> 10 20" });


// Example 27
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
  expect(log_.output).toMatchGolden({ i: 26, str: " <b>&gt;</b> adapt   true <b>&gt;</b> adapt  true  <b>&gt;</b> false" });


// Example 28
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
  expect(log_.output).toMatchGolden({ i: 27, str: " <b>&gt;</b> preSet p1 <b>&gt;</b> preSet p1 <b>&gt;</b> Mr. Jones" });


// Example 29
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
  expect(log_.output).toMatchGolden({ i: 28, str: " <b>&gt;</b> postSet  Smith <b>&gt;</b> postSet Smith Jones <b>&gt;</b> postSet Jones Green" });


// Example 30
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
  expect(log_.output).toMatchGolden({ i: 29, str: " <b>&gt;</b> adapt:   1 <b>&gt;</b> preSet:   2 <b>&gt;</b> postSet:   3 <b>&gt;</b> adapt:  3 10 <b>&gt;</b> preSet:  3 11 <b>&gt;</b> postSet:  3 12" });


// Example 31
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
  expect(log_.output).toMatchGolden({ i: 30, str: " <b>&gt;</b> 42 green" });


// Example 32
log_.output = "";
try {
// Constants can also be accessed from the Class
log(ConstantTest.MEANING_OF_LIFE, ConstantTest.FAVOURITE_COLOR);
log(o.cls_.MEANING_OF_LIFE, o.cls_.FAVOURITE_COLOR);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 31, str: " <b>&gt;</b> 42 green <b>&gt;</b> 42 green" });


// Example 33
log_.output = "";
try {
// Constants are constant
o.MEANING_OF_LIFE = 43;
log(o.MEANING_OF_LIFE);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 32, str: " <b>&gt;</b> 42" });


// Example 34
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
  expect(log_.output).toMatchGolden({ i: 33, str: " <b>&gt;</b> John M <b>&gt;</b> Jane F 50000" });


// Example 35
log_.output = "";
try {
// Test if one class is a sub-class of another:
log(Person.isSubClass(Employee), Employee.isSubClass(Person));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 34, str: " <b>&gt;</b> true false" });


// Example 36
log_.output = "";
try {
// A Class is considered a sub-class of itself:
log(Person.isSubClass(Person));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 35, str: " <b>&gt;</b> true" });


// Example 37
log_.output = "";
try {
// FObject is the root class of all other classes:
log(foam.core.FObject.isSubClass(Employee), foam.core.FObject.isSubClass(Person));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 36, str: " <b>&gt;</b> true true" });


// Example 38
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
  expect(log_.output).toMatchGolden({ i: 37, str: " <b>&gt;</b> false <b>&gt;</b> false" });


// Example 39
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
        console.log('Bank: ', this.X.Bank);
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
  expect(log_.output).toMatchGolden({ i: 38, str: "Deposit:  42 100 100Bank:  AccountTesterInstance of AccountAxiom Type           Name           Value----------------------------------------------------Property             id             42Property             status         trueProperty             balance        90\nDeposit:  43 100 100Bank:  AccountTesterInstance of SavingsAccountAxiom Type           Name           Value----------------------------------------------------Property             id             43Property             status         trueProperty             balance        89.95\n" });


// Example 40
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
foam.CLASS({
  refines: 'Person',
  properties: [ { name: 'salary', value: 0 } ],
  methods: [
    function toString() { return this.SUPER() + ' ' + this.salary; }
  ]
});
Person.describe();
var e = Person.create({name: 'Jane', sex: 'F', salary: 50000});
log(e.toString());
log(oldPerson.toString());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 39, str: "CLASS:   Personextends: FObjectAxiom Type           Source Class   Name----------------------------------------------------Property             Person         nameProperty             Person         sexMethod               Person         toStringProperty             Person         salaryanonymous            FObject        XMethod               FObject        initArgsMethod               FObject        unknownArgMethod               FObject        copyFromMethod               FObject        clearPropertyMethod               FObject        onDestroyMethod               FObject        destroyTopic                FObject        propertyChangeMethod               FObject        describeMethod               FObject        equalsMethod               FObject        compareToMethod               FObject        diffMethod               FObject        hashCodeMethod               FObject        cloneMethod               FObject        toJSON\n <b>&gt;</b> Jane F 50000 <b>&gt;</b> John M 0" });


// Example 41
log_.output = "";
try {
// TODO: BooleanProperty
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 40, str: "" });


// Example 42
log_.output = "";
try {
// TODO: IntProperty
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 41, str: "" });


// Example 43
log_.output = "";
try {
// TODO: StringProperty
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 42, str: "" });


// Example 44
log_.output = "";
try {
// TODO: ArrayProperty
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 43, str: "" });


// Example 45
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
  expect(log_.output).toMatchGolden({ i: 44, str: "m1 Stevel1 Steve <b>&gt;</b>  " });


// Example 46
log_.output = "";
try {
// But when called as functions, the method forgets its 'self' and doesn't work,
// but the listener does.
var m = o.m1, l = o.l1;
log(m(), l());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 45, str: "m1 l1 Steve <b>&gt;</b>  " });


// Example 51
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
  expect(log_.output).toMatchGolden({ i: 50, str: " <b>&gt;</b> short action <b>&gt;</b> true <b>&gt;</b> true <b>&gt;</b> long action" });


// Example 52
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
  expect(log_.output).toMatchGolden({ i: 51, str: "CLASS:   ImplementsTestextends: FObjectAxiom Type           Source Class   Name----------------------------------------------------Implements           ImplementsTest implements_SampleIProperty             ImplementsTest p1Property             ImplementsTest p2Property             ImplementsTest p3Method               ImplementsTest fooMethod               ImplementsTest barProperty             ImplementsTest t1Property             ImplementsTest t2Property             ImplementsTest t3Method               ImplementsTest tfooMethod               ImplementsTest tbaranonymous            FObject        XMethod               FObject        initArgsMethod               FObject        unknownArgMethod               FObject        copyFromMethod               FObject        clearPropertyMethod               FObject        onDestroyMethod               FObject        destroyMethod               FObject        toStringTopic                FObject        propertyChangeMethod               FObject        describeMethod               FObject        equalsMethod               FObject        compareToMethod               FObject        diffMethod               FObject        hashCodeMethod               FObject        cloneMethod               FObject        toJSON\nInstance of ImplementsTestAxiom Type           Name           Value----------------------------------------------------Property             p1             1Property             p2             Property             p3             Property             t1             2Property             t2             Property             t3             \nffoofoo" });


// Example 53
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
  expect(log_.output).toMatchGolden({ i: 52, str: "CLASS:   ImplementsTest2extends: FObjectAxiom Type           Source Class   Name----------------------------------------------------Implements           ImplementsTest implements_SampleIImplements           ImplementsTest implements_Sample2IProperty             ImplementsTest t1Property             ImplementsTest t2Property             ImplementsTest t3Method               ImplementsTest tfooMethod               ImplementsTest tbarProperty             ImplementsTest tb1Property             ImplementsTest tb2Property             ImplementsTest tb3Method               ImplementsTest tbfooMethod               ImplementsTest tbbaranonymous            FObject        XMethod               FObject        initArgsMethod               FObject        unknownArgMethod               FObject        copyFromMethod               FObject        clearPropertyMethod               FObject        onDestroyMethod               FObject        destroyMethod               FObject        toStringTopic                FObject        propertyChangeMethod               FObject        describeMethod               FObject        equalsMethod               FObject        compareToMethod               FObject        diffMethod               FObject        hashCodeMethod               FObject        cloneMethod               FObject        toJSON\n" });


// Example 54
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
  expect(log_.output).toMatchGolden({ i: 53, str: " <b>&gt;</b> 1 2 5 10" });


// Example 55
log_.output = "";
try {
// Inner-classes can also be accessed from the outer-class
InnerClassTest.InnerClass1.describe();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 54, str: "CLASS:   InnerClass1extends: FObjectAxiom Type           Source Class   Name----------------------------------------------------Property             InnerClass1    aProperty             InnerClass1    banonymous            FObject        XMethod               FObject        initArgsMethod               FObject        unknownArgMethod               FObject        copyFromMethod               FObject        clearPropertyMethod               FObject        onDestroyMethod               FObject        destroyMethod               FObject        toStringTopic                FObject        propertyChangeMethod               FObject        describeMethod               FObject        equalsMethod               FObject        compareToMethod               FObject        diffMethod               FObject        hashCodeMethod               FObject        cloneMethod               FObject        toJSON\n" });


// Example 56
log_.output = "";
try {
// Inner-classes do not appear in the global namespace
// TODO: isn't true yet
log(! InnerClass1);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 55, str: " <b>&gt;</b> false" });


// Example 57
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
  expect(log_.output).toMatchGolden({ i: 56, str: "global listener:  [object Object] alarm onalarm:  [object Object] alarm onglobal listener:  [object Object] lifecycle loaded" });


// Example 58
log_.output = "";
try {
// A Class can declare 'Topics' that it pubes events for.
foam.CLASS({
  name: 'TopicTest',
  topics: [ 'alarm' ]
});
var o = TopicTest.create();
o.sub('alarm', function(_, _, state) { console.log('alarm: ', state); });
// The next line uses the Topic and is slightly shorter than the equivalent above.
o.alarm.sub(function(_, _, state) { console.log('alarm (topic): ', state); });
o.alarm.pub('on');
o.pub('alarm', 'off');
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 57, str: "alarm (topic):  onalarm:  onalarm (topic):  offalarm:  off" });


// Example 59
log_.output = "";
try {
// Objects implicitly pub events on the 'propertyChange' topic when
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
  expect(log_.output).toMatchGolden({ i: 58, str: "propertyChange:  propertyChange a  42propertyChange.a:  propertyChange a  42propertyChange:  propertyChange b  barpropertyChange:  propertyChange a 42 43propertyChange.a:  propertyChange a 42 43" });


// Example 60
log_.output = "";
try {
// There are four ways to unsub a listener
// 1. Call obj.unsub();
o = TopicTest.create();
var l = function() { console.log.apply(console.log, arguments); };
o.sub(l);
o.pub('fire');
o.unsub(l);
o.pub("fire again, but nobody's listenering");
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 59, str: "[object Object] fire" });


// Example 61
log_.output = "";
try {
// 2. Call .destroy() on the Destroyable that sub() returns
var sub = o.sub(l);
o.pub('fire');
sub.destroy();
o.pub("fire again, but nobody's listenering");
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 60, str: "[object Object] fire" });


// Example 62
log_.output = "";
try {
// 3. Destroy the subscription, which is supplied to the listener
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
  expect(log_.output).toMatchGolden({ i: 61, str: "[object Object] fire" });


// Example 63
log_.output = "";
try {
// 4. If you only want to receive the first event, decorate your
// listener with foam.events.oneTime() and it will cancel the subscription
// when it receives the first event.
o.sub(foam.events.oneTime(function() { console.log.apply(console.log, arguments); }));
o.pub('fire');
o.pub("fire again, but nobody's listenering");
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 62, str: "[object Object] fire" });


// Example 64
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
  expect(log_.output).toMatchGolden({ i: 63, str: " <b>&gt;</b> Bob" });


// Example 65
log_.output = "";
try {
// set() is used to set a Slot's value:
dyn.set('John');
log(p.name, dyn.get());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 64, str: " <b>&gt;</b> John John" });


// Example 66
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
  expect(log_.output).toMatchGolden({ i: 65, str: " <b>&gt;</b> Bob <b>&gt;</b> John" });


// Example 67
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
  expect(log_.output).toMatchGolden({ i: 66, str: " <b>&gt;</b> John John <b>&gt;</b> Steve Steve" });


// Example 68
log_.output = "";
try {
// Another way to link two Slots is to call .link() on one of them.
var p1 = Person.create(), p2 = Person.create();
var d = p1.name$.link(p2.name$);
p1.name = 'John';
log(p1.name, p2.name);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 67, str: " <b>&gt;</b> John John" });


// Example 69
log_.output = "";
try {
// But this style of link can be broken by calling .destroy()
// on the object return from .link().
d.destroy();
p2.name = 'Steve';
log(p1.name, p2.name);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 68, str: " <b>&gt;</b> John Steve" });


// Example 70
log_.output = "";
try {
// One-Way Data-Binding
// Calling .link() creates a two-way data-binding, meaning a change in either
// value is reflected in the other.  But FOAM supports one-way data-binding as well.
// To do this, use the .follow() method.
var d = p1.name$.follow(p2.name$);
p2.name = 'Ringo'; // Will update p1 and p2
log(p1.name, p2.name);
p1.name = 'George'; // Will only update p1
log(p1.name, p2.name);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 69, str: " <b>&gt;</b> Ringo Ringo <b>&gt;</b> George Ringo" });


// Example 71
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
  expect(log_.output).toMatchGolden({ i: 70, str: " <b>&gt;</b> false <b>&gt;</b> true" });


// Example 72
log_.output = "";
try {
// You can reset a Slot to its default value by calling .clear().
// Calling obj.name$.clear() is equivalent to obj.clearProperty('name');
dv.clear();
log(dv.get(), dv.isDefined());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 71, str: " <b>&gt;</b> 42 false" });


// Example 73
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
  expect(log_.output).toMatchGolden({ i: 72, str: " <b>&gt;</b> 42 <b>&gt;</b> 42" });


// Example 74
log_.output = "";
try {
// ExpressionSlot creates a Slot from a list of Slots
// and a function which combines them into a new value.
foam.CLASS({name: 'Person', properties: ['fname', 'lname']});
var p = Person.create({fname: 'John', lname: 'Smith'});
var e = foam.core.ExpressionSlot.create({
  args: [ p.fname$, p.lname$],
  fn: function(f, l) { return f + ' ' + l; }
});
log(e.get());
e.sub(log);
p.fname = 'Steve';
p.lname = 'Jones';
log(e.get());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 73, str: " <b>&gt;</b> John Smith <b>&gt;</b> [object Object] propertyChange value [object Object] <b>&gt;</b> [object Object] propertyChange value [object Object] <b>&gt;</b> Steve Jones" });


// Example 75
log_.output = "";
try {
// Destroy the ExpressionSlot to prevent further updates.
e.destroy();
p.fname = 'Steve';
p.lname = 'Jones';
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 74, str: "" });


// Example 76
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
  expect(log_.output).toMatchGolden({ i: 75, str: "Instance of PersonAxiom Type           Name           Value----------------------------------------------------Property             fname          JohnProperty             lname          SmithProperty             name           John Smith\n <b>&gt;</b> [object Object] propertyChange fname [object Object] <b>&gt;</b> Steve Smith  =  Steve Smith <b>&gt;</b> [object Object] propertyChange lname [object Object] <b>&gt;</b> Steve Jones  =  Steve Jones" });


// Example 77
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
  expect(log_.output).toMatchGolden({ i: 76, str: " <b>&gt;</b> Steve Jones false <b>&gt;</b> [object Object] propertyChange name [object Object] <b>&gt;</b> Kevin Greer true <b>&gt;</b> [object Object] propertyChange fname [object Object] <b>&gt;</b> Sebastian Jones : Kevin Greer" });


// Example 78
log_.output = "";
try {
// Clearing a set expression property has it revert to its expression value.
log(p.name, p.hasOwnProperty('name'));
p.clearProperty('name');
log(p.name, p.hasOwnProperty('name'));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 77, str: " <b>&gt;</b> Kevin Greer true <b>&gt;</b> [object Object] propertyChange name [object Object] <b>&gt;</b> Steve Jones false" });


// Example 79
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
  expect(log_.output).toMatchGolden({ i: 78, str: " <b>&gt;</b> destroy 1 <b>&gt;</b> destroy 2" });


// Example 80
log_.output = "";
try {
// It doesn't hurt to try and destroy an object more than once.
o.destroy();
o.destroy();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 79, str: "" });


// Example 81
log_.output = "";
try {
// If an Object is destroyed, it will unsub from any
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
  expect(log_.output).toMatchGolden({ i: 80, str: " <b>&gt;</b> ping <b>&gt;</b> ping" });


// Example 82
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
  expect(log_.output).toMatchGolden({ i: 81, str: " <b>&gt;</b> Exception:  EandRTest: \"extends\" and \"refines\" are mutually exclusive." });


// Example 83
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
  expect(log_.output).toMatchGolden({ i: 82, str: " <b>&gt;</b> Exception:  Required property foam.core.Property.name not defined." });


// Example 84
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
  expect(log_.output).toMatchGolden({ i: 83, str: " <b>&gt;</b> Exception:  Class constant conflict: ConstantConflictTest.FIRST_NAME from: FirstName and firstName" });


// Example 85
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
  expect(log_.output).toMatchGolden({ i: 84, str: "" });


// Example 86
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
  expect(log_.output).toMatchGolden({ i: 85, str: " <b>&gt;</b> - <b>&gt;</b> Exception:  Required property ValidationTest.test not defined." });


// Example 87
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
  expect(log_.output).toMatchGolden({ i: 86, str: "" });


// Example 88
log_.output = "";
try {
// Contexts can be explicitly created with foam.subContext()
// The second argument of subContext() is an optional name for the Context
var Y1 = foam.subContext({key: 'value', fn: function() { console.log('here'); }}, 'SubContext');
console.log(Y1.key, Y1.fn());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 87, str: "herevalue " });


// Example 89
log_.output = "";
try {
// Sub-Contexts can be created from other Contexts.
var Y2 = Y1.subContext({key: 'value2'});
console.log(Y2.key, Y2.fn());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 88, str: "herevalue2 " });


// Example 91
log_.output = "";
try {
// Classes can import values from the Context so that they can be accessed from 'this'.
var Y = foam.subContext({log: function(msg) { console.log('log:', msg); }});
foam.CLASS({
  name: 'ImportsTest',
  imports: [ 'log', 'warn' ],
  methods: [ function foo() {
    this.log('log foo from ImportTest');
    this.warn('warn foo from ImportTest');
  } ]
});
var o = ImportsTest.create();
o.foo();
Y.log('test');
var o = ImportsTest.create(null, Y);
o.foo();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 90, str: "log foo from ImportTestlog: testlog: log foo from ImportTest" });


// Example 92
log_.output = "";
try {
// Classes can export values for use by objects they create.
foam.CLASS({
  name: 'ExportsTest',
  requires: [ 'ImportsTest' ],
  exports: [ 'log', 'log as warn' ],
  methods: [
    function init() {
      this.ImportsTest.create().foo();
    },
    function log(msg) {
      console.log('log:', msg);
    }
  ]
});
ExportsTest.create();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 91, str: "log: log foo from ImportTestlog: warn foo from ImportTest" });


// Example 93
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
  expect(log_.output).toMatchGolden({ i: 92, str: "foo from com.acme.Test" });


// Example 94
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
  expect(log_.output).toMatchGolden({ i: 93, str: "foo from com.acme.Test" });


// Example 95
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
  expect(log_.output).toMatchGolden({ i: 94, str: "foo from com.acme.Test" });


// Example 96
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
  expect(log_.output).toMatchGolden({ i: 95, str: " <b>&gt;</b> 1" });


// Example 97
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
  expect(log_.output).toMatchGolden({ i: 96, str: " <b>&gt;</b> 1 1" });


// Example 98
log_.output = "";
try {
// Multi-park unique identifiers are also supported.
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
  expect(log_.output).toMatchGolden({ i: 97, str: " <b>&gt;</b> 1,1 1 1 <b>&gt;</b> 2,3 2 3" });


// Example 99
log_.output = "";
try {
// A Classes 'id' is a combination of its package and name.
log(com.acme.Test.id);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 98, str: " <b>&gt;</b> com.acme.Test" });


// Example 100
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
  expect(log_.output).toMatchGolden({ i: 99, str: " <b>&gt;</b> Creating AxiomTest <b>&gt;</b> true" });


// Example 101
log_.output = "";
try {
// Stdlib
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 100, str: "" });


// Example 103
log_.output = "";
try {
// foam.Array.argsToArray() is a convenience method for converting the psedo-array 'arguments'.
(function() {
  log(Array.isArray(arguments), Array.isArray(foam.Array.argsToArray(arguments)));
})();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 102, str: " <b>&gt;</b> false true" });


// Example 104
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
  expect(log_.output).toMatchGolden({ i: 103, str: "[object Object][object Object],foo[object Object],foo,bar" });


// Example 105
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
  expect(log_.output).toMatchGolden({ i: 104, str: " <b>&gt;</b> calculating  2 <b>&gt;</b> 4 <b>&gt;</b> 4 <b>&gt;</b> calculating  4 <b>&gt;</b> 16" });


// Example 106
log_.output = "";
try {
// A call to memoize1() with no arguments will trigger a failed assertion.
log(f());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 105, str: " <b>&gt;</b> Assertion failed: Memoize1'ed functions must take exactly one argument. <b>&gt;</b> Exception:  assert" });


// Example 107
log_.output = "";
try {
// A call to memoize1() with more than one argument will trigger a failed assertion.
log(f(1,2));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 106, str: " <b>&gt;</b> Assertion failed: Memoize1'ed functions must take exactly one argument. <b>&gt;</b> Exception:  assert" });


// Example 108
log_.output = "";
try {
// foam.Function.argsStr() returns a function's arguments an a string.
log(foam.Function.argsStr(function(a,b,fooBar) { }));
log(typeof foam.Function.argsStr(function() { }));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 107, str: " <b>&gt;</b> a,b,fooBar <b>&gt;</b> string" });


// Example 109
log_.output = "";
try {
// foam.Function.argsArray() returns a function's arguments an an array.
log(foam.Function.argsArray(function(a,b,fooBar) { }));
log(Array.isArray(foam.Function.argsArray(function() { })));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 108, str: " <b>&gt;</b> a,b,fooBar <b>&gt;</b> true" });


// Example 110
log_.output = "";
try {
// foam.String.constantize converts strings from camelCase to CONSTANT_FORMAT
log(foam.String.constantize('foo'));
log(foam.String.constantize('fooBar'));
log(foam.String.constantize('fooBar12'));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 109, str: " <b>&gt;</b> FOO <b>&gt;</b> FOO_BAR <b>&gt;</b> FOO_BAR12" });


// Example 111
log_.output = "";
try {
// foam.String.capitalize capitalizes strings
log(foam.String.capitalize('Abc def'));
log(foam.String.capitalize('abc def'));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 110, str: " <b>&gt;</b> Abc def <b>&gt;</b> Abc def" });


// Example 112
log_.output = "";
try {
// foam.String.labelize converts from camelCase to labels
log(foam.String.labelize('camelCase'));
log(foam.String.labelize('firstName'));
log(foam.String.labelize('someLongName'));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 111, str: " <b>&gt;</b> Camel Case <b>&gt;</b> First Name <b>&gt;</b> Some Long Name" });


// Example 113
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
  expect(log_.output).toMatchGolden({ i: 112, str: " <b>&gt;</b> This is\na\nmulti-line\nstring" });


// Example 114
log_.output = "";
try {
// foam.String.pad() pads a string to the specified length.
var s = foam.String.pad('foobar', 10);
log(s, s.length);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 113, str: " <b>&gt;</b> foobar     10" });


// Example 115
log_.output = "";
try {
// foam.String.pad() pads a string to the specified length, right justifying if given a negative number.
var s = foam.String.pad('foobar', -10);
log(s, s.length);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 114, str: " <b>&gt;</b>     foobar 10" });


// Example 116
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
  expect(log_.output).toMatchGolden({ i: 115, str: " <b>&gt;</b> Hello, my name is Adam." });


// Example 117
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
  expect(log_.output).toMatchGolden({ i: 116, str: " <b>&gt;</b> Hello Bob, my name is Adam." });


// Example 118
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
  expect(log_.output).toMatchGolden({ i: 117, str: " <b>&gt;</b> Hello Alice, my name is Adam" });


// Example 119
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
  expect(log_.output).toMatchGolden({ i: 118, str: " <b>&gt;</b> Use raw JS code for loops and control structures\ni is: \"0\"  which is even!\ni is: \"1\" \ni is: \"2\"  which is even!\ni is: \"3\" \ni is: \"4\"  which is even!\ni is: \"5\" \ni is: \"6\"  which is even!\ni is: \"7\" \ni is: \"8\"  which is even!\ni is: \"9\" \n\nUse percent signs to shortcut access to local properties\nFor instance, my name is Adam\n" });


// Example 120
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
  expect(log_.output).toMatchGolden({ i: 119, str: " <b>&gt;</b> \n        Use raw JS code for loops and control structures\n        \n        i is: \"0\"  which is even!\n        i is: \"1\" \n        i is: \"2\"  which is even!\n        i is: \"3\" \n        i is: \"4\"  which is even!\n        i is: \"5\" \n        i is: \"6\"  which is even!\n        i is: \"7\" \n        i is: \"8\"  which is even!\n        i is: \"9\" \n        Use percent signs to shortcut access to local properties\n        For instance, my name is Adam\n      " });


// Example 121
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
  expect(log_.output).toMatchGolden({ i: 120, str: "Instance of JSONTestAxiom Type           Name           Value----------------------------------------------------Property             name           JohnInt                  age            42StringArray          children       Peter,PaulProperty             name That Need Property             undefined      Property             defined        String               undefinedStrin String               definedString  String               defaultString  defaultInt                  undefinedInt   0Int                  definedInt     0Int                  defaultInt     3Float                undefinedFloat 0Float                definedFloat   0Float                defaultFloat   3.14Boolean              undefinedBoole falseBoolean              trueBoolean    falseBoolean              falseBoolean   falseBoolean              defaultBoolean trueFunction             undefinedFunct function () {}Function             definedFunctio function () {}Property             undefinedFObje Property             definedFObject Property             transient      Property             networkTransie Property             storageTransie \n" });


// Example 122
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
  expect(log_.output).toMatchGolden({ i: 121, str: " <b>&gt;</b> {class:\"JSONTest\",name:\"John\",age:42,children:[\"Peter\",\"Paul\"],\"name That Needs Quoting\":42,defined:\"value\",definedString:\"stringValue\",definedInt:42,definedFloat:42.42,trueBoolean:true,definedFunction:function plus(a, b) { return a + b; },definedFObject:{class:\"JSONTest\",name:\"Janet\",age:32,children:[\"Kim\",\"Kathy\"]},networkTransient:\"network transient value\",storageTransient:\"storage transient value\"}" });


// Example 123
log_.output = "";
try {
// Or as a method on Objects
log(o.toJSON());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 122, str: " <b>&gt;</b> {\n	class: \"JSONTest\",\n	name: \"John\",\n	age: 42,\n	children: [\n		\"Peter\",\n		\"Paul\"\n	],\n	\"name That Needs Quoting\": 42,\n	undefined: null,\n	defined: \"value\",\n	undefinedString: \"\",\n	definedString: \"stringValue\",\n	defaultString: \"default\",\n	undefinedInt: 0,\n	definedInt: 42,\n	defaultInt: 3,\n	undefinedFloat: 0,\n	definedFloat: 42.42,\n	defaultFloat: 3.14,\n	undefinedBoolean: false,\n	trueBoolean: true,\n	falseBoolean: false,\n	defaultBoolean: true,\n	undefinedFunction: function () {},\n	definedFunction: function plus(a, b) { return a + b; },\n	undefinedFObject: null,\n	definedFObject: {\n		class: \"JSONTest\",\n		name: \"Janet\",\n		age: 32,\n		children: [\n			\"Kim\",\n			\"Kathy\"\n		],\n		\"name That Needs Quoting\": null,\n		undefined: null,\n		defined: null,\n		undefinedString: \"\",\n		definedString: \"\",\n		defaultString: \"default\",\n		undefinedInt: 0,\n		definedInt: 0,\n		defaultInt: 3,\n		undefinedFloat: 0,\n		definedFloat: 0,\n		defaultFloat: 3.14,\n		undefinedBoolean: false,\n		trueBoolean: false,\n		falseBoolean: false,\n		defaultBoolean: true,\n		undefinedFunction: function () {},\n		definedFunction: function () {},\n		undefinedFObject: null,\n		definedFObject: null,\n		networkTransient: null,\n		storageTransient: null\n	},\n	networkTransient: \"network transient value\",\n	storageTransient: \"storage transient value\"\n}" });


// Example 124
log_.output = "";
try {
//
log(foam.json.Pretty.stringify(o));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 123, str: " <b>&gt;</b> {\n	class: \"JSONTest\",\n	name: \"John\",\n	age: 42,\n	children: [\n		\"Peter\",\n		\"Paul\"\n	],\n	\"name That Needs Quoting\": 42,\n	undefined: null,\n	defined: \"value\",\n	undefinedString: \"\",\n	definedString: \"stringValue\",\n	defaultString: \"default\",\n	undefinedInt: 0,\n	definedInt: 42,\n	defaultInt: 3,\n	undefinedFloat: 0,\n	definedFloat: 42.42,\n	defaultFloat: 3.14,\n	undefinedBoolean: false,\n	trueBoolean: true,\n	falseBoolean: false,\n	defaultBoolean: true,\n	undefinedFunction: function () {},\n	definedFunction: function plus(a, b) { return a + b; },\n	undefinedFObject: null,\n	definedFObject: {\n		class: \"JSONTest\",\n		name: \"Janet\",\n		age: 32,\n		children: [\n			\"Kim\",\n			\"Kathy\"\n		],\n		\"name That Needs Quoting\": null,\n		undefined: null,\n		defined: null,\n		undefinedString: \"\",\n		definedString: \"\",\n		defaultString: \"default\",\n		undefinedInt: 0,\n		definedInt: 0,\n		defaultInt: 3,\n		undefinedFloat: 0,\n		definedFloat: 0,\n		defaultFloat: 3.14,\n		undefinedBoolean: false,\n		trueBoolean: false,\n		falseBoolean: false,\n		defaultBoolean: true,\n		undefinedFunction: function () {},\n		definedFunction: function () {},\n		undefinedFObject: null,\n		definedFObject: null,\n		networkTransient: null,\n		storageTransient: null\n	},\n	networkTransient: \"network transient value\",\n	storageTransient: \"storage transient value\"\n}" });


// Example 125
log_.output = "";
try {
//
log(foam.json.Pretty.clone().copyFrom({outputClassNames: false}).stringify(o));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 124, str: " <b>&gt;</b> {\n	\n	name: \"John\",\n	age: 42,\n	children: [\n		\"Peter\",\n		\"Paul\"\n	],\n	\"name That Needs Quoting\": 42,\n	undefined: null,\n	defined: \"value\",\n	undefinedString: \"\",\n	definedString: \"stringValue\",\n	defaultString: \"default\",\n	undefinedInt: 0,\n	definedInt: 42,\n	defaultInt: 3,\n	undefinedFloat: 0,\n	definedFloat: 42.42,\n	defaultFloat: 3.14,\n	undefinedBoolean: false,\n	trueBoolean: true,\n	falseBoolean: false,\n	defaultBoolean: true,\n	undefinedFunction: function () {},\n	definedFunction: function plus(a, b) { return a + b; },\n	undefinedFObject: null,\n	definedFObject: {\n		\n		name: \"Janet\",\n		age: 32,\n		children: [\n			\"Kim\",\n			\"Kathy\"\n		],\n		\"name That Needs Quoting\": null,\n		undefined: null,\n		defined: null,\n		undefinedString: \"\",\n		definedString: \"\",\n		defaultString: \"default\",\n		undefinedInt: 0,\n		definedInt: 0,\n		defaultInt: 3,\n		undefinedFloat: 0,\n		definedFloat: 0,\n		defaultFloat: 3.14,\n		undefinedBoolean: false,\n		trueBoolean: false,\n		falseBoolean: false,\n		defaultBoolean: true,\n		undefinedFunction: function () {},\n		definedFunction: function () {},\n		undefinedFObject: null,\n		definedFObject: null,\n		networkTransient: null,\n		storageTransient: null\n	},\n	networkTransient: \"network transient value\",\n	storageTransient: \"storage transient value\"\n}" });


// Example 126
log_.output = "";
try {
//
log(foam.json.Strict.stringify(o));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 125, str: " <b>&gt;</b> {\"class\":\"JSONTest\",\"name\":\"John\",\"age\":42,\"children\":[\"Peter\",\"Paul\"],\"name That Needs Quoting\":42,\"undefined\":null,\"defined\":\"value\",\"undefinedString\":\"\",\"definedString\":\"stringValue\",\"defaultString\":\"default\",\"undefinedInt\":0,\"definedInt\":42,\"defaultInt\":3,\"undefinedFloat\":0,\"definedFloat\":42.42,\"defaultFloat\":3.14,\"undefinedBoolean\":false,\"trueBoolean\":true,\"falseBoolean\":false,\"defaultBoolean\":true,\"undefinedFunction\":\"function () {}\",\"definedFunction\":\"function plus(a, b) { return a + b; }\",\"undefinedFObject\":null,\"definedFObject\":{\"class\":\"JSONTest\",\"name\":\"Janet\",\"age\":32,\"children\":[\"Kim\",\"Kathy\"],\"name That Needs Quoting\":null,\"undefined\":null,\"defined\":null,\"undefinedString\":\"\",\"definedString\":\"\",\"defaultString\":\"default\",\"undefinedInt\":0,\"definedInt\":0,\"defaultInt\":3,\"undefinedFloat\":0,\"definedFloat\":0,\"defaultFloat\":3.14,\"undefinedBoolean\":false,\"trueBoolean\":false,\"falseBoolean\":false,\"defaultBoolean\":true,\"undefinedFunction\":\"function () {}\",\"definedFunction\":\"function () {}\",\"undefinedFObject\":null,\"definedFObject\":null,\"networkTransient\":null,\"storageTransient\":null},\"networkTransient\":\"network transient value\",\"storageTransient\":\"storage transient value\"}" });


// Example 127
log_.output = "";
try {
//
log(foam.json.PrettyStrict.stringify(o));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 126, str: " <b>&gt;</b> {\n	\"class\": \"JSONTest\",\n	\"name\": \"John\",\n	\"age\": 42,\n	\"children\": [\n		\"Peter\",\n		\"Paul\"\n	],\n	\"name That Needs Quoting\": 42,\n	\"undefined\": null,\n	\"defined\": \"value\",\n	\"undefinedString\": \"\",\n	\"definedString\": \"stringValue\",\n	\"defaultString\": \"default\",\n	\"undefinedInt\": 0,\n	\"definedInt\": 42,\n	\"defaultInt\": 3,\n	\"undefinedFloat\": 0,\n	\"definedFloat\": 42.42,\n	\"defaultFloat\": 3.14,\n	\"undefinedBoolean\": false,\n	\"trueBoolean\": true,\n	\"falseBoolean\": false,\n	\"defaultBoolean\": true,\n	\"undefinedFunction\": \"function () {}\",\n	\"definedFunction\": \"function plus(a, b) { return a + b; }\",\n	\"undefinedFObject\": null,\n	\"definedFObject\": {\n		\"class\": \"JSONTest\",\n		\"name\": \"Janet\",\n		\"age\": 32,\n		\"children\": [\n			\"Kim\",\n			\"Kathy\"\n		],\n		\"name That Needs Quoting\": null,\n		\"undefined\": null,\n		\"defined\": null,\n		\"undefinedString\": \"\",\n		\"definedString\": \"\",\n		\"defaultString\": \"default\",\n		\"undefinedInt\": 0,\n		\"definedInt\": 0,\n		\"defaultInt\": 3,\n		\"undefinedFloat\": 0,\n		\"definedFloat\": 0,\n		\"defaultFloat\": 3.14,\n		\"undefinedBoolean\": false,\n		\"trueBoolean\": false,\n		\"falseBoolean\": false,\n		\"defaultBoolean\": true,\n		\"undefinedFunction\": \"function () {}\",\n		\"definedFunction\": \"function () {}\",\n		\"undefinedFObject\": null,\n		\"definedFObject\": null,\n		\"networkTransient\": null,\n		\"storageTransient\": null\n	},\n	\"networkTransient\": \"network transient value\",\n	\"storageTransient\": \"storage transient value\"\n}" });


// Example 128
log_.output = "";
try {
//
log(foam.json.Compact.stringify(o));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 127, str: " <b>&gt;</b> {class:\"JSONTest\",name:\"John\",age:42,children:[\"Peter\",\"Paul\"],\"name That Needs Quoting\":42,defined:\"value\",definedString:\"stringValue\",definedInt:42,definedFloat:42.42,trueBoolean:true,definedFunction:function plus(a, b) { return a + b; },definedFObject:{class:\"JSONTest\",name:\"Janet\",age:32,children:[\"Kim\",\"Kathy\"]},networkTransient:\"network transient value\",storageTransient:\"storage transient value\"}" });


// Example 129
log_.output = "";
try {
//
log(foam.json.Short.stringify(o));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 128, str: " <b>&gt;</b> {class:\"JSONTest\",n:\"John\",a:42,cs:[\"Peter\",\"Paul\"],\"name That Needs Quoting\":42,defined:\"value\",definedString:\"stringValue\",definedInt:42,definedFloat:42.42,trueBoolean:true,definedFunction:function plus(a, b) { return a + b; },definedFObject:{class:\"JSONTest\",n:\"Janet\",a:32,cs:[\"Kim\",\"Kathy\"]},networkTransient:\"network transient value\",storageTransient:\"storage transient value\"}" });


// Example 130
log_.output = "";
try {
//
log(foam.json.Network.stringify(o));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 129, str: " <b>&gt;</b> {class:\"JSONTest\",n:\"John\",a:42,cs:[\"Peter\",\"Paul\"],\"name That Needs Quoting\":42,defined:\"value\",definedString:\"stringValue\",definedInt:42,definedFloat:42.42,trueBoolean:true,definedFunction:function plus(a, b) { return a + b; },definedFObject:{class:\"JSONTest\",n:\"Janet\",a:32,cs:[\"Kim\",\"Kathy\"]},storageTransient:\"storage transient value\"}" });


// Example 131
log_.output = "";
try {
//
log(foam.json.Storage.stringify(o));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 130, str: " <b>&gt;</b> {class:\"JSONTest\",n:\"John\",a:42,cs:[\"Peter\",\"Paul\"],\"name That Needs Quoting\":42,defined:\"value\",definedString:\"stringValue\",definedInt:42,definedFloat:42.42,trueBoolean:true,definedFunction:function plus(a, b) { return a + b; },definedFObject:{class:\"JSONTest\",n:\"Janet\",a:32,cs:[\"Kim\",\"Kathy\"]},networkTransient:\"network transient value\"}" });


});
});

