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
  if ( o.indexOf('<') != 0 ) o = o.replace(/\n/g, '<br>').replace(/ /g,'&nbsp;');
  log_.output += o;
};
var log = function() { log_(' <b>&gt;</b> ' + [].join.call(arguments, ' ')); }
var golden = "";
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
  expect(log_.output).toMatchGolden({ i: 0, str: "&nbsp;<b>&gt;</b>&nbsp;TestClass" });


// Example 2
log_.output = "";
try {
// Use class.describe() to learn about the class
Test.describe();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 1, str: "CLASS:&nbsp;&nbsp;&nbsp;Testextends:&nbsp;FObjectAxiom&nbsp;Type&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Source&nbsp;Class&nbsp;&nbsp;&nbsp;Name----------------------------------------------------Property&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Test&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;aProperty&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Test&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;bMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Test&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;f1Method&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Test&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;f2Topic&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;propertyChangeanonymous&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;XMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;initArgsMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;copyFromMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;clearPropertyMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;toStringMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;toJSONMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;outputJSONMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;equalsMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;compareToMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;diffMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;hashCodeMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cloneMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;describe<br>" });


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
  expect(log_.output).toMatchGolden({ i: 2, str: "&nbsp;<b>&gt;</b>&nbsp;Test&nbsp;<b>&gt;</b>&nbsp;&nbsp;" });


// Example 4
log_.output = "";
try {
// Create an instance with a map argument to initialize properties
var o = Test.create({a:1, b:'foo'});
log(o.a, o.b);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 3, str: "&nbsp;<b>&gt;</b>&nbsp;1&nbsp;foo" });


// Example 5
log_.output = "";
try {
// Objects have a reference to their class in .cls_
log(o.cls_.name);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 4, str: "&nbsp;<b>&gt;</b>&nbsp;Test" });


// Example 6
log_.output = "";
try {
// Test Class membership with Class.isInstance()
log(Test.isInstance(o), Test.isInstance('foo'));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 5, str: "&nbsp;<b>&gt;</b>&nbsp;true&nbsp;false" });


// Example 7
log_.output = "";
try {
// Call Methods
log(o.f1(), o.f2());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 6, str: "&nbsp;<b>&gt;</b>&nbsp;1&nbsp;2" });


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
  expect(log_.output).toMatchGolden({ i: 7, str: "&nbsp;<b>&gt;</b>&nbsp;2&nbsp;bar" });


// Example 9
log_.output = "";
try {
// Multiple properties can be updated at once using copyFrom().
o.copyFrom({a: 42, b: 'rosebud'});
log(o.a, o.b);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 8, str: "&nbsp;<b>&gt;</b>&nbsp;42&nbsp;rosebud" });


// Example 10
log_.output = "";
try {
// Call toString on an object
log(o.toString());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 9, str: "&nbsp;<b>&gt;</b>&nbsp;Test" });


// Example 11
log_.output = "";
try {
// Call describe() on an object to see its Property values
o.describe();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 10, str: "Instance&nbsp;of&nbsp;TestAxiom&nbsp;Type&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Value----------------------------------------------------Property&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;a&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;42Property&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;b&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;rosebud<br>" });


// Example 12
log_.output = "";
try {
// Properties and Methods are types of Axioms
// Get an array of all Axioms belonging to a Class by calling getAxioms.
Test.getAxioms().forEach(function(a) { console.log(a.cls_ && a.cls_.name, a.name); });
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 11, str: "Property&nbsp;aProperty&nbsp;bMethod&nbsp;f1Method&nbsp;f2Topic&nbsp;propertyChange&nbsp;XMethod&nbsp;initArgsMethod&nbsp;copyFromMethod&nbsp;clearPropertyMethod&nbsp;toStringMethod&nbsp;toJSONMethod&nbsp;outputJSONMethod&nbsp;equalsMethod&nbsp;compareToMethod&nbsp;diffMethod&nbsp;hashCodeMethod&nbsp;cloneMethod&nbsp;describe" });


// Example 13
log_.output = "";
try {
// Find an Axiom for a class using getAxiomByName
log(Test.getAxiomByName('a'));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 12, str: "&nbsp;<b>&gt;</b>&nbsp;Property" });


// Example 14
log_.output = "";
try {
// Find all Axioms of a particular class using getAxiomsByClass
log(Test.getAxiomsByClass(foam.core.Method));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 13, str: "&nbsp;<b>&gt;</b>&nbsp;Method,Method,Method,Method,Method,Method,Method,Method,Method,Method,Method,Method,Method,Method" });


// Example 16
log_.output = "";
try {
// Property constants contain map functions
log(Test.getAxiomsByClass(foam.core.Method).map(foam.core.Method.NAME.f));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 15, str: "&nbsp;<b>&gt;</b>&nbsp;f1,f2,initArgs,copyFrom,clearProperty,toString,toJSON,outputJSON,equals,compareTo,diff,hashCode,clone,describe" });


// Example 17
log_.output = "";
try {
// Property constants contain comparators
log(Test.getAxiomsByClass(foam.core.Method).sort(foam.core.Method.NAME.compare).map(foam.core.Method.NAME.f));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 16, str: "&nbsp;<b>&gt;</b>&nbsp;clearProperty,clone,compareTo,copyFrom,describe,diff,equals,f1,f2,hashCode,initArgs,outputJSON,toJSON,toString" });


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
  expect(log_.output).toMatchGolden({ i: 17, str: "&nbsp;<b>&gt;</b>&nbsp;Just&nbsp;Born!" });


// Example 19
log_.output = "";
try {
// Default Values can be defined for Properties
foam.CLASS({
  name: 'DefaultValueTest',
  properties: [
    { name: 'a', defaultValue: 42 },
    { name: 'b', defaultValue: 'foo' },
    { name: 'c' }
  ]
});
var o = DefaultValueTest.create();
log(o.a, o.b, o.c);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 18, str: "&nbsp;<b>&gt;</b>&nbsp;42&nbsp;foo&nbsp;" });


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
  expect(log_.output).toMatchGolden({ i: 19, str: "&nbsp;<b>&gt;</b>&nbsp;false&nbsp;false&nbsp;false&nbsp;<b>&gt;</b>&nbsp;true&nbsp;true&nbsp;true" });


// Example 21
log_.output = "";
try {
// .clearProperty() reverts a value back to its defaultValue
log(o.hasOwnProperty('a'), o.a);
o.clearProperty('a');
log(o.hasOwnProperty('a'), o.a);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 20, str: "&nbsp;<b>&gt;</b>&nbsp;true&nbsp;99&nbsp;<b>&gt;</b>&nbsp;false&nbsp;42" });


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
  expect(log_.output).toMatchGolden({ i: 21, str: "&nbsp;<b>&gt;</b>&nbsp;creating&nbsp;value&nbsp;<b>&gt;</b>&nbsp;42&nbsp;<b>&gt;</b>&nbsp;42" });


// Example 23
log_.output = "";
try {
// Factory not called if value supplied in constructor
var o = FactoryTest.create({a: 42});
log(o.a);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 22, str: "&nbsp;<b>&gt;</b>&nbsp;42" });


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
  expect(log_.output).toMatchGolden({ i: 23, str: "&nbsp;<b>&gt;</b>&nbsp;42" });


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
  expect(log_.output).toMatchGolden({ i: 24, str: "&nbsp;<b>&gt;</b>&nbsp;creating&nbsp;value&nbsp;<b>&gt;</b>&nbsp;42&nbsp;<b>&gt;</b>&nbsp;creating&nbsp;value&nbsp;<b>&gt;</b>&nbsp;42" });


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
  expect(log_.output).toMatchGolden({ i: 25, str: "&nbsp;<b>&gt;</b>&nbsp;5&nbsp;10&nbsp;<b>&gt;</b>&nbsp;10&nbsp;20" });


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
  expect(log_.output).toMatchGolden({ i: 26, str: "&nbsp;<b>&gt;</b>&nbsp;adapt&nbsp;&nbsp;&nbsp;true&nbsp;<b>&gt;</b>&nbsp;adapt&nbsp;&nbsp;true&nbsp;&nbsp;<b>&gt;</b>&nbsp;false" });


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
  expect(log_.output).toMatchGolden({ i: 27, str: "&nbsp;<b>&gt;</b>&nbsp;preSet&nbsp;p1&nbsp;<b>&gt;</b>&nbsp;preSet&nbsp;p1&nbsp;<b>&gt;</b>&nbsp;Mr.&nbsp;Jones" });


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
  expect(log_.output).toMatchGolden({ i: 28, str: "&nbsp;<b>&gt;</b>&nbsp;postSet&nbsp;&nbsp;Smith&nbsp;<b>&gt;</b>&nbsp;postSet&nbsp;Smith&nbsp;Jones&nbsp;<b>&gt;</b>&nbsp;postSet&nbsp;Jones&nbsp;Green" });


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
  expect(log_.output).toMatchGolden({ i: 29, str: "&nbsp;<b>&gt;</b>&nbsp;adapt:&nbsp;&nbsp;&nbsp;1&nbsp;<b>&gt;</b>&nbsp;preSet:&nbsp;&nbsp;&nbsp;2&nbsp;<b>&gt;</b>&nbsp;postSet:&nbsp;&nbsp;&nbsp;3&nbsp;<b>&gt;</b>&nbsp;adapt:&nbsp;&nbsp;3&nbsp;10&nbsp;<b>&gt;</b>&nbsp;preSet:&nbsp;&nbsp;3&nbsp;11&nbsp;<b>&gt;</b>&nbsp;postSet:&nbsp;&nbsp;3&nbsp;12" });


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
  expect(log_.output).toMatchGolden({ i: 30, str: "&nbsp;<b>&gt;</b>&nbsp;42&nbsp;green" });


// Example 32
log_.output = "";
try {
// Constants can also be accessed from the Class
log(ConstantTest.MEANING_OF_LIFE, ConstantTest.FAVOURITE_COLOR);
log(o.cls_.MEANING_OF_LIFE, o.cls_.FAVOURITE_COLOR);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 31, str: "&nbsp;<b>&gt;</b>&nbsp;42&nbsp;green&nbsp;<b>&gt;</b>&nbsp;42&nbsp;green" });


// Example 33
log_.output = "";
try {
// Constants are constant
o.MEANING_OF_LIFE = 43;
log(o.MEANING_OF_LIFE);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 32, str: "&nbsp;<b>&gt;</b>&nbsp;42" });


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
  expect(log_.output).toMatchGolden({ i: 33, str: "&nbsp;<b>&gt;</b>&nbsp;John&nbsp;M&nbsp;<b>&gt;</b>&nbsp;Jane&nbsp;F&nbsp;50000" });


// Example 35
log_.output = "";
try {
// Test if one class is a sub-class of another:
log(Person.isSubClass(Employee), Employee.isSubClass(Person));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 34, str: "&nbsp;<b>&gt;</b>&nbsp;true&nbsp;false" });


// Example 36
log_.output = "";
try {
// A Class is considered a sub-class of itself:
log(Person.isSubClass(Person));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 35, str: "&nbsp;<b>&gt;</b>&nbsp;true" });


// Example 37
log_.output = "";
try {
// FObject is the root class of all other classes:
log(foam.core.FObject.isSubClass(Employee), foam.core.FObject.isSubClass(Person));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 36, str: "&nbsp;<b>&gt;</b>&nbsp;true&nbsp;true" });


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
  expect(log_.output).toMatchGolden({ i: 37, str: "&nbsp;<b>&gt;</b>&nbsp;false&nbsp;<b>&gt;</b>&nbsp;false" });


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
    { name: 'balance', defaultValue: 0 }
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
  expect(log_.output).toMatchGolden({ i: 38, str: "Deposit:&nbsp;&nbsp;42&nbsp;100&nbsp;100Bank:&nbsp;&nbsp;AccountTesterInstance&nbsp;of&nbsp;AccountAxiom&nbsp;Type&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Value----------------------------------------------------Property&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;id&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;42Property&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;status&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;trueProperty&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;balance&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;90<br>Deposit:&nbsp;&nbsp;43&nbsp;100&nbsp;100Bank:&nbsp;&nbsp;AccountTesterInstance&nbsp;of&nbsp;SavingsAccountAxiom&nbsp;Type&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Value----------------------------------------------------Property&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;id&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;43Property&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;status&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;trueProperty&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;balance&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;89.95<br>" });


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
  properties: [ { name: 'salary', defaultValue: 0 } ],
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
  expect(log_.output).toMatchGolden({ i: 39, str: "CLASS:&nbsp;&nbsp;&nbsp;Personextends:&nbsp;FObjectAxiom&nbsp;Type&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Source&nbsp;Class&nbsp;&nbsp;&nbsp;Name----------------------------------------------------Property&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Person&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;nameProperty&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Person&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;sexMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Person&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;toStringProperty&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Person&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;salaryTopic&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;propertyChangeanonymous&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;XMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;initArgsMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;copyFromMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;clearPropertyMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;toJSONMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;outputJSONMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;equalsMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;compareToMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;diffMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;hashCodeMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cloneMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;describe<br>&nbsp;<b>&gt;</b>&nbsp;Jane&nbsp;F&nbsp;50000&nbsp;<b>&gt;</b>&nbsp;John&nbsp;M&nbsp;0" });


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
  expect(log_.output).toMatchGolden({ i: 44, str: "m1&nbsp;Stevel1&nbsp;Steve&nbsp;<b>&gt;</b>&nbsp;&nbsp;" });


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
  expect(log_.output).toMatchGolden({ i: 45, str: "m1&nbsp;l1&nbsp;Steve&nbsp;<b>&gt;</b>&nbsp;&nbsp;" });


// Example 51
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
  expect(log_.output).toMatchGolden({ i: 50, str: "CLASS:&nbsp;&nbsp;&nbsp;ImplementsTestextends:&nbsp;FObjectAxiom&nbsp;Type&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Source&nbsp;Class&nbsp;&nbsp;&nbsp;Name----------------------------------------------------Implements&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ImplementsTest&nbsp;implements_SampleIProperty&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ImplementsTest&nbsp;t1Property&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ImplementsTest&nbsp;t2Property&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ImplementsTest&nbsp;t3Method&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ImplementsTest&nbsp;tfooMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ImplementsTest&nbsp;tbarProperty&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ImplementsTest&nbsp;p1Property&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ImplementsTest&nbsp;p2Property&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ImplementsTest&nbsp;p3Method&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ImplementsTest&nbsp;fooMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ImplementsTest&nbsp;barTopic&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;propertyChangeanonymous&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;XMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;initArgsMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;copyFromMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;clearPropertyMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;toStringMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;toJSONMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;outputJSONMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;equalsMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;compareToMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;diffMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;hashCodeMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cloneMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;describe<br>Instance&nbsp;of&nbsp;ImplementsTestAxiom&nbsp;Type&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Value----------------------------------------------------Property&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;t1&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2Property&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;t2&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Property&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;t3&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Property&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;p1&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1Property&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;p2&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Property&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;p3&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>ffoofoo" });


// Example 52
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
  expect(log_.output).toMatchGolden({ i: 51, str: "CLASS:&nbsp;&nbsp;&nbsp;ImplementsTest2extends:&nbsp;FObjectAxiom&nbsp;Type&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Source&nbsp;Class&nbsp;&nbsp;&nbsp;Name----------------------------------------------------Implements&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ImplementsTest&nbsp;implements_SampleIProperty&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ImplementsTest&nbsp;t1Property&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ImplementsTest&nbsp;t2Property&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ImplementsTest&nbsp;t3Method&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ImplementsTest&nbsp;tfooMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ImplementsTest&nbsp;tbarImplements&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ImplementsTest&nbsp;implements_Sample2IProperty&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ImplementsTest&nbsp;tb1Property&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ImplementsTest&nbsp;tb2Property&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ImplementsTest&nbsp;tb3Method&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ImplementsTest&nbsp;tbfooMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ImplementsTest&nbsp;tbbarTopic&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;propertyChangeanonymous&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;XMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;initArgsMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;copyFromMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;clearPropertyMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;toStringMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;toJSONMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;outputJSONMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;equalsMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;compareToMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;diffMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;hashCodeMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cloneMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;describe<br>" });


// Example 53
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
  expect(log_.output).toMatchGolden({ i: 52, str: "&nbsp;<b>&gt;</b>&nbsp;1&nbsp;2&nbsp;5&nbsp;10" });


// Example 54
log_.output = "";
try {
// Inner-classes can also be accessed from the outer-class
InnerClassTest.InnerClass1.describe();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 53, str: "CLASS:&nbsp;&nbsp;&nbsp;InnerClass1extends:&nbsp;FObjectAxiom&nbsp;Type&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Source&nbsp;Class&nbsp;&nbsp;&nbsp;Name----------------------------------------------------Property&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;InnerClass1&nbsp;&nbsp;&nbsp;&nbsp;aProperty&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;InnerClass1&nbsp;&nbsp;&nbsp;&nbsp;bTopic&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;propertyChangeanonymous&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;XMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;initArgsMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;copyFromMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;clearPropertyMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;toStringMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;toJSONMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;outputJSONMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;equalsMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;compareToMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;diffMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;hashCodeMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cloneMethod&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FObject&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;describe<br>" });


// Example 55
log_.output = "";
try {
// Inner-classes do not appear in the global namespace
// TODO: isn't true yet
log(! InnerClass1);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 54, str: "&nbsp;<b>&gt;</b>&nbsp;false" });


// Example 56
log_.output = "";
try {
// Objects support publish() for publishing events,
// and subscribe() for listening for published events.
foam.CLASS({
  name: 'PubSubTest'
});
var o = PubSubTest.create();
// Install a listener that listens to all events
o.subscribe(function() { console.log('global listener: ', [].join.call(arguments, ' ')); });
o.subscribe('alarm', function() { console.log('alarm: ', [].join.call(arguments, ' ')); });
o.publish('alarm', 'on');
o.publish('lifecycle', 'loaded');
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 55, str: "global&nbsp;listener:&nbsp;&nbsp;[object&nbsp;Object]&nbsp;alarm&nbsp;onalarm:&nbsp;&nbsp;[object&nbsp;Object]&nbsp;alarm&nbsp;onglobal&nbsp;listener:&nbsp;&nbsp;[object&nbsp;Object]&nbsp;lifecycle&nbsp;loaded" });


// Example 57
log_.output = "";
try {
// A Class can declare 'Topics' that it publishes events for.
foam.CLASS({
  name: 'TopicTest',
  topics: [ 'alarm' ]
});
var o = TopicTest.create();
o.subscribe('alarm', function(_, _, state) { console.log('alarm: ', state); });
// The next line uses the Topic and is slightly shorter than the equivalent above.
o.alarm.subscribe(function(_, _, state) { console.log('alarm (topic): ', state); });
o.alarm.publish('on');
o.publish('alarm', 'off');
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 56, str: "alarm&nbsp;(topic):&nbsp;&nbsp;onalarm:&nbsp;&nbsp;onalarm&nbsp;(topic):&nbsp;&nbsp;offalarm:&nbsp;&nbsp;off" });


// Example 58
log_.output = "";
try {
// Objects implicitly publish events on the 'propertyChange' topic when
foam.CLASS({
  name: 'PropertyChangeTest',
  properties: [ 'a', 'b' ]
});
o = PropertyChangeTest.create();
// Listen for all propertyChange events:
o.propertyChange.subscribe(function(sub, p, name, dyn) { console.log('propertyChange: ', p, name, dyn.getPrev(), dyn.get()); });
// Listen for only changes to the 'a' Property:
o.propertyChange.subscribe('a', function(sub, p, name, dyn) { console.log('propertyChange.a: ', p, name, dyn.getPrev(), dyn.get()); });
o.a = 42;
o.b = 'bar';
o.a++;
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 57, str: "propertyChange:&nbsp;&nbsp;propertyChange&nbsp;a&nbsp;&nbsp;42propertyChange.a:&nbsp;&nbsp;propertyChange&nbsp;a&nbsp;&nbsp;42propertyChange:&nbsp;&nbsp;propertyChange&nbsp;b&nbsp;&nbsp;barpropertyChange:&nbsp;&nbsp;propertyChange&nbsp;a&nbsp;42&nbsp;43propertyChange.a:&nbsp;&nbsp;propertyChange&nbsp;a&nbsp;42&nbsp;43" });


// Example 59
log_.output = "";
try {
// There are four ways to unsubscribe a listener
// 1. Call obj.unsubscribe();
o = TopicTest.create();
var l = function() { console.log.apply(console.log, arguments); };
o.subscribe(l);
o.publish('fire');
o.unsubscribe(l);
o.publish("fire again, but nobody's listenering");
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 58, str: "[object&nbsp;Object]&nbsp;fire" });


// Example 60
log_.output = "";
try {
// 2. Call .destroy() on the Destroyable that subscribe() returns
var sub = o.subscribe(l);
o.publish('fire');
sub.destroy();
o.publish("fire again, but nobody's listenering");
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 59, str: "[object&nbsp;Object]&nbsp;fire" });


// Example 61
log_.output = "";
try {
// 3. Destroy the subscription, which is supplied to the listener
var l = function(sub) {
  sub.destroy();
  console.log.apply(console.log, arguments);
};
o.subscribe(l);
o.publish('fire');
o.publish("fire again, but nobody's listenering");
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 60, str: "[object&nbsp;Object]&nbsp;fire" });


// Example 62
log_.output = "";
try {
// 4. If you only want to receive the first event, decorate your
// listener with foam.events.oneTime() and it will cancel the subscription
// when it receives the first event.
o.subscribe(foam.events.oneTime(function() { console.log.apply(console.log, arguments); }));
o.publish('fire');
o.publish("fire again, but nobody's listenering");
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 61, str: "[object&nbsp;Object]&nbsp;fire" });


// Example 63
log_.output = "";
try {
// DynamicValues are like Object-Oriented pointers.
// A properties dynamic-value is accessed as 'name'$.
// get() is used to dereference the value of a dynamic
var p = Person.create({name: 'Bob'});
var dyn = p.name$;
log(dyn.get());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 62, str: "&nbsp;<b>&gt;</b>&nbsp;Bob" });


// Example 64
log_.output = "";
try {
// set() is used to set a dynamic's value:
dyn.set('John');
log(p.name, dyn.get());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 63, str: "&nbsp;<b>&gt;</b>&nbsp;John&nbsp;John" });


// Example 65
log_.output = "";
try {
// Calling obj.dynamcicProperty('name') is the same as obj.name$.
var p = Person.create({name: 'Bob'});
var dyn = p.dynamicProperty('name');
log(dyn.get());
dyn.set('John');
log(dyn.get());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 64, str: "&nbsp;<b>&gt;</b>&nbsp;Bob&nbsp;<b>&gt;</b>&nbsp;John" });


// Example 66
log_.output = "";
try {
// Two-Way Data-Binding
// Dynamic values can be assigned, causing two values to be
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
  expect(log_.output).toMatchGolden({ i: 65, str: "&nbsp;<b>&gt;</b>&nbsp;John&nbsp;John&nbsp;<b>&gt;</b>&nbsp;Steve&nbsp;Steve" });


// Example 67
log_.output = "";
try {
// Another way to link to Dynamics is to call .link() on one of them.
var p1 = Person.create(), p2 = Person.create();
var d = p1.name$.link(p2.name$);
p1.name = 'John';
log(p1.name, p2.name);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 66, str: "&nbsp;<b>&gt;</b>&nbsp;John&nbsp;John" });


// Example 68
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
  expect(log_.output).toMatchGolden({ i: 67, str: "&nbsp;<b>&gt;</b>&nbsp;John&nbsp;Steve" });


// Example 69
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
  expect(log_.output).toMatchGolden({ i: 68, str: "&nbsp;<b>&gt;</b>&nbsp;Ringo&nbsp;Ringo&nbsp;<b>&gt;</b>&nbsp;George&nbsp;Ringo" });


// Example 70
log_.output = "";
try {
// Dynamic Values also let you check if the value is defined by calling isDefined().
// Calling obj.name$.isDefined() is equivalent to obj.hasOwnProperty('name');
foam.CLASS({name: 'IsDefinedTest', properties: [ { name: 'a', defaultValue: 42 } ]});
var o = IsDefinedTest.create();
var dv = o.a$;
log(dv.isDefined());
dv.set(99);
log(dv.isDefined());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 69, str: "&nbsp;<b>&gt;</b>&nbsp;false&nbsp;<b>&gt;</b>&nbsp;true" });


// Example 71
log_.output = "";
try {
// You can reset a Dynamic Value to its default value by calling .clear().
// Calling obj.name$.clear() is equivalent to obj.clearProperty('name');
dv.clear();
log(dv.get(), dv.isDefined());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 70, str: "&nbsp;<b>&gt;</b>&nbsp;42&nbsp;false" });


// Example 72
log_.output = "";
try {
// DynamicExpression creates a Dynamic from a list of Dynamics
// and a function which combines them into a new dynamic value.
foam.CLASS({name: 'Person', properties: ['fname', 'lname']});
var p = Person.create({fname: 'John', lname: 'Smith'});
var e = foam.core.DynamicExpression.create({
  args: [ p.fname$, p.lname$],
  fn: function(f, l) { return f + ' ' + l; }
});
log(e.get());
e.subscribe(log);
p.fname = 'Steve';
p.lname = 'Jones';
log(e.get());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 71, str: "&nbsp;<b>&gt;</b>&nbsp;John&nbsp;Smith&nbsp;<b>&gt;</b>&nbsp;[object&nbsp;Object]&nbsp;propertyChange&nbsp;value&nbsp;[object&nbsp;Object]&nbsp;<b>&gt;</b>&nbsp;[object&nbsp;Object]&nbsp;propertyChange&nbsp;value&nbsp;[object&nbsp;Object]&nbsp;<b>&gt;</b>&nbsp;Steve&nbsp;Jones" });


// Example 73
log_.output = "";
try {
// The same functionality of DynamicExpression is built into Properties
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
p.subscribe(log);
p.fname = 'Steve';
log(p.fname, p.lname, ' = ', p.name);
p.lname = 'Jones';
log(p.fname, p.lname, ' = ', p.name);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 72, str: "Instance&nbsp;of&nbsp;PersonAxiom&nbsp;Type&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Value----------------------------------------------------Property&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;fname&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;JohnProperty&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;lname&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;SmithProperty&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;John&nbsp;Smith<br>&nbsp;<b>&gt;</b>&nbsp;[object&nbsp;Object]&nbsp;propertyChange&nbsp;fname&nbsp;[object&nbsp;Object]&nbsp;<b>&gt;</b>&nbsp;Steve&nbsp;Smith&nbsp;&nbsp;=&nbsp;&nbsp;Steve&nbsp;Smith&nbsp;<b>&gt;</b>&nbsp;[object&nbsp;Object]&nbsp;propertyChange&nbsp;lname&nbsp;[object&nbsp;Object]&nbsp;<b>&gt;</b>&nbsp;Steve&nbsp;Jones&nbsp;&nbsp;=&nbsp;&nbsp;Steve&nbsp;Jones" });


// Example 74
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
  expect(log_.output).toMatchGolden({ i: 73, str: "&nbsp;<b>&gt;</b>&nbsp;Steve&nbsp;Jones&nbsp;false&nbsp;<b>&gt;</b>&nbsp;[object&nbsp;Object]&nbsp;propertyChange&nbsp;name&nbsp;[object&nbsp;Object]&nbsp;<b>&gt;</b>&nbsp;Kevin&nbsp;Greer&nbsp;true&nbsp;<b>&gt;</b>&nbsp;[object&nbsp;Object]&nbsp;propertyChange&nbsp;fname&nbsp;[object&nbsp;Object]&nbsp;<b>&gt;</b>&nbsp;Sebastian&nbsp;Jones&nbsp;:&nbsp;Kevin&nbsp;Greer" });


// Example 75
log_.output = "";
try {
// Clearing a set expression property has it revert to its expression value.
log(p.name, p.hasOwnProperty('name'));
p.clearProperty('name');
log(p.name, p.hasOwnProperty('name'));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 74, str: "&nbsp;<b>&gt;</b>&nbsp;Kevin&nbsp;Greer&nbsp;true&nbsp;<b>&gt;</b>&nbsp;[object&nbsp;Object]&nbsp;propertyChange&nbsp;name&nbsp;[object&nbsp;Object]&nbsp;<b>&gt;</b>&nbsp;Steve&nbsp;Jones&nbsp;false" });


// Example 76
log_.output = "";
try {
// Contexts can be explicitly created with foam.sub()
// The second argument of sub() is an optional name for the Context
var Y1 = foam.sub({key: 'value', fn: function() { console.log('here'); }}, 'SubContext');
console.log(Y1.key, Y1.fn());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 75, str: "herevalue&nbsp;" });


// Example 77
log_.output = "";
try {
// Sub-Contexts can be created from other Contexts.
var Y2 = Y1.sub({key: 'value2'});
console.log(Y2.key, Y2.fn());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 76, str: "herevalue2&nbsp;" });


// Example 79
log_.output = "";
try {
// Classes can import values from the Context so that they can be accessed from 'this'.
var Y = foam.sub({log: function(msg) { console.log('log:', msg); }});
foam.CLASS({
  name: 'ImportsTest',
  imports: [ 'log' ],
  methods: [ function foo() { this.log('foo from ImportTest'); } ]
});
Y.log('test');
var o = ImportsTest.create(null, Y);
o.foo();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 78, str: "log:&nbsp;testlog:&nbsp;foo&nbsp;from&nbsp;ImportTest" });


// Example 80
log_.output = "";
try {
// Classes can export values for use by objects they create.
foam.CLASS({
  name: 'ExportsTest',
  requires: [ 'ImportsTest' ],
  exports: [ 'log' ],
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
  expect(log_.output).toMatchGolden({ i: 79, str: "log:&nbsp;foo&nbsp;from&nbsp;ImportTest" });


// Example 81
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
  expect(log_.output).toMatchGolden({ i: 80, str: "foo&nbsp;from&nbsp;com.acme.Test" });


// Example 82
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
  expect(log_.output).toMatchGolden({ i: 81, str: "foo&nbsp;from&nbsp;com.acme.Test" });


// Example 83
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
  expect(log_.output).toMatchGolden({ i: 82, str: "foo&nbsp;from&nbsp;com.acme.Test" });


// Example 84
log_.output = "";
try {
// A Classes 'id' is a combination of its package and name.
log(com.acme.Test.id);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 83, str: "&nbsp;<b>&gt;</b>&nbsp;com.acme.Test" });


// Example 85
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
  expect(log_.output).toMatchGolden({ i: 84, str: "&nbsp;<b>&gt;</b>&nbsp;Creating&nbsp;AxiomTest&nbsp;<b>&gt;</b>&nbsp;true" });


// Example 86
log_.output = "";
try {
// Stdlib
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 85, str: "" });


// Example 88
log_.output = "";
try {
// foam.array.argsToArray() is a convenience method for converting the psedo-array 'arguments'.
(function() {
  log(Array.isArray(arguments), Array.isArray(foam.array.argsToArray(arguments)));
})();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 87, str: "&nbsp;<b>&gt;</b>&nbsp;false&nbsp;true" });


// Example 89
log_.output = "";
try {
// foam.events.consoleLog
foam.CLASS({name: 'ConsoleLogTest'});
var o = ConsoleLogTest.create();
o.subscribe(foam.events.consoleLog());
o.publish();
o.publish('foo');
o.publish('foo','bar');
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 88, str: "[object&nbsp;Object][object&nbsp;Object],foo[object&nbsp;Object],foo,bar" });


// Example 90
log_.output = "";
try {
// foam.fn.memoize1() memozies a one-argument function so that if called again
// with the same argument, the previously generated value will be returned
// rather than calling the function again.
var f = foam.fn.memoize1(function(x) { log('calculating ', x); return x*x; });
log(f(2));
log(f(2));
log(f(4));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 89, str: "&nbsp;<b>&gt;</b>&nbsp;calculating&nbsp;&nbsp;2&nbsp;<b>&gt;</b>&nbsp;4&nbsp;<b>&gt;</b>&nbsp;4&nbsp;<b>&gt;</b>&nbsp;calculating&nbsp;&nbsp;4&nbsp;<b>&gt;</b>&nbsp;16" });


// Example 91
log_.output = "";
try {
// A call to memoize1() with no arguments will trigger a failed assertion.
log(f());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 90, str: "&nbsp;<b>&gt;</b>&nbsp;Assertion&nbsp;failed:&nbsp;Memoize1'ed&nbsp;functions&nbsp;must&nbsp;take&nbsp;exactly&nbsp;one&nbsp;argument.&nbsp;<b>&gt;</b>&nbsp;Exception:&nbsp;&nbsp;assert" });


// Example 92
log_.output = "";
try {
// A call to memoize1() with more than one argument will trigger a failed assertion.
log(f(1,2));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 91, str: "&nbsp;<b>&gt;</b>&nbsp;Assertion&nbsp;failed:&nbsp;Memoize1'ed&nbsp;functions&nbsp;must&nbsp;take&nbsp;exactly&nbsp;one&nbsp;argument.&nbsp;<b>&gt;</b>&nbsp;Exception:&nbsp;&nbsp;assert" });


// Example 93
log_.output = "";
try {
// foam.fn.argsStr() returns a function's arguments an a string.
log(foam.fn.argsStr(function(a,b,fooBar) { }));
log(typeof foam.fn.argsStr(function() { }));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 92, str: "&nbsp;<b>&gt;</b>&nbsp;a,b,fooBar&nbsp;<b>&gt;</b>&nbsp;string" });


// Example 94
log_.output = "";
try {
// foam.fn.argsArray() returns a function's arguments an an array.
log(foam.fn.argsArray(function(a,b,fooBar) { }));
log(Array.isArray(foam.fn.argsArray(function() { })));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 93, str: "&nbsp;<b>&gt;</b>&nbsp;a,b,fooBar&nbsp;<b>&gt;</b>&nbsp;true" });


// Example 95
log_.output = "";
try {
// foam.string.constantize converts strings from camelCase to CONSTANT_FORMAT
log(foam.string.constantize('foo'));
log(foam.string.constantize('fooBar'));
log(foam.string.constantize('fooBar12'));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 94, str: "&nbsp;<b>&gt;</b>&nbsp;FOO&nbsp;<b>&gt;</b>&nbsp;FOO_BAR&nbsp;<b>&gt;</b>&nbsp;FOO_BAR12" });


// Example 96
log_.output = "";
try {
// foam.string.multiline lets you build multi-line strings
// from function comments.
log(foam.string.multiline(function(){/*This is
a
multi-line
string*/}));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 95, str: "&nbsp;<b>&gt;</b>&nbsp;This&nbsp;is<br>a<br>multi-line<br>string" });


// Example 97
log_.output = "";
try {
// foam.string.pad() pads a string to the specified length.
var s = foam.string.pad('foobar', 10);
log(s, s.length);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 96, str: "&nbsp;<b>&gt;</b>&nbsp;foobar&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;10" });


// Example 98
log_.output = "";
try {
// foam.string.pad() pads a string to the specified length, right justifying if given a negative number.
var s = foam.string.pad('foobar', -10);
log(s, s.length);
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 97, str: "&nbsp;<b>&gt;</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;foobar&nbsp;10" });


// Example 99
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
  expect(log_.output).toMatchGolden({ i: 98, str: "&nbsp;<b>&gt;</b>&nbsp;Hello,&nbsp;my&nbsp;name&nbsp;is&nbsp;Adam." });


// Example 100
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
  expect(log_.output).toMatchGolden({ i: 99, str: "&nbsp;<b>&gt;</b>&nbsp;Hello&nbsp;Bob,&nbsp;my&nbsp;name&nbsp;is&nbsp;Adam." });


// Example 101
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
  expect(log_.output).toMatchGolden({ i: 100, str: "&nbsp;<b>&gt;</b>&nbsp;Hello&nbsp;Alice,&nbsp;my&nbsp;name&nbsp;is&nbsp;Adam" });


// Example 102
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
  expect(log_.output).toMatchGolden({ i: 101, str: "&nbsp;<b>&gt;</b>&nbsp;Use&nbsp;raw&nbsp;JS&nbsp;code&nbsp;for&nbsp;loops&nbsp;and&nbsp;control&nbsp;structures<br>i&nbsp;is:&nbsp;\"0\"&nbsp;&nbsp;which&nbsp;is&nbsp;even!<br>i&nbsp;is:&nbsp;\"1\"&nbsp;<br>i&nbsp;is:&nbsp;\"2\"&nbsp;&nbsp;which&nbsp;is&nbsp;even!<br>i&nbsp;is:&nbsp;\"3\"&nbsp;<br>i&nbsp;is:&nbsp;\"4\"&nbsp;&nbsp;which&nbsp;is&nbsp;even!<br>i&nbsp;is:&nbsp;\"5\"&nbsp;<br>i&nbsp;is:&nbsp;\"6\"&nbsp;&nbsp;which&nbsp;is&nbsp;even!<br>i&nbsp;is:&nbsp;\"7\"&nbsp;<br>i&nbsp;is:&nbsp;\"8\"&nbsp;&nbsp;which&nbsp;is&nbsp;even!<br>i&nbsp;is:&nbsp;\"9\"&nbsp;<br><br>Use&nbsp;percent&nbsp;signs&nbsp;to&nbsp;shortcut&nbsp;access&nbsp;to&nbsp;local&nbsp;properties<br>For&nbsp;instance,&nbsp;my&nbsp;name&nbsp;is&nbsp;Adam<br>" });


// Example 103
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
  expect(log_.output).toMatchGolden({ i: 102, str: "&nbsp;<b>&gt;</b>&nbsp;<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Use&nbsp;raw&nbsp;JS&nbsp;code&nbsp;for&nbsp;loops&nbsp;and&nbsp;control&nbsp;structures<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;i&nbsp;is:&nbsp;\"0\"&nbsp;&nbsp;which&nbsp;is&nbsp;even!<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;i&nbsp;is:&nbsp;\"1\"&nbsp;<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;i&nbsp;is:&nbsp;\"2\"&nbsp;&nbsp;which&nbsp;is&nbsp;even!<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;i&nbsp;is:&nbsp;\"3\"&nbsp;<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;i&nbsp;is:&nbsp;\"4\"&nbsp;&nbsp;which&nbsp;is&nbsp;even!<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;i&nbsp;is:&nbsp;\"5\"&nbsp;<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;i&nbsp;is:&nbsp;\"6\"&nbsp;&nbsp;which&nbsp;is&nbsp;even!<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;i&nbsp;is:&nbsp;\"7\"&nbsp;<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;i&nbsp;is:&nbsp;\"8\"&nbsp;&nbsp;which&nbsp;is&nbsp;even!<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;i&nbsp;is:&nbsp;\"9\"&nbsp;<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Use&nbsp;percent&nbsp;signs&nbsp;to&nbsp;shortcut&nbsp;access&nbsp;to&nbsp;local&nbsp;properties<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;For&nbsp;instance,&nbsp;my&nbsp;name&nbsp;is&nbsp;Adam<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" });


// Example 104
log_.output = "";
try {
// JSON Support
foam.CLASS({
  name: 'JSONTest',
  properties: [ 'name', 'age', 'children' ]
});
var o = foam.json.parse({class: 'JSONTest', name: 'John', age: 42, children: ['Peter', 'Paul']});
o.describe();
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 103, str: "Instance&nbsp;of&nbsp;JSONTestAxiom&nbsp;Type&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Value----------------------------------------------------Property&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;JohnProperty&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;age&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;42Property&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;children&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Peter,Paul<br>" });


// Example 105
log_.output = "";
try {
//
log(foam.json.stringify(o));
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 104, str: "&nbsp;<b>&gt;</b>&nbsp;{class:\"JSONTest\",name:\"John\",age:42,children:[\"Peter\",\"Paul\"]}" });


// Example 106
log_.output = "";
try {
//
log(o.toJSON());
} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 105, str: "&nbsp;<b>&gt;</b>&nbsp;{class:\"JSONTest\",name:\"John\",age:42,children:[\"Peter\",\"Paul\"]}" });


// Example 108
log_.output = "";
try {
// TODO: Putting it all together

} catch(x) {
 log("Exception: ", x);
 }
  expect(log_.output).toMatchGolden({ i: 107, str: "" });


});
});
