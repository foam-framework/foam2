/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'ViewReloader',
  extends: 'foam.u2.Controller',

  imports: [ 'classloader' ],

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'view'
    },
    'viewArea',
    'lastModel'
  ],

  methods: [
    function initE() {
      this/*.add(this.RELOAD).br().br()*/.start('span',{}, this.viewArea$).tag(this.view).end();
      //this.delayedReload();
    }
  ],

  actions: [
    function reload() {
      delete foam.__context__.__cache__[this.view.class];
      delete this.classloader.latched[this.view.class];
      delete this.classloader.pending[this.view.class];
      // TODO: remove old stylesheet

      this.classloader.load(this.view.class).then((cls)=>{

        foam.__context__.__cache__[this.view.class] = cls;
        if ( foam.json.Compact.stringify(cls.model_.instance_) != foam.json.Compact.stringify(this.lastModel && this.lastModel.instance_) ) {
          console.log('reload');
          this.lastModel = cls.model_;
          this.viewArea.removeAllChildren();
          this.viewArea.tag(this.view);
        } else {
//          console.log('no reload');
        }
      });

      this.delayedReload();
    }
  ],

  listeners: [
    {
      name: 'delayedReload',
      isMerged: true,
      mergeDelay: 200,
      code: function() { this.reload(); /*this.delayedReload();*/ }
    }
  ]
});


foam.CLASS({
  package: 'foam.demos.examples',
  name: 'Example',

  classes: [
    {
      name: 'CitationView',
      extends: 'foam.u2.View',

      requires: [
        'foam.demos.examples.Example',
        'foam.u2.Element'
      ],

      imports: [
        'selected'
      ],

      properties: [
        'dom'
      ],

      css: `
        ^ { margin-bottom: 36px; }
        ^ .property-text { border: none; padding: 10 0; }
        ^ .property-code { margin-bottom: 12px; }
        ^ .property-title { float: left; }
        ^ .property-id { float: left; margin-right: 12px; }
      `,

      methods: [
        function initE() {
          this.SUPER();

          var self = this;

          this.
            addClass(this.myClass()).
            show(this.selected$.map(s => ! s || s == self.data.id)).
            style({
              width: '100%',
              xxxborder: '2px solid black',
              'border-radius': '3px',
              'padding-bottom': '24px'
            }).
            tag('hr').
            start('h3').
              add(this.Example.ID, ' ', this.Example.TITLE).
            end().
            br().
            add(this.Example.TEXT).
            br().
            add(this.Example.CODE).
            br().
            start('b').add('Output:').end().
            br().br().
            tag('div', {}, this.dom$);

            this.onload.sub(this.run.bind(this));
            this.onDetach(this.data.code$.sub(this.run.bind(this)));
        }
      ],

      actions: [
        function run() {
          var self = this;
          this.dom.removeAllChildren();
          var scope = {
            el: function() {
              return self.dom.el();
            },
            E: function(opt_nodeName) {
              return self.Element.create({nodeName: opt_nodeName});
            },
            print: function() {
              self.dom.add.apply(self.dom, arguments);
              self.dom.br();
//              self.dom.add(arg);
            },
            add: function() {
              self.dom.add.apply(self.dom, arguments);
            }
          };
          with ( scope ) {
            try {
              eval(self.data.code);
            } catch (x) {
              scope.print(x);
            }
          }
        }
      ]
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      displayWidth: 10,
      comparePropertyValues: function(id1, id2) {
        var a1 = id1.split('.'), a2 = id2.split('.');
        for ( var i = 0 ; i < Math.min(a1.length, a2.length)-1 ; i++ ) {
          var c = foam.util.compare(parseInt(a1[i]), parseInt(a2[i]));
          if ( c ) return c;
        }
        return foam.util.compare(a1.length, a2.length);
      },
      view: {
        class: 'foam.u2.ReadWriteView', nodeName: 'span'
      }
    },
    {
      class: 'String',
      name: 'title',
      displayWidth: 123,
      view: {
        class: 'foam.u2.ReadWriteView', nodeName: 'span'
      }
    },
    {
      class: 'String',
      name: 'text',
      adapt: function(_, text) { return text.trim(); },
      documentation: 'Description of the script.',
      xxxview: {
        class: 'foam.u2.ReadWriteView', nodeName: 'span'
      },
      view: { class: 'foam.u2.tag.TextArea', rows: 4, cols: 120 }
    },
    {
      class: 'Code',
      name: 'code',
      adapt: function(_, s) {
        if ( foam.String.isInstance(s) ) return s.trim();
        s         = s.toString();
        var start = s.indexOf('{');
        var end   = s.lastIndexOf('}');
        return ( start >= 0 && end >= 0 ) ? s.substring(start + 2, end) : '';
      },
      view: { class: 'foam.u2.tag.TextArea', rows: 12, cols: 120 }
    }
  ],

  methods: [
    {
      name: 'runScript',
      code: function() {
        var log = () => {
          this.output += Array.from(arguments).join('') + '\n';
        };
        try {
          with ({ log: log, print: log, x: this.__context__ })
          return Promise.resolve(eval(this.code));
        } catch (err) {
          this.output += err;
          return Promise.reject(err);
        }
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.demos.examples',
  name: 'Controller',
  extends: 'foam.u2.Controller',

  requires: [
    'foam.demos.examples.Example',
    'foam.dao.EasyDAO',
    'foam.u2.DAOList'
  ],

  css: `
    ^ { background: white; }
    ^index {
      background: #f6f6f6;
      margin-right: 20px;
      min-width: 400px;
      padding: 6px 0;
    }
    ^ .selected {
      background: #ddf;
    }
  `,

  exports: [
    'selected'
  ],

  properties: [
    'selected',
    {
      name: 'data',
      factory: function() {
        return this.EasyDAO.create({
          of: foam.demos.examples.Example,
          daoType: 'MDAO',
          cache: true,
          testData: this.createTestData()
        }).orderBy(foam.demos.examples.Example.ID);
      },
      view: {
        class: 'foam.u2.DAOList',
        rowView: { class: 'foam.demos.examples.Example.CitationView' }
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      var self = this;
      this.
        addClass(this.myClass()).
        start('h1').
          add('FOAM by Example').
        end().
        start().
          style({ display: 'flex' }).
          start().
            addClass(this.myClass('index')).
            select(this.data, function(e) {
              return this.E()
                .style({padding: '4px'})
                .add(e.id, ' ', e.title)
                .enableClass('selected', self.selected$.map(s => s == e.id))
                .on('mouseenter', () => { self.selected = e.id; })
                .on('mouseleave', () => { if ( self.selected == e.id ) self.selected = null; })
                ;
            }).
          end().
          start().
            addClass(this.myClass('body')).
            add(this.DATA).
          end().
        end();
    },

    function createTestData() {
      var s = /*`
## Introduction
##  Lib
##  Models
##   Properties
##   Methods
##   Actions
##   Listeners
##   Constants
##   Messages
##   Topics
##   Imports / Exports
##   Requires
##   Implements
##   Topics
##   Requires
##   Extends
##  FObjects
##   equals
##   compareTo
##   diff
##   hashCode
##   clone
##   shallowClone
##   copyFrom
##   toSummary
##   dot
##   slot
##  Classes
##  Slots
## DAOs
*/
`
## U2
##  Background
U2 is FOAM's native UI library.
It is named U2 because it is FOAM's second UI library.
The first UI library was template based, but U2 is based on an Internal Domain Specific Language (IDSL) or Embedded Domain Specific Language (EDSL).
This IDSL is used to describe virtual DOM structures.
DOM is the browser's native API for manipulating the page conents, and stands for Document Object Model.
A Virtual-DOM is an API which mirrors the real DOM API but does so in JS.
The advantages of a Virtual-DOM are:
1. It is faster because it can batch updates across the slow JS <-> C++ bridge.
2. It is more secure because, unlike template-based approaches, it isn't prone to Cross-Site-Scripting (XSS) attacks.
3. It can offer higher-level features and smooth over browser incompatibilites.
4. It doesn't require a template parser, which can either make builds faster or the download size smaller, depending on where the template parsing is performed.
Improved security was the primary motivation for U2.

All U2 components extend foam.u2.Element, which loosely modelled after the DOM <a href="https://www.w3schools.com/jsref/dom_obj_all.asp">Element<a> class.
--
add('testing');
##  Virtual vs. Real DOM
--
console.profile('p1');
function test1() {
var startTime = performance.now();
var node = foam.u2.Element.create({nodeName: 'UL'});     // Create a <ul> node
for ( var i = 0 ; i < 100 ; i++ )
  node.start('li').add("text" + i).end();                // Append an <li>

//add(node);
print(performance.now() - startTime);
}
test1();
console.profileEnd('p1');

var startTime = performance.now();
var node = document.createElement("UL");               // Create a <ul> node
for ( var i = 0 ; i < 100 ; i++ ) {
  var li = document.createElement("LI")
  li.appendChild(document.createTextNode("text" + i)); // Append an <li>
  node.appendChild(li);
}
//el().appendChild(node);
print(performance.now() - startTime);


##  DSL
##  Intro1
##  Intro2
##   SubIntro
##  Fluent Interface
##  nodeName
##  v2
##  ControllerMode
##  DisplayMode
##  Borders
##   content
##  CSS
##  CSS Variables
##  inheritCSS
##  ViewSpec
##  Entities / entity() / nbsp()
##  onKey
##  Element States
##   state
##   onload
##   onunload
##  Tooltips
##  shown / show() / hide()
##  focused / focus() / blur()
##  Creating a Component
##   initE
##  Keyboard Shortcuts
##  el() and id
##  E()
##  addClass() / cssClass() / addClasses()
##  enableCls() / enableClass()
##  myClass()
##  removeClass()
##  setAttribute()
##  removeAttribute()
##  appendChild()
##  removeChild()
##  replaceChild()
##  insertBefore()
##  insertAfter()
##  remove()
##  addEventListener()
##  removeEventListener()
##  on()
##  attr()
##  attrs()
##  style()
##  tag()
##  br()
##  startContext() / endContext()
##  start() / end()
##  i18n
##   Messages
##   translate()
##  add()
##   adding properties
##   toE()
##   view:
##  addBefore()
##  removeAllChildren()
##  setChildren()
##  repeat()
##  daoSlot()
##  select()
##  call()
##  callOn
##  callIf
##  callIfElse
##  forEach()
##  write()
##  Tags
##   attributes
##   registerElement
##   elementForName
##  View
##   fromProperty()
##  Controller
##  Views
##   ActionView
##  StackView
##  More
## FOAM By Example
##  Test Class
Define a new class with foam.CLASS
--
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


##  Test describe
Use class.describe() to learn about the class
--
Test.describe();


##  Test create
Create an instance of Test
--
var o = Test.create();
console.log("Class: ", o);
console.log('a: ' + o.a + ', b: ' + o.b);


##  Test create with values
Create an instance with a map argument to initialize properties
--
var o = Test.create({ a: 3, b: 'hello' });
console.log("Class: ", o);
console.log('a: ' + o.a + ', b: ' + o.b);


##  Class reference
Objects have a reference to their class in .cls_
--
console.log("Class object:", o.cls_);


##  Test isInstance
Test Class membership with Class.isInstance()
--
console.log('Test.isInstance(o)?', Test.isInstance(o));
console.log('Test.isInstance("foo")?', Test.isInstance("Test"));


##  Test Methods
Call Methods on the Test instance
--
console.log("Methods return: ", o.f1(), o.f2());


##  Update Properties
Properties accept value changes as normal
--
o.a++;
o.b = 'bye';
console.log('New values: a: ' + o.a + ', b: ' + o.b);


##  Test copyFrom
Multiple properties can be updated at once using copyFrom()
--
o.copyFrom({a: 42, b: 'rosebud'});
console.log('New values: a: ' + o.a + ', b: ' + o.b);


##  Test toString
Call toString on an object
--
console.log("toString:", o.toString());


##  Describe instance
Call describe() on an object to see its Property values
--
o.describe();


##  Properties and Methods are types of Axioms
Get an array of all Axioms belonging to a Class by calling getAxioms
--
Test.getAxioms().forEach(function(a) {
  console.log(a.cls_ && a.cls_.name, a.name);
});


##  Test getAxiomByName
Find an Axiom for a class using getAxiomByName
--
var a = Test.getAxiomByName('a');
console.log(a.cls_.name, a.name);


##  Test getAxiomsByClass
Find all Axioms of a particular class using getAxiomsByClass
--
Test.getAxiomsByClass(foam.core.Method).forEach(function(a) {
  console.log(a.cls_ && a.cls_.name, a.name);
});


##  Test Property constants
Properties are defined on the class as constants
--
console.log("Method CODE property constant:", foam.core.Method.CODE);
foam.core.Method.CODE.describe();


##  Property mapping
Property constants contain map functions
--
// foam.core.Method.NAME.f(obj) returns obj.name
console.log("Method names in Test:",
  Test
    .getAxiomsByClass(foam.core.Method)
    .map(foam.core.Method.NAME.f)
    .join(', ')
);


##  Property comparators
Property constants contain comparators
--
// foam.core.Method.NAME.compare is a compare function
// that properly compares values of NAME.
console.log("Method names in Test, sorted:",
  Test
    .getAxiomsByClass(foam.core.Method)
    .sort(foam.core.Method.NAME.compare)
    .map(foam.core.Method.NAME.f)
    .join(', ')
);


##  Test init
If a Class defineds an init() method, it's called when an object is created.
--
foam.CLASS({
  name: 'InitTest',
  properties: [ 'a' ],
  methods: [ function init() { this.a = 'just born!'; } ]
});
var o = InitTest.create();
console.log("Initialized value:", o.a);


##  Create default values
Default Values can be defined for Properties
--
foam.CLASS({
  name: 'DefaultValueTest',
  properties: [
    { name: 'a', value: 42 },
    { name: 'b', value: 'foo' },
    { name: 'c' }
  ]
});
var o = DefaultValueTest.create();
console.log("Values:", o.a, o.b, o.c);


##  Test hasOwnProperty
FObject.hasOwnProperty() tells you if a Property has been set
--
console.log("Before setting:", o.hasOwnProperty('a'), o.hasOwnProperty('b'), o.hasOwnProperty('c'));
o.a = 99;
o.c = 'test';
console.log("After setting a, c:", o.hasOwnProperty('a'), o.hasOwnProperty('b'), o.hasOwnProperty('c'));


##  Test clearProperty
FObject.clearProperty() reverts a value back to its value
--
console.log("Before clearing:", o.hasOwnProperty('a'), o.a);
o.clearProperty('a');
console.log("After clearing:", o.hasOwnProperty('a'), o.a);


##  Create factory test
Properties can have factory methods which create their initial value when they are first accessed.
--
var factoryCount = 0;
foam.CLASS({
  name: 'FactoryTest',
  properties: [
    {
      name: 'a',
      factory: function() { factoryCount++; return 42; }
    }
  ]
});
var o = FactoryTest.create();


##  Test factory running
Factories run once when the property is first accessed
--
console.log("Before:    factory run count:", factoryCount);
console.log("Value:", o.a, " factory run count:", factoryCount);
// Factory not called value accessed second time:
console.log("Again:", o.a, " factory run count:", factoryCount);


##  Test factory not run
Factories do not run if the value is set before being accessed
--
// Value supplied in create()
o = FactoryTest.create({a: 42});
console.log("Value:", o.a, " factory run count:", factoryCount);

// Value set before first access
o = FactoryTest.create();
o.a = 99;
console.log("Value:", o.a, " factory run count:", factoryCount);


##  FactoryTest
Factory is called again if clearProperty() called
--
var o = FactoryTest.create();
console.log("Run factory: ", o.a);
console.log(" factory run count:", factoryCount);
o.clearProperty('a');
console.log("Again:       ", o.a);
console.log(" factory run count:", factoryCount);


##  Property Getters and Setters
Properties can define their own getter and setter functions
--
foam.CLASS({
  name: 'GetterSetter',
  properties: [
    'radius',
    {
      name: 'diameter',
      getter: function() {
        return this.radius * 2;
      },
      setter: function(diameter) {
        this.radius = diameter / 2;
      }
    }
  ]
});
var o = GetterSetter.create();

o.diameter = 10;
console.log("r:", o.radius, "d:", o.diameter);

o.radius = 10;
console.log("r:", o.radius, "d:", o.diameter);



##  Property Adapt
The adapt function is called on a property value update
--
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
        console.log('Adapt old:', oldValue, "to new:", newValue);
        // adapt to a boolean
        return !! newValue;
      }
    }
  ]
});
// adapt called once from the flag:true initializer here
var o = AdaptTest.create({ flag: true });

// adapt called again to adapt null
o.flag = null;
console.log("Adapted value:", o.flag);


##  Property preSet
The preSet function is called on a property update, after adapt
--
// Properties can specify a 'preSet' function which is called whenever
// the properties' value is updated, just after 'adapt', if present.

// Both the previous value of the property and the proposed new value are
// passed to preSet.  PreSet returns the desired new value, which may be different
// from the newValue it's provided.
foam.CLASS({
  name: 'PreSetTest',
  properties: [
    {
      name: 'a',
      preSet: function(oldValue, newValue) {
        console.log('preSet p1');
        return newValue + "y";
      }
    }
  ]
});
var o = PreSetTest.create({ a: 'Smith' });
console.log(o.a);

o.a = 'Jones';
console.log(o.a);


##  Property postSet
The postSet function is called after a property update
--
// Properties can specify a 'postSet' function which is called after
// the properties' value is updated.  PostSet has no return value and
// cannot stop the newValue from taking effect, since postSet it is
// called after the value has been set.
var lastPostSetValue;
foam.CLASS({
  name: 'PostSetTest',
  properties: [
    {
      name: 'a',
      postSet: function(oldValue, newValue) {
        console.log('postSet old:', oldValue, "new:", newValue);
        // this.a will match the newValue, since the set is already
        // complete
        lastPostSetValue = this.a;
      }
    }
  ]
});
var o = PostSetTest.create({ a: 'Smith' });
o.a = 'Jones';
o.a = 'Green';


##  Property adapt pre post
Properties can define adapt, preSet, and postSet all at once
--
var lastPostSetValue;
foam.CLASS({
  name: 'AdaptPrePostTest',
  properties: [
    {
      name: 'a',
      adapt: function(oldValue, newValue) {
        console.log('adapt old:', oldValue, 'new:', newValue);
        return newValue + 1;
      },
      preSet: function(oldValue, newValue) {
        console.log('preSet old:', oldValue, 'new:', newValue);
        return newValue + 2;
      },
      postSet: function(oldValue, newValue) {
        console.log('postSet old:', oldValue, 'new:', newValue);
        lastPostSetValue = this.a;
      }
    }
  ]
});
var o = AdaptPrePostTest.create();
o.a = 1;
o.a = 10;


##  Create constant test
Classes can define Constants
--
foam.CLASS({
  name: 'ConstantTest',
  constants: {
    MEANING_OF_LIFE: 42,
    FAVOURITE_COLOR: 'green'
  }
});
var o = ConstantTest.create();
console.log("Constant values:", o.MEANING_OF_LIFE, o.FAVOURITE_COLOR);


##  Constants Class access
Constants can also be accessed from the Class
--
console.log("ConstantTest constants:", ConstantTest.MEANING_OF_LIFE, ConstantTest.FAVOURITE_COLOR);
console.log("o.cls_ constants:", o.cls_.MEANING_OF_LIFE, o.cls_.FAVOURITE_COLOR);


##  Constants are constant
Constants are constant, and cannot be assigned
--
o.MEANING_OF_LIFE = 43;
console.log("Constant after setting to 43:", o.MEANING_OF_LIFE);


##  Person Class
A basic Person class
--
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


##  Create Person and Employee
Classes can be subclassed with extends
--
// Methods in subclasses can override methods from ancestor classes, as is
// done below with toString().  Employee.toString() calls its parent classes
// toString() method by calling 'this.SUPER()'.
foam.CLASS({
  name: 'Employee',
  extends: 'Person',
  properties: [ 'salary' ],
  methods: [
    function toString() { return this.SUPER() + ' ' + this.salary; }
  ]
});

var p = Person.create({name: 'John', sex: 'M'});
console.log("Person:", p.toString());

var e = Employee.create({name: 'Jane', sex: 'F', salary: 50000});
console.log("Employee:", e.toString());


##  Test SubClass
Test if one class is a sub-class of another
--
console.log("Is Employee a subclass of Person?", Person.isSubClass(Employee));
console.log("Is Person a subclass of Employee?", Employee.isSubClass(Person));


##  Test SubClass self
A Class is considered a sub-class of itself
--
console.log("Is Person a subclass of Person?", Person.isSubClass(Person));


##  Test FObject SubClass
FObject is the root class of all other classes
--
console.log("Is Employee an FObject?", foam.core.FObject.isSubClass(Employee));
console.log("Is Person an FObject?", foam.core.FObject.isSubClass(Person));


##  Test isSubClass and package
isSubClass() isn't confused by classes with the same name in different packages
--
foam.CLASS({
  package: 'com.acme.package',
  name: 'Person'
});
// The two Person classes are independent of each other
console.log("Is Person a packaged-Person?", com.acme.package.Person.isSubClass(Person));
console.log("Is packaged-Person a Person?", Person.isSubClass(com.acme.package.Person));


##  Test isSubClass and interfaces
isSubClass() works for interfaces
--
foam.CLASS({
  package: 'test',
  name: 'ThingI',
  methods: [ function foo() { console.log('Called ThingI.foo()'); } ]
});
foam.CLASS({
  package: 'test',
  name: 'C1',
  implements: [ 'test.ThingI' ]
});
console.log("Is C1 a ThingI?", test.ThingI.isSubClass(test.C1));


##  Test isSubClass sub interfaces
isSubClass() works for sub-interfaces
--
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

console.log("Is C2 a ThingI?", test.ThingI.isSubClass(test.C2));
console.log("Is C2 a Thing2I?", test.Thing2I.isSubClass(test.C2));
console.log("Is C2 a Thing3I?", test.Thing3I.isSubClass(test.C2));


##  Test isInstance sub interfaces
isInstance() works for sub-interfaces
--
console.log("Is o a ThingI?", test.ThingI.isInstance(o));
console.log("Is o a Thing2I?", test.Thing2I.isInstance(o));
console.log("Is o a Thing3I?", test.Thing3I.isInstance(o));
console.log("Is o a C2?", test.C2.isInstance(o));


##  Package imports exports demo
Package and imports/exports demo
--
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

##  Package imports exports demo
Package and imports/exports demo
--
foam.CLASS({
  name: 'A',
  methods: [ function toString() { return 'A'; } ]
});
foam.CLASS({
  name: 'B',
  methods: [ function toString() { return 'B'; } ]
});
foam.CLASS({
  name: 'C',
  requires: ['A'],
  methods: [ function toString() { return this.A.create().toString(); } ]
});

var c = C.create();
print(c.toString());

c.A = B;
print(c.toString());

c = C.create({A: B});
print(c.toString());


##  Class Refinement
Refinement upgrades the existing class rather than create a new sub-class
--
// In addition to being extended, a Class can also be refined.
// Refinement upgrades the existing class rather than create a
// new sub-class. In the following example we add 'salary' to
// the person class, rather than creating a new Employee sub-class.
foam.CLASS({
  refines: 'Person',
  properties: [ { class: 'Float', name: 'salary', value: 0 } ],
  methods: [
    function toString() { return this.name + ' ' + this.sex + ' ' + this.salary; }
  ]
});
var n = Person.create({name: 'Bob', sex: 'M', salary: 40000});
console.log("New person after refinement:", n.toString());
// The already created person, John, now has a salary too!
console.log("Old person after refinement:", p.toString());


##  Refine a Property
Properties in classes can be changed in a refinement
--
console.log("Old type of Person.salary:", Person.SALARY.cls_.name);

// Change the salary property type, add a default value
foam.CLASS({
  refines: 'Person',
  properties: [ { name: 'salary', value: 30000 } ]
});

console.log("New type of Person.salary:", Person.SALARY.cls_.name);

var o = Person.create({name:'John'});
console.log("Now with default value:", o.salary);
console.log("And original person gets the default too:", p.salary);


##  Cannot Refine a Property Class
Refining Properties is currently unsupported and unlikely to be supported.
--
// Refining a type of Property after classes have already been created using
// the old version will not propagate the changes to those existing classes.
foam.CLASS({ name: 'Salary', extends: 'Float' });
foam.CLASS({ name: 'Emp', properties: [ { class: 'Salary', name: 'salary' } ] });

// Since Classes are not constructed until used, we create an instance to force
// Emp to be loaded (otherwise the refinement will appear to work):
console.log("Emp.salary before:", Emp.create().salary);
foam.CLASS({ refines: 'Salary', properties: [ { name: 'value', value: 30000 } ]});
console.log("Emp.salary refined:", Emp.create().salary);


##  Refine Property
Refine foam.core.Property Class
--
// Property has special support for refinement or existing Property instances
foam.CLASS({ name: 'Emp', properties: [ { class: 'Float', name: 'salary' } ] });
Emp.create();
foam.CLASS({ refines: 'Float', properties: [ [ 'javaClass', 'Float' ] ]});
console.log(Emp.SALARY.javaClass);


##  Cannot Refine a SuperProperty Class
Currently unsupported and unlikely to be supported
--
foam.CLASS({ name: 'SuperClass', properties: [ 'p1' ]});
foam.CLASS({ name: 'SubClass', extends: 'SuperClass', properties: [ 'p1' ]});
console.log('Before: super: ', SuperClass.create().p1, 'sub: ', SubClass.create().p1);

foam.CLASS({ refines: 'SuperClass', properties: [ { name: 'p1', value: 42 } ]});
console.log('Refined: super: ', SuperClass.create().p1, 'sub: ', SubClass.create().p1);


##  Cannot Refine a DoubleSuperProperty Class
Currently unsupported and unlikely to be supported. Two inheritance levels.
--
foam.CLASS({ name: 'SuperClass', properties: [ 'p1' ]});
foam.CLASS({ name: 'MidClass', extends: 'SuperClass' });
foam.CLASS({ name: 'SubClass', extends: 'MidClass', properties: [ 'p1' ]});
console.log('Before: super: ', SuperClass.create().p1, 'mid: ', MidClass.create().p1, 'sub: ', SubClass.create().p1);

// MidClass will see the refinement since it does not redefine the p1 property, so it
// uses SuperClass' directly. SubClass keeps its own definition, and doesn't see the changes
// to SuperClass.p1
foam.CLASS({ refines: 'SuperClass', properties: [ { name: 'p1', value: 42 } ]});
console.log('Refined: super: ', SuperClass.create().p1, 'mid: ', MidClass.create().p1, 'sub: ', SubClass.create().p1);


##  Create Listeners
Listeners are pre-bound Methods, suitable for use as callbacks (DOM, or otherwise).
--
foam.CLASS({
  name: 'ListenerTest',
  properties: [ 'name' ],
  methods: [ function m1() {
    console.log('m1', this.name);
    return 'M1' + this.name;
  } ],
  listeners: [ function l1() {
    console.log('l1', this.name);
    return 'L1' + this.name; // listener return value is ignored by most callers
  } ]
});
var o = ListenerTest.create({ name: 'Steve' });


##  Test Listeners as methods
Listeners are pre-bound Methods, suitable for use as callbacks (DOM, or otherwise).
--
// When called as methods, the same as Methods.
o.m1();
o.l1();


##  Test Listener binding
Listeners remember their self, binding "this" automatically
--
// When called as functions, the method forgets its 'self' and doesn't work,
// but the listener works.
var m = o.m1;
var l = o.l1;
m()
l();


##  Test Merged and Framed validation
It's an error to make a listener both isMerged and isFramed
--
foam.CLASS({
  name: 'MergedAndFramedTest',
  listeners: [
    {
      name: 'l',
      isMerged: true,
      isFramed: true,
      code: function() { console.log('listener'); }
    }
  ]
});
MergedAndFramedTest.create();


##  Test isMerged
isMerged will merge multiple events
--
c() {
      // TODO: for all async, pass things for postTestCode in promise resolve
      // If a listener has isMerged: true, it will merge multiple
      // events received withing 'mergeDelay' milliseconds into
      // a single event. 'mergeDelay' is optional and defaults to
      // 16ms.
      var mergedCalls = 0;

      foam.CLASS({
        name: 'MergedListenerTest',
        listeners: [
          {
            name: 'notMerged',
            isMerged: false, // the default
            code: function() {
              console.log('not merged listener');
            }
          },
          {
            name: 'merged',
            isMerged: true,
            mergeDelay: 1, // 1ms
            code: function() {
              console.log('merged listener ' + mergedCalls);
              mergedCalls += 1;
            }
          }
        ]
      });

      var o = MergedListenerTest.create();
      o.merged(); o.notMerged();
      o.merged(); o.notMerged();
      o.merged(); o.notMerged();
      o.merged(); o.notMerged();
      o.merged(); o.notMerged();
      o.merged(); o.notMerged();
      o.merged(); o.notMerged();

      // stop this test after one frame
      return new Promise(function(res) {
        setTimeout(res, 16);
      });


##  Framed Listener Test
isFramed will merge multiple events within an animation frame
--
c() {
      // If a listener has isFramed: true, it will merge multiple
      // events received withing one animation frame to a single
      // event delivered at the next animationFrame.
      var framedCalls = 0;
      foam.CLASS({
        name: 'FramedListenerTest',
        listeners: [
          {
            name: 'framed',
            isFramed: true,
            code: function() {
              console.log('framed listener ' + framedCalls);
              framedCalls += 1;
            }
          }
        ]
      });
      var o = FramedListenerTest.create();
      o.framed();
      o.framed();
      o.framed();
      o.framed();

      // delay for more than one frame to ensure the listener runs
      return new Promise(function(res) {
        setTimeout(res, 32);
      });


##  Listener delayed
Decorate a listener with delayed() to delay the execution without merging
--
c() {
      // You can decorate a listener with delayed() to delay the
      // execution of the listener. Unlike merged(), which also delays
      // results, delayed() does not merge results.
      var callOrder = '';
      var l1 = foam.__context__.delayed(function() {
        console.log('l1');
        callOrder += 'l1';
      }, 10);
      var l2 = foam.__context__.delayed(function() {
        console.log('l2');
        callOrder += 'l2';
      }, 5);
      l1();
      l2();
      l1();
      l2();

      // delay to ensure the listener runs
      return new Promise(function(res) {
        setTimeout(res, 16);
      });



##  Listener async
async(l) is the same as delayed(l, 0)
--
var callOrder = '';
var d1 = foam.__context__.async(function() {
  console.log('d1');
  callOrder += 'd1';
});
var d2 = function() {
  console.log('d2');
  callOrder += 'd2';
};
d1();
d2();
d1();
d2();

// delay to ensure the listener runs
return new Promise(function(res) {
  setTimeout(res, 16);
});


##  Listener SUPER
Listeners, like Methods, have SUPER support.
--
var alarms = '';
foam.CLASS({
  name: 'Alarm',
  listeners: [
    function alarm() { alarms += 'alarm!'; }
  ]
});
foam.CLASS({
  name: 'LongAlarm',
  extends: 'Alarm',
  listeners: [
    function alarm() {
      alarms += 'LongAlarm: ';
      this.SUPER(); this.SUPER(); this.SUPER();
    }
  ]
});
LongAlarm.create().alarm();
console.log(alarms);


##  Test Actions
Actions are methods which have extra information for GUIs
--
// Actions are methods which have extra information to make it easier
// to call them from GUIs. Extra information includes things like:
// a label, speech label, functions to determine if the action is currently
// available and enabled, user help text, etc.
var longCalls = 0;
foam.CLASS({
  name: 'ActionTest',
  properties: [ 'enabled', 'available' ],
  actions: [
    function shortForm() { console.log('short action!'); },
    {
      name: 'longForm',
      isAvailable: function() { return this.available; },
      isEnabled: function() { return this.enabled; },
      code: function() {
        console.log('long action!');
        longCalls += 1;
      }
    }
  ]
});
var o = ActionTest.create();
o.shortForm();

o.longForm(); // Won't be called because is not enabled or available yet
o.enabled = true;
o.longForm(); // Won't be called because is not available yet
o.available = true;
o.longForm(); // Finally able to be called


##  Interface inheritance
Interfaces copy Axioms from another class
--
// In addition to class-inheritance, FOAM also supports
// interfaces, which are a form of multiple-inheritance which
// copy Axioms from another model.
foam.CLASS({
  name: 'SampleI',
  properties: [ 't1', 't2', 't3' ],
  methods: [
    function tfoo() { console.log('tfoo'); },
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
var tt = ImplementsTest.create({p1:1, t1:2});
tt.tfoo(); // From SampleI
tt.foo();
console.log("Properties p1:", tt.p1, "t1:", tt.t1);


##  Interface multiple inheritance
Implements allows multiple inheritance, unlike extends
--
// Unlike regular inheritance with extends:, classes
// can implement: from multiple sources. However,
// implements only takes axioms from the class you reference,
// not anything it extends or implements.
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

console.log("ImplementsTest2 properties:",
  ImplementsTest2.getAxiomsByClass(foam.core.Property));


##  Property Inheritance
Properties in subclasses inherit from the parent's Properties
--
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
console.log(PropertyInheritA.SAME_NAME.cls_.id, PropertyInheritB.SAME_NAME.cls_.id);


##  Inner Classes
Inner classes are defined inside another class, not directly available in the global namespace.
--
// Classes can have inner-Classes.
var results = '';
foam.CLASS({
  name: 'InnerClassTest',
  classes: [
    { name: 'InnerClass1', properties: ['a', 'b'] },
    { name: 'InnerClass2', properties: ['x', 'y'] }
  ],
  methods: [
    function init() {
      // access from within the outer class
      var ic1 = this.InnerClass1.create({a:1, b:2});
      var ic2 = this.InnerClass2.create({x:5, y:10});
      results += ic1.a + ", " + ic1.b + ", " + ic2.x + ", " + ic2.y;
    }
  ]
});
InnerClassTest.create();
console.log(results);


##  Inner Class access
Inner classes are only accessible through their outer class
--
console.log("Access through outer:", InnerClassTest.InnerClass1.name);

// Inner-classes do not appear in the global namespace
console.log("Available globally?", !! global.InnerClass1);


##  Inner Enums
Similar to Inner-classes, there's also Inner-enums
--
var result = '';
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
      // access from within the outer class
      result += this.InnerEnum.OPEN + " / " + this.InnerEnum.CLOSED;
    }
  ]
});
InnerEnumTest.create();
console.log(result);


##  Inner Enum access
Inner-enums can only be accessed through the outer-class
--
console.log("Access through outer:", InnerEnumTest.InnerEnum.name);

// Inner-enums do not appear in the global namespace
console.log("Available globally?", !! global.InnerEnum);


##  Pub Sub
Objects can publish events and subscribe to other objects
--
foam.CLASS({
  name: 'PubSubTest'
});
var o = PubSubTest.create();


##  Subscribing
Objects can publish events and subscribe to other objects
--
// Objects support pub() for publishing events,
// and sub() for subscribing to published events.
var globalCalls = 0;
var alarmCalls = 0;
var globalResult = '';
// Install a listener that listens to all events
// Listeners are called with a subscription object and the given
//   arguments from pub().
o.sub(function() {
  console.log('  global listener: ', [].join.call(arguments, ' '));
  globalCalls += 1;
  globalResult += ' a' + arguments.length;
});
// This listener will only fire if the first argument matches 'alarm'
o.sub('alarm', function() {
  console.log('  alarm: ', [].join.call(arguments, ' '));
  alarmCalls += 1;
});
console.log("Pub alarm:");
o.pub('alarm', 'on');
console.log("Pub lifecycle:");
o.pub('lifecycle', 'loaded');


##  Publish arguments
Any number of arguments can be published
--
// Test publishing with many args
console.log("Pub many arguments:");
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
console.log(globalResult);


##  Topics
A Class can declare Topics that it publishes events for
--
foam.CLASS({
  name: 'TopicTest',
  topics: [ 'alarm' ]
});
var o = TopicTest.create();
var normalCalls = 0;
var topicCalls = 0;

o.sub('alarm', function(_, __, state) {
  console.log('alarm: ', state);
  normalCalls += 1;
});
// The next line uses the Topic and is slightly shorter than the equivalent above.
o.alarm.sub(function(_, __, state) {
  console.log('alarm (topic): ', state);
  topicCalls += 1;
});
o.alarm.pub('on');
o.pub('alarm', 'off');


##  propertyChange
Objects implicitly pub events on the propertyChange topic when property values change
--
foam.CLASS({
  name: 'PropertyChangeTest',
  properties: [ 'a', 'b' ]
});
o = PropertyChangeTest.create();
// propertyChange event listeners are called with:
//   sub  - the subscription object, which can be detach()ed to end
//            the subscription
//   p    - the string 'propertyChange'
//   name - the name of the changed property
//   dyn  - a dynamic access object to .get() the current value and
//            getPrev() the pre-change value

var anyChangeCalls = 0;
var propAChangeCalls = 0;
// Listen for all propertyChange events:
o.propertyChange.sub(function(sub, p, name, dyn) {
  console.log('propertyChange: ', p, name, dyn.getPrev(), dyn.get());
  anyChangeCalls += 1;
});

// Listen for only changes to the 'a' Property:
o.propertyChange.sub('a', function(sub, p, name, dyn) {
  console.log('propertyChange.a: ', p, name, dyn.getPrev(), dyn.get());
  propAChangeCalls += 1;
});

o.a = 42;
o.b = 'bar';
o.a++;


##  Unsubscribe from subscriber
1. Call .detach() on the Detachable that sub() returns
--

var calls = 0;
var l = function(sub, name) {
  console.log('Event:', name);
  calls += 1;
};

var sub = o.sub(l);
o.pub('fire');
sub.detach();
o.pub("fire again, but nobody's listenering");


##  Unsubscribe from listener
2. Detach the subscription, which is supplied to the listener
--
var calls = 0;
var once = function(sub, name) {
  console.log('Event:', name);
  calls += 1;
  // stop listening
  sub.detach();
};

o.sub(once);
o.pub('fire');
o.pub("fire again, but nobody's listening");


##  Unsubscribe with oneTime helper
3. If you only want to receive the first event, use foam.events.oneTime()
--
// If you only want to receive the first event, decorate your
// listener with foam.events.oneTime() and it will cancel the subscription
// when it receives the first event.
o.sub(foam.events.oneTime(function() {
  console.log.apply(console.log, arguments);
}));

o.pub('fire');
o.pub("fire again, but nobody's listenering");


##  Slot get
Slots are like Object-Oriented pointers
--
// A property's slot is accessed as 'name'$.
// get() is used to dereference the value of a slot
var p = Person.create({ name: 'Bob' });
var dyn = p.name$;
console.log("Person name:", dyn.get());


##  Slot set
set() is used to set a Slot's value
--
dyn.set('John'); // sets p.name implicitly
console.log("Name after set:", p.name, "get():", dyn.get());


##  Slot get with slot method
Calling obj.slot('name') is the same as obj.name$
--
var p = Person.create({name: 'Bob'});

var dyn = p.slot('name'); // same as p.name$
console.log("slot value:", dyn.get());

dyn.set('John');
console.log("after set:", dyn.get());


##  Slot nesting
Slots can be nested with dot() to bind to a sub-property of a property value
--
// Nested slots
foam.CLASS({ name: 'Holder', properties: [ 'data' ] });
var p1 = Person.create({name: 'John'});
var p2 = Person.create({name: 'Paul'});
var h = Holder.create({data: p1});
// Bind to the 'name' of whatever h.data will be, even if it changes
var s = h.data$.dot('name');

// Note that this listener is called when we swap p2 for p1, since
//  p2.name is not the same as p1.name.
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

s.set('George');
console.log("  After setting s, p2.name:", p2.name);

p2.name = 'Ringo';
console.log("  After setting p2.name, s:", s.get());


##  Subscription nesting
Subscribe using valueSub() of the slot, automatically resubscribed as the value changes
--
// Subscribe to the value of the slot data$, removing the
// subscription and resubscribing to the new value of data$
// if it changes.
foam.CLASS({ name: 'Holder', properties: [ 'data' ] });
var p1 = Person.create({name: 'John'});
var p2 = Person.create({name: 'Paul'});
var h = Holder.create({data: p1});
var changes = "";
h.data$.valueSub(function(e, topic, name, dyn) {
  console.log('sub change: ', e.src.name, topic, name);
  changes += topic + ':' + (dyn && dyn.get()) + ' ';
});

p1.name = 'Peter';
p2.name = 'Mary';
h.data = p2;
p1.name = 'James';
p2.name = 'Ringo';
p2.pub('test','event');


##  Data Binding two way
Assiging one slot to another binds their values
--
// Two-Way Data-Binding
// Slots can be assigned, causing two values to be
// bound to the same value.
var p1 = Person.create(), p2 = Person.create();

p1.name$ = p2.name$;
p1.name = 'John'; // also sets p2.name
console.log("Assigned first:", p1.name, p2.name);

p2.name = 'Steve'; // also sets p1.name
console.log("Assigned second: ", p1.name, p2.name);


##  Data Binding linkFrom
Another way to link two Slots is to call .linkFrom() on one of them
--
var p1 = Person.create({ name: 'p1' });
var p2 = Person.create({ name: 'p2' });
var d = p1.name$.linkFrom(p2.name$);
p1.name = 'John';
console.log("Assigned first:", p1.name, p2.name);


##  Data Binding linkFrom unbind
linkFrom/To() returns a detachable that unbinds the slots
--
// But this style of link can be broken by calling .detach()
// on the object return from .linkFrom/To().
d.detach();
p2.name = 'Steve';
console.log("No longer bound:", p1.name, p2.name);


##  Data Binding linkTo
linkTo() is the same as linkFrom(), except that the initial value is taken from 'this' instead of the other object
--
// linkTo() is the same as linkFrom(), except that the initial value
// is taken from 'this' instead of the other object.
var p1 = Person.create({ name:'p1' }), p2 = Person.create({ name:'p2' });
var d = p1.name$.linkTo(p2.name$);
console.log("After linkTo:", p1.name, p2.name);
var name2 = p2.name;

p1.name = 'John';
console.log("Assigned first:", p1.name, p2.name);


##  Data Binding relateTo
Two values can be linked through relateTo
--
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
        function f2c(f) {
          console.log('f2c', f); return 5/9 * ( f - 32 );
        },
        function c2f(c) {
          console.log('c2f', c); return 9/5 * c + 32;
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


##  Data Binding one way
The .follow() method binds in one direction only
--
// Calling .linkFrom()/.linkTo() creates a two-way data-binding, meaning a change in either
// value is reflected in the other.  But FOAM supports one-way data-binding as well.
// To do this, use the .follow() method.
var p1 = Person.create({ name:'p1' }), p2 = Person.create({ name:'p2' });
var d = p1.name$.follow(p2.name$);

p2.name = 'Ringo'; // Will update p1 and p2
p2.name = 'Paul'; // Will update p1 and p2
console.log('Assigned p2:', p1.name, p2.name);
p1.name = 'George'; // Will only update p1
console.log('Assigned p1:', p1.name, p2.name);
d.detach();


##  Data Binding one way initialization
Follow copies the initial value of the followed slot
--
p1 = Person.create();
p2 = Person.create({name:'John'});
console.log("Initial:", p1.name, p2.name);

p1.name$.follow(p2.name$);
console.log("After follow:", p1.name, p2.name);


##  Data Binding one way mapFrom
One-Way Data-Binding, with Map function (mapFrom)
--
var p1 = Person.create(), p2 = Person.create();
var d = p1.name$.mapFrom(p2.name$, function(n) {
  return n + "es";
});

p2.name = 'Ringo'; // Will update p1 and p2
console.log('Assigned second:', p1.name, p2.name);
p1.name = 'George'; // Will only update p1
console.log('Assigned first:', p1.name, p2.name);
d.detach();


##  Data Binding one way mapTo
One-Way Data-Binding, with Map function (mapTo)
--
// The reverse of mapFrom(), mapTo() takes the value of this,
// mapping it and assigning to the target.
var p1 = Person.create(), p2 = Person.create();
var d = p2.name$.mapTo(p1.name$, function(n) {
  return 'One' + n;
});

p2.name = 'Ringo'; // Will update p1 and p2
console.log("Assigned second:", p1.name, p2.name);
p1.name = 'George'; // Will only update p1
console.log("Assigned first:", p1.name, p2.name);
d.detach();


##  Slot isDefined
Slots also let you check if the value is defined by calling isDefined()
--
// Calling obj.name$.isDefined() is equivalent to obj.hasOwnProperty('name');
foam.CLASS({name: 'IsDefinedTest', properties: [ { name: 'a', value: 42 } ]});
var o = IsDefinedTest.create();
var dv = o.a$;
console.log("Default value only, isDefined?", dv.isDefined());
dv.set(99);
console.log("Set to 99, isDefined?", dv.isDefined());


##  Slot clear
You can reset a Slot to its default value by calling .clear()
--
// Calling obj.name$.clear() is equivalent to obj.clearProperty('name');
dv.clear();
console.log("After clearing:", dv.get(), dv.isDefined());


##  ConstantSlot
ConstantSlot creates an immutable slot
--
var s = foam.core.ConstantSlot.create({ value: 42 });
console.log("Intial value:", s.get());
s.value = 66;
s.set(66);
console.log("After set to 66:", s.get());


##  SimpleSlot
SimpleSlot creates a mutable slot.
--
var s = foam.core.SimpleSlot.create({ value: 42 });
console.log("Intial value:", s.get());
s.value = 66;
s.set(66);
console.log("After set to 66:", s.get());


##  PromiseSlot
PromiseSlot provides a declarative way of creating a slot that should contain the value of a promise when it resolves.
--
var promise = new Promise(function(resolve, reject) {
  window.setTimeout(function() {
    resolve(66);
  }, 3000);
}).then((value) => {
  console.log('Promise resolved!', new Date());
  console.log('Slot value:', value);
});
console.log('Promise created.', new Date());
var s = foam.core.PromiseSlot.create({
  value: 42,
  promise: promise
});
console.log("Intial value of the slot:", s.get());
window.setTimeout(() => {
  console.log('Value 1 second later, at ' + new Date() + ':', s.get());
}, 1000);
return promise;


##  ArraySlot
ArraySlot provides a way to group several slots together so that when any of them update we can invalidate.
--
var promise = new Promise(function(resolve, reject) {
  window.setTimeout(() => resolve('bar'), 3000);
});
var s1 = foam.core.SimpleSlot.create({ value: 42 });
var s2 = foam.core.PromiseSlot.create({ value: 'foo', promise: promise });
var arraySlot = foam.core.ArraySlot.create({ slots: [s1, s2] });
console.log('Initial value:', arraySlot.get());
arraySlot.sub((detachable, eventName, propName, slot) => {
  console.log('Value updated to:', arraySlot.get());
});
s1.set(66);
return promise;


##  ProxySlot
ProxySlot provides a way to flatten/join a slot of a slot into what appears to be a slot of the inner slot's value. It lets you abstract away the inner slot.Using ProxySlot in this way is similar to how Promises that return Promises are automatically flattened/joined for you. However, in the case of slots, you need to explicitly use ProxySlot if you want this joining behaviour, otherwise you'll simply have a slot whose value is a slot. In this regard, slots are more flexible than Promises because it is up to the programmer to decide whether they want flattening/joining behaviour or not.
--
var s1 = foam.core.SimpleSlot.create({ value: 'fname' });
foam.CLASS({ name: 'Person', properties: ['fname', 'lname'] });
var p = Person.create({ fname: 'John', lname: 'Smith' });
var slotOfSlot = s1.map((propName) => {
  return p.slot(propName).map((propValue) => propName + ' = ' + propValue);
});
var proxySlot = foam.core.ProxySlot.create({ delegate$: slotOfSlot });
console.log('Value:', proxySlot.get());
s1.set('lname');
console.log('Value:', proxySlot.get());


##  Expression Slots
ExpressionSlot creates a Slot from a list of Slots and a function to combine them
--
foam.CLASS({ name: 'Person', properties: ['fname', 'lname'] });
var p = Person.create({ fname: 'John', lname: 'Smith' });
// When fname or lname changes, the new values are fed into the function
// to produce a new value for ExpressionSlot e
var e = foam.core.ExpressionSlot.create({
  args: [ p.fname$, p.lname$ ],
  code: function(f, l) { return f + ' ' + l; }
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


##  Expression Slot with object
ExpressionSlot can use an object to supply the source slots
--
foam.CLASS({ name: 'Person', properties: [ 'f', 'l' ] });
var p = Person.create({ f:'John', l: 'Smith' });
// function arguments 'f' and 'l' are treated as property names on obj
var e = foam.core.ExpressionSlot.create({
  obj: p,
  code: function(f, l) { return f + ' ' + l; }
});
console.log("Initial e:", e.get());
e.sub(function() {
  console.log("e changed:", e.get());
});
p.f = 'Steve';
p.l = 'Jones';
console.log("Final e:", e.get());


##  Expression Slot unbinding
Detach the ExpressionSlot to prevent further updates
--
calls = 0;
e.detach();
console.log("e detached, setting f and l again...");
p.f = 'Bob';
p.l = 'Roberts';
console.log("Updates since detach:", calls);


##  Property Expression Class
The same functionality of ExpressionSlot is built into Properties
--
// Properties have the 'expression' feature
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
var p = Person.create({ fname: 'John', lname: 'Smith' });


##  Property Expressions
Expression properties are invalidated whenever of their listed source values change
--
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


##  Property Expression setting
Expression properties can also be explicitly set, disabling the dynamic expression
--
console.log(p.name, p.hasOwnProperty('name'));
p.name = 'Kevin Greer';
console.log(p.name, p.hasOwnProperty('name'));
p.fname = 'Sebastian';
console.log(p.fname, p.lname, ':', p.name);


##  Property Expression
Clearing a set expression property reverts it to expression mode
--
p.name = "Joe"
console.log("Set directly:", p.name, "hasOwnProperty(name)?", p.hasOwnProperty('name'));
p.clearProperty('name');
console.log("After clearing:", p.name, "hasOwnProperty(name)?", p.hasOwnProperty('name'));


##  Detachables
Detachables or functions can be registered to be called when an object is detached.
--
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
o.detach();


##  Detachables idempotent
It doesn't hurt to try and detach an object more than once
--
var o = foam.core.FObject.create();
o.detach();
o.detach();


##  Detachables unsubscribe

--
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
source.sub('ping', sink.l);
source.pub('ping');
source.pub('pong'); // There is no subscriber to the topic 'pong'
source.pub('ping');

// Detaching object and unsubscribing all subscribers
source.detach();
source.pub('ping');


##  Model validation extends refines
Extends and refines are mutually-exclusive
--
foam.CLASS({
  name: 'EandRTest',
  extends: 'FObject',
  refines: 'Model'
});
EandRTest.model_.validate();


##  Model validation property name exists
Properties must have names
--
foam.CLASS({
  name: 'ValidationTest',
  properties: [
    { name: '' }
  ]
});
ValidationTest.model_.validate();


##  Action validation names
Actions must have a name
--
foam.CLASS({
  name: 'ActionNameValidation',
  actions: [
    { name: '', code: function() {} }
  ]
});
ActionNameValidation.model_.validate();


##  Action validation code
Actions must have code
--
foam.CLASS({
  name: 'ActionCodeValidation',
  actions: [
    { name: 'test' }
  ]
});
ActionCodeValidation.model_.validate();


##  Model validation property slot name
Properties names must not end with $
--
foam.CLASS({
  name: 'DollarValidationTest',
  properties: [
    { name: 'name$' }
  ]
});
DollarValidationTest.model_.validate();


##  Model validation property constants
Property constants must not conflict
--
foam.CLASS({
  name: 'ConstantConflictTest',
  properties: [ 'firstName', 'FirstName' ]
});
ConstantConflictTest.model_.validate();


##  Model validation property same name
Properties must not have the same name
--
foam.CLASS({
  name: 'AxiomConflict1',
  properties: [ 'sameName', 'sameName' ]
});
AxiomConflict1.model_.validate();


##  Model validation same method name
Methods must not have the same name
--
foam.CLASS({
  name: 'AxiomConflict2',
  methods: [ function sameName() {}, function sameName() {} ]
});
AxiomConflict2.model_.validate();


##  Axiom validation same name
Axioms must not have the same name
--
//
foam.CLASS({
  name: 'AxiomConflict3',
  properties: [ 'sameName' ],
  methods: [ function sameName() {} ]
});
AxiomConflict3.model_.validate();


##  Axiom validation sub property type
A Property cannot be changed to a non-Property
--
foam.CLASS({
  name: 'AxiomChangeSuper',
  properties: [ 'sameName' ] // property
});
foam.CLASS({
  name: 'AxiomChangeSub',
  extends: 'AxiomChangeSuper',
  methods: [ function sameName() {} ] // now it's a method? no!
});
AxiomChangeSub.model_.validate();


##  Axiom validation class change
Warn if an Axiom changes its class
--
foam.CLASS({
  name: 'AxiomChangeSuper2',
  methods: [ function sameName() {} ]
});
foam.CLASS({
  name: 'AxiomChangeSub2',
  extends: 'AxiomChangeSuper2',
  properties: [ 'sameName' ]
});
AxiomChangeSub2.model_.validate();


##  Property validation single accessor
Properties may only have one of factory, value, expression, or getter; one of setter or adapt+preset+postset
--
var setTo;
foam.CLASS({
  name: 'PropertyValidationTest',
  properties: [
    {
      name: 't1',
      setter: function() { setTo = 1; this.instance_.t1 = 1; },
      adapt: function(_,v) { return v + 1; },
      preSet: function(_,v) { return v + 1; },
      postSet: function(_,v) { setTo = v + 1; }
    },
    {
      name: 't2',
      getter: function() { return 42; },
      factory: function() { return 43; },
      expression: function() { return 44; },
      value: 45
    }
  ]
});
PropertyValidationTest.model_.validate();


##  Property required
Properties marked required must have values supplied to create()
--
// Required
foam.CLASS({
  name: 'ValidationTest',
  properties: [
    { name: 'test', required: true }
  ]
});

var o = ValidationTest.create({test: '42'});
o.validate();
console.log('-');
var o = ValidationTest.create();
o.validate();


##  Unknown Properties
Unknown Model and Property properties are detected
--
foam.CLASS({
  name: 'ValidationTest',
  unknown: 'foobar',
  properties: [
    { name: 'test', unknown: 'foobar' }
  ]
});
ValidationTest.model_.validate();


##  Context create sub context
Contexts can be explicitly created with foam.createSubContext()
--
// The second argument of createSubContext() is an optional name for the Context
var Y1 = foam.createSubContext({
  key: 'value',
  fn: function() {
    return 'here';
  }
}, 'SubContext');
console.log("Y1:", Y1.key, Y1.fn());


##  Context context sub context
Sub-Contexts can be created from other Contexts
--
var Y2 = Y1.createSubContext({ key: 'value2' });
console.log("Y2:", Y2.key, Y2.fn());


##  Context sub context describe
A Context's contents can be inspected with .describe()
--
Y1.describe();
Y2.describe();


##  Imports Test Class
Imports are pulled from the context when an instance is created
--
foam.CLASS({
  name: 'ImportsTest',
  imports: [ 'myLogger' ],
  methods: [ function foo() {
    this.myLogger('log foo from ImportTest');
  } ]
});


##  Import context values
Classes can import values from the Context so that they can be accessed from this
--
// First try the import with no 'myLogger' in its context
try {
  var o = ImportsTest.create(); // should fail here, on object creation
  console.log('test created');
  o.foo();
} catch(e) {
  console.log('Could not import "myLogger" since nobody provided it.');
}

var lastLogMsg = "";
// Provide a 'myLogger' on a context
var Y = foam.createSubContext({ myLogger: function(msg) {
  console.log('log:', msg);
  lastLogMsg = msg;
}});

Y.myLogger('test');
// Using 'requires' supplies the context automatically, but for this
// example we supply the context explicitly.
var o = ImportsTest.create(null, Y); // create with context Y
o.foo();


##  Imports optional
Optional imports, marked with a ?, don't warn if not found
--
foam.CLASS({
  name: 'OptionalImportsTest',
  imports: [ 'myLogger?' ],
  methods: [ function foo() {
    this.myLogger('log foo from ImportTest');
  } ]
});
try {
  var o = OptionalImportsTest.create();
  console.log('Test created ok');
  console.log('Trying to use missing import...');
  o.foo(); // should fail here, on import use
} catch(e) {
  console.log('As expected, could not import "myLogger" since nobody provided it.');
}


##  Export context values
Classes can export values for use by objects they create
--
var calls = 0;
foam.CLASS({
  name: 'ExportsTest',
  requires: [ 'ImportsTest' ],
  exports: [ 'myLogger' ],
  methods: [
    function init() {
      this.ImportsTest.create().foo();
    },
    function myLogger(msg) {
      // this function is exported, thus available to object we create
      // (like ImportsTest in our init)
      console.log('ExportsTest logger call:', msg);
      calls += 1;
    }
  ]
});
ExportsTest.create();


##  Packages
Classes can specify a package
--
foam.CLASS({
  package: 'com.acme',
  name: 'Test',
  methods: [ function foo() {
    console.log('Hello, I am foo() from com.acme.Test');
  } ]
});
com.acme.Test.create().foo();


##  Requires
Classes should requires: other Classes they need to use
--
// Classes can requires: other Classes to avoid having to reference them
// by their fully-qualified names. The creation context (and thus our
// exports) is also automatically provided.
foam.CLASS({
  name: 'RequiresTest',
  requires: ['com.acme.Test' ],
  methods: [ function foo() {
    this.Test.create().foo();
  } ]
});

console.log("When required:");
RequiresTest.create().foo();


##  Requires as
Requires can use as to alias required Classes
--
// Use 'as' to pick the name to use on 'this'. If a required
// class is named the same as one of your properties or methods,
// or two required classes have the same name, you may be forced
// to specify the name with 'as':
foam.CLASS({
  name: 'RequiresAliasTest',
  requires: ['com.acme.Test as NotTest' ],
  methods: [ function foo() {
    this.NotTest.create().foo();
  } ]
});

console.log("Required as NotTest:");
RequiresAliasTest.create().foo();


##  Primary Key
Classes can have a unique-id or primary-key
--
// By default, this is simply the field named 'id'.
foam.CLASS({
  name: 'Invoice',
  properties: [ 'id', 'desc', 'amount' ]
});
var o = Invoice.create({ id: 1, desc: 'Duct Cleaning', amount: 99.99 });
console.log(o.id);


##  Primary Key ids
Use the ids property to specify that the primary key be something other than id
--
// You can also use the 'ids' property to specify that
// the primary key be something other than 'id'.
// In this case, 'id' will become an psedo-property for
// accessing the real 'invoiceId' property.
foam.CLASS({
  name: 'Invoice2',
  ids: [ 'invoiceId' ],
  properties: [ 'invoiceId', 'desc', 'amount' ]
});
var o = Invoice2.create({ invoiceId: 23, desc: 'Duct Cleaning', amount: 99.99 });
console.log("Id:", o.id, "invoiceId:", o.invoiceId);


##  Primary Key multipart Class
Multi-part unique identifiers are also supported by setting ids
--
foam.CLASS({
  name: 'Invoice3',
  ids: [ 'customerId', 'invoiceId' ],
  properties: [ 'customerId', 'invoiceId', 'desc', 'amount' ]
});


##  Primary Key multipart
Multi-part unique identifiers are also supported by setting ids
--
var o = Invoice3.create({customerId: 1, invoiceId: 1, desc: 'Duct Cleaning', amount: 99.99});
console.log("initial           id:", o.id, "customerId:", o.customerId, "invoiceId:", o.invoiceId);
// setting id propagates the changes to the properties that make up the
// multipart id:
o.id = [2, 3];
console.log("after setting id, id:", o.id, "customerId:", o.customerId, "invoiceId:", o.invoiceId);


##  Primary Key multipart comparison
Multi-part ids are comparable
--
var results = '';
results += Invoice3.ID.compare(
  Invoice3.create({customerId: 1, invoiceId: 2}),
  Invoice3.create({customerId: 1, invoiceId: 1}));

results += ", " + Invoice3.ID.compare(
  Invoice3.create({customerId: 1, invoiceId: 1}),
  Invoice3.create({customerId: 1, invoiceId: 2}));

results += ", " + Invoice3.ID.compare(
  Invoice3.create({customerId: 1, invoiceId: 1}),
  Invoice3.create({customerId: 1, invoiceId: 1}));

results += ", " + Invoice3.ID.compare(
  Invoice3.create({customerId: 2, invoiceId: 1}),
  Invoice3.create({customerId: 1, invoiceId: 1}));

results += ", " + Invoice3.ID.compare(
  Invoice3.create({customerId: 1, invoiceId: 1}),
  Invoice3.create({customerId: 2, invoiceId: 1}));

console.log("Comparison results:", results);


##  Class Id
A Class' id is a combination of its package and name
--
console.log("Test class id:", com.acme.Test.id);


##  Custom Axioms
Specify arbitrary Axioms for a Class with axioms:
--
// In addition the the built-in Axiom types, you can also
// specify arbitrary Axioms with 'axioms:'.
// This example adds the 'Singleton' axiom to make a class
// implement the Singleton patter (ie. there can only be
// one instance)
foam.CLASS({
  name: 'AxiomTest',
  axioms: [ foam.pattern.Singleton.create() ],
  methods: [ function init() {
    console.log('Creating AxiomTest');
  } ]
});

AxiomTest.create();
AxiomTest.create();
console.log("Same instance?", AxiomTest.create() === AxiomTest.create());


##  Custom Axioms inherit
Gain the custom axioms of a Class you extend
--
//
foam.CLASS({
  name: 'AxiomSubTest',
  extends: 'AxiomTest',
  methods: [ function init() {
    console.log('Creating AxiomSubTest');
  } ]
});
AxiomSubTest.create();
AxiomSubTest.create();
console.log("sub is same instance?", AxiomSubTest.create() === AxiomSubTest.create());
console.log("sub same as super?", AxiomSubTest.create() === AxiomTest.create());


##  Multiton
Add the Multion axiom to implement the Multiton pattern
--
// Multitons create one shared instance per value, based on the given
// property.
foam.CLASS({
  name: 'Color',
  axioms: [ foam.pattern.Multiton.create({ property: 'color' }) ],
  properties: [ 'color' ],
  methods: [ function init() {
    console.log('Creating Color:', this.color);
  } ]
});

var red1 = Color.create({color: 'red'});
var red2 = Color.create({color: 'red'});
var blue = Color.create({color: 'blue'});

console.log('reds same?', red1 === red2);
console.log('red same as blue?', red1 === blue);


##  Object UID
All Objects have a unique identifier, accessible with the .$UID property
--
var a = {}, b = [], c = Person.create();
console.log(a.$UID, b.$UID, c.$UID);


##  Console log listener
foam.events.consoleLog() returns a convenient listener that logs
--
// foam.events.consoleLog
foam.CLASS({name: 'ConsoleLogTest'});
var o = ConsoleLogTest.create();
o.sub(foam.events.consoleLog());
o.pub();
o.pub('foo');
o.pub('foo','bar');


##  Function memoize1
foam.Function.memoize1() memoizes a one-argument function
--
// if called again with the same argument, the previously generated
// value will be returned rather than calling the function again.
var calls = 0;
var f = foam.Function.memoize1(function(x) {
  calls += 1;
  console.log('calculating ', x, "=>", x*x);
  return x*x;
});

console.log(f(2));
console.log(f(2));
console.log(f(4));
console.log("Total number of calls:", calls);


##  Function memoize1 one arg only
A call to memoize1'ed function with no arguments or too many arguments will trigger a failed assertion
--
f();
f(1, 2);


##  Function argsStr
foam.Function.argsStr() returns a function's arguments as a string
--
var f = function(a, b, fooBar) { };
var argsAsStr = foam.Function.argsStr(f);
console.log('Function args:', argsAsStr);


##  Function argNames
foam.Function.argNames() returns a function's arguments an an array
--
var f = function(a, b, fooBar) { };
var argsAsArray = foam.Function.argNames(f);
console.log('Function args array:', argsAsArray);


##  String constantize
foam.String.constantize converts strings from camelCase to CONSTANT_FORMAT
--
console.log('foo      =>', foam.String.constantize('foo'));
console.log('fooBar   =>', foam.String.constantize('fooBar'));
console.log('fooBar12 =>', foam.String.constantize('fooBar12'));


##  String capitalize
foam.String.capitalize capitalizes the first letter of a string
--
console.log(foam.String.capitalize('Abc def'));
console.log(foam.String.capitalize('abc def'));


##  String labelize
foam.String.labelize converts from camelCase to labels
--
console.log(foam.String.labelize('camelCase'));
console.log(foam.String.labelize('firstName'));
console.log(foam.String.labelize('someLongName'));


##  String multiline
foam.String.multiline lets you build multi-line strings from function comments
--
console.log(foam.String.multiline(function(){/*This is
a
multi-line
string*/}));


##  String pad
foam.String.pad() pads a string to the specified length
--
var s = foam.String.pad('foobar', 10);
console.log("padded  10:", '"' + s + '"', s.length);

// pad() is right justifying if given a negative number
var s = foam.String.pad('foobar', -10);
console.log("padded -10:", '"' + s + '"', s.length);


##  Template basics
Templates use a JSP syntax to insert properties and code
--
//
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
console.log(o.hello());


##  Template arguments
Templates can be declared to accept arguments
--
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
console.log(o.greet("Bob"));


##  Template nesting
Templates can be called from other templates. Include output as the first argument.
--
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
      // 'output' is an implicit argument you must pass when calling one template
      // from another.
      template: '<% this.greeter(output, stranger); %>, my name is <%= this.name %>'
    }
  ]
});

var o = TemplateTest.create({ name: 'Adam' });
console.log(o.greet("Alice"));


##  Template code
Template can use raw JS code for loops and control structures
--
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

console.log(TemplateTest.create({ name: 'Adam' }).complexTemplate());


##  Template mutliline
Multi-line templates can be defined as function comments
--
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
      console.log(MultiLineTemplateTest.create({ name: 'Adam' }).complexTemplate());


##  Create JSON Class
Conversion to and from JSON is supported
--
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


##  JSON parse
Use foam.json.parse(someJSONobject) to convert to an FObject
--
var o = foam.json.parse({
  class: 'JSONTest',
  name: 'John',
  age: 42,
  children: ['Peter', 'Paul']});
o.describe();


##  JSON output
Use foam.json.stringify(fobject) to serialize an FObject to a JSON string
--
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
console.log(foam.json.stringify(o));



##  JSON output modes
Different outputters support suppressing properties, transients, and other options
--
// Outputters have different defaults for formatting, which properties
// to output, etc. You can clone one and change these settings on the
// outputter to customize your JSON output.

console.log('\nConvert to a JSON object (instead of a String):');
console.log(foam.json.stringify(JSONTest.create(foam.json.objectify(o))));

console.log('\nAs a method on Objects:');
console.log(o.stringify());

console.log('\nPretty-printed output:');
console.log(foam.json.Pretty.stringify(o));

console.log('\nDisable class name output by cloning your own outputter:');
console.log(foam.json.Pretty.clone().copyFrom({ outputClassNames: false }).stringify(o));

console.log('\nStrict output:');
console.log(foam.json.Strict.stringify(o));

console.log('\nStrict-but-still-readable output:');
console.log(foam.json.PrettyStrict.stringify(o));

console.log('\nCompact output:');
console.log(foam.json.Compact.stringify(o));

console.log('\nShort-name (very compact) output:');
console.log(foam.json.Short.stringify(o));

console.log('\nNetwork (network-transient properties omitted) output:');
console.log(foam.json.Network.stringify(o));

console.log('\nStorage (storage-transient properties omitted) output:');
console.log(foam.json.Storage.stringify(o));


##  Graphics Support
CViews enable canvas rendering
--

foam.CLASS({
  name: 'GraphicsDemo',
  extends: 'foam.graphics.CView',
  requires: [
    'foam.graphics.Arc',
    'foam.graphics.Box',
    'foam.graphics.Circle',
    'foam.graphics.CView',
    'foam.graphics.Gradient'
  ],
  properties: [
    [ 'width', 500 ],
    [ 'height', 500 ],
    {
      name: 'children',
      factory: function() {
        var objects = [
          this.Arc.create({
            start: 0,
            end: 1.5*Math.PI,
            radius: 40
          }),
          this.Circle.create({
            color: this.Gradient.create({
              radial: true,
              x0: 0, y0: 0, r0: 10,
              x1: 0, y1: 0, r1: 100,
              colors: [
                [0, 'green'],
                [0.4, 'blue'],
                [0.6, 'red'],
                [1, 'white']
              ]
            }),
            border: '',
            radius: 100,
            x: 300,
            y: 300
          }),
          this.Box.create({
            color: this.Gradient.create({
              radial: false,
              x0: 0, y0: 0,
              x1: 100, y1: 100,
              colors: [
                [0, 'black'],
                [1, 'white']
              ]
            }),
            width: 100,
            height: 100,
            originX: 50,
            originY: 50,
            x: 100,
            y: 400,
            children: [
              this.Circle.create({
                color: 'red',
                x: 30,
                y: 30,
                radius: 10
              }),
              this.Circle.create({
                color: 'red',
                x: 70,
                y: 30,
                radius: 10
              }),
              this.Circle.create({
                color: 'red',
                x: 30,
                y: 70,
                radius: 10
              }),
              this.Circle.create({
                color: 'red',
                x: 70,
                y: 70,
                radius: 10
              }),
              this.Circle.create({
                color: 'red',
                x: 50,
                y: 50,
                radius: 10
              })
            ]
          })
        ];
        return objects;
      }
    },
    {
      name: 'counter',
      value: 0
    }
  ],
  listeners: [
    {
      name: 'step',
      isFramed: true,
      code: function() {
        this.counter += 0.01
        this.children[0].rotation += 0.1;
        this.children[0].x = 150 + 50 * Math.cos(this.counter);
        this.children[0].y = 150 + 50 * Math.sin(this.counter);
        this.children[1].skewX = Math.sin(this.counter);
        this.children[2].scaleX = 0.5 + 0.5 * Math.abs(Math.cos(this.counter));
        this.children[2].scaleY = 0.5 + 0.5 * Math.abs(Math.sin(this.counter));
        this.children[2].rotation += 0.01;
        this.step();
        this.invalidated.pub();
      }
    }
  ]
});
var g = GraphicsDemo.create();
g.write();
g.step();
## By Example
##  Test Class
Define a new class with foam.CLASS
--
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


##  Test describe
Use class.describe() to learn about the class
--
Test.describe();


##  Test create
Create an instance of Test
--
var o = Test.create();
console.log("Class: ", o);
console.log('a: ' + o.a + ', b: ' + o.b);


##  Test create with values
Create an instance with a map argument to initialize properties
--
var o = Test.create({ a: 3, b: 'hello' });
console.log("Class: ", o);
console.log('a: ' + o.a + ', b: ' + o.b);


##  Class reference
Objects have a reference to their class in .cls_
--
console.log("Class object:", o.cls_);


##  Test isInstance
Test Class membership with Class.isInstance()
--
console.log('Test.isInstance(o)?', Test.isInstance(o));
console.log('Test.isInstance("foo")?', Test.isInstance("Test"));


##  Test Methods
Call Methods on the Test instance
--
console.log("Methods return: ", o.f1(), o.f2());


##  Update Properties
Properties accept value changes as normal
--
o.a++;
o.b = 'bye';
console.log('New values: a: ' + o.a + ', b: ' + o.b);


##  Test copyFrom
Multiple properties can be updated at once using copyFrom()
--
o.copyFrom({a: 42, b: 'rosebud'});
console.log('New values: a: ' + o.a + ', b: ' + o.b);


##  Test toString
Call toString on an object
--
console.log("toString:", o.toString());


##  Describe instance
Call describe() on an object to see its Property values
--
o.describe();


##  Properties and Methods are types of Axioms
Get an array of all Axioms belonging to a Class by calling getAxioms
--
Test.getAxioms().forEach(function(a) {
  console.log(a.cls_ && a.cls_.name, a.name);
});


##  Test getAxiomByName
Find an Axiom for a class using getAxiomByName
--
var a = Test.getAxiomByName('a');
console.log(a.cls_.name, a.name);


##  Test getAxiomsByClass
Find all Axioms of a particular class using getAxiomsByClass
--
Test.getAxiomsByClass(foam.core.Method).forEach(function(a) {
  console.log(a.cls_ && a.cls_.name, a.name);
});


##  Test Property constants
Properties are defined on the class as constants
--
console.log("Method CODE property constant:", foam.core.Method.CODE);
foam.core.Method.CODE.describe();


##  Property mapping
Property constants contain map functions
--
// foam.core.Method.NAME.f(obj) returns obj.name
console.log("Method names in Test:",
  Test
    .getAxiomsByClass(foam.core.Method)
    .map(foam.core.Method.NAME.f)
    .join(', ')
);


##  Property comparators
Property constants contain comparators
--
// foam.core.Method.NAME.compare is a compare function
// that properly compares values of NAME.
console.log("Method names in Test, sorted:",
  Test
    .getAxiomsByClass(foam.core.Method)
    .sort(foam.core.Method.NAME.compare)
    .map(foam.core.Method.NAME.f)
    .join(', ')
);


##  Test init
If a Class defineds an init() method, it's called when an object is created.
--
foam.CLASS({
  name: 'InitTest',
  properties: [ 'a' ],
  methods: [ function init() { this.a = 'just born!'; } ]
});
var o = InitTest.create();
console.log("Initialized value:", o.a);


##  Create default values
Default Values can be defined for Properties
--
foam.CLASS({
  name: 'DefaultValueTest',
  properties: [
    { name: 'a', value: 42 },
    { name: 'b', value: 'foo' },
    { name: 'c' }
  ]
});
var o = DefaultValueTest.create();
console.log("Values:", o.a, o.b, o.c);


##  Test hasOwnProperty
FObject.hasOwnProperty() tells you if a Property has been set
--
console.log("Before setting:", o.hasOwnProperty('a'), o.hasOwnProperty('b'), o.hasOwnProperty('c'));
o.a = 99;
o.c = 'test';
console.log("After setting a, c:", o.hasOwnProperty('a'), o.hasOwnProperty('b'), o.hasOwnProperty('c'));


##  Test clearProperty
FObject.clearProperty() reverts a value back to its value
--
console.log("Before clearing:", o.hasOwnProperty('a'), o.a);
o.clearProperty('a');
console.log("After clearing:", o.hasOwnProperty('a'), o.a);


##  Create factory test
Properties can have factory methods which create their initial value when they are first accessed.
--
var factoryCount = 0;
foam.CLASS({
  name: 'FactoryTest',
  properties: [
    {
      name: 'a',
      factory: function() { factoryCount++; return 42; }
    }
  ]
});
var o = FactoryTest.create();


##  Test factory running
Factories run once when the property is first accessed
--
console.log("Before:    factory run count:", factoryCount);
console.log("Value:", o.a, " factory run count:", factoryCount);
// Factory not called value accessed second time:
console.log("Again:", o.a, " factory run count:", factoryCount);


##  Test factory not run
Factories do not run if the value is set before being accessed
--
// Value supplied in create()
o = FactoryTest.create({a: 42});
console.log("Value:", o.a, " factory run count:", factoryCount);

// Value set before first access
o = FactoryTest.create();
o.a = 99;
console.log("Value:", o.a, " factory run count:", factoryCount);


##  FactoryTest
Factory is called again if clearProperty() called
--
var o = FactoryTest.create();
console.log("Run factory: ", o.a);
console.log(" factory run count:", factoryCount);
o.clearProperty('a');
console.log("Again:       ", o.a);
console.log(" factory run count:", factoryCount);


##  Property Getters and Setters
Properties can define their own getter and setter functions
--
foam.CLASS({
  name: 'GetterSetter',
  properties: [
    'radius',
    {
      name: 'diameter',
      getter: function() {
        return this.radius * 2;
      },
      setter: function(diameter) {
        this.radius = diameter / 2;
      }
    }
  ]
});
var o = GetterSetter.create();

o.diameter = 10;
console.log("r:", o.radius, "d:", o.diameter);

o.radius = 10;
console.log("r:", o.radius, "d:", o.diameter);



##  Property Adapt
The adapt function is called on a property value update
--
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
        console.log('Adapt old:', oldValue, "to new:", newValue);
        // adapt to a boolean
        return !! newValue;
      }
    }
  ]
});
// adapt called once from the flag:true initializer here
var o = AdaptTest.create({ flag: true });

// adapt called again to adapt null
o.flag = null;
console.log("Adapted value:", o.flag);


##  Property preSet
The preSet function is called on a property update, after adapt
--
// Properties can specify a 'preSet' function which is called whenever
// the properties' value is updated, just after 'adapt', if present.

// Both the previous value of the property and the proposed new value are
// passed to preSet.  PreSet returns the desired new value, which may be different
// from the newValue it's provided.
foam.CLASS({
  name: 'PreSetTest',
  properties: [
    {
      name: 'a',
      preSet: function(oldValue, newValue) {
        console.log('preSet p1');
        return newValue + "y";
      }
    }
  ]
});
var o = PreSetTest.create({ a: 'Smith' });
console.log(o.a);

o.a = 'Jones';
console.log(o.a);


##  Property postSet
The postSet function is called after a property update
--
// Properties can specify a 'postSet' function which is called after
// the properties' value is updated.  PostSet has no return value and
// cannot stop the newValue from taking effect, since postSet it is
// called after the value has been set.
var lastPostSetValue;
foam.CLASS({
  name: 'PostSetTest',
  properties: [
    {
      name: 'a',
      postSet: function(oldValue, newValue) {
        console.log('postSet old:', oldValue, "new:", newValue);
        // this.a will match the newValue, since the set is already
        // complete
        lastPostSetValue = this.a;
      }
    }
  ]
});
var o = PostSetTest.create({ a: 'Smith' });
o.a = 'Jones';
o.a = 'Green';


##  Property adapt pre post
Properties can define adapt, preSet, and postSet all at once
--
var lastPostSetValue;
foam.CLASS({
  name: 'AdaptPrePostTest',
  properties: [
    {
      name: 'a',
      adapt: function(oldValue, newValue) {
        console.log('adapt old:', oldValue, 'new:', newValue);
        return newValue + 1;
      },
      preSet: function(oldValue, newValue) {
        console.log('preSet old:', oldValue, 'new:', newValue);
        return newValue + 2;
      },
      postSet: function(oldValue, newValue) {
        console.log('postSet old:', oldValue, 'new:', newValue);
        lastPostSetValue = this.a;
      }
    }
  ]
});
var o = AdaptPrePostTest.create();
o.a = 1;
o.a = 10;


##  Create constant test
Classes can define Constants
--
foam.CLASS({
  name: 'ConstantTest',
  constants: {
    MEANING_OF_LIFE: 42,
    FAVOURITE_COLOR: 'green'
  }
});
var o = ConstantTest.create();
console.log("Constant values:", o.MEANING_OF_LIFE, o.FAVOURITE_COLOR);


##  Constants Class access
Constants can also be accessed from the Class
--
console.log("ConstantTest constants:", ConstantTest.MEANING_OF_LIFE, ConstantTest.FAVOURITE_COLOR);
console.log("o.cls_ constants:", o.cls_.MEANING_OF_LIFE, o.cls_.FAVOURITE_COLOR);


##  Constants are constant
Constants are constant, and cannot be assigned
--
o.MEANING_OF_LIFE = 43;
console.log("Constant after setting to 43:", o.MEANING_OF_LIFE);


##  Person Class
A basic Person class
--
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


##  Create Person and Employee
Classes can be subclassed with extends
--
// Methods in subclasses can override methods from ancestor classes, as is
// done below with toString().  Employee.toString() calls its parent classes
// toString() method by calling 'this.SUPER()'.
foam.CLASS({
  name: 'Employee',
  extends: 'Person',
  properties: [ 'salary' ],
  methods: [
    function toString() { return this.SUPER() + ' ' + this.salary; }
  ]
});

var p = Person.create({name: 'John', sex: 'M'});
console.log("Person:", p.toString());

var e = Employee.create({name: 'Jane', sex: 'F', salary: 50000});
console.log("Employee:", e.toString());


##  Test SubClass
Test if one class is a sub-class of another
--
console.log("Is Employee a subclass of Person?", Person.isSubClass(Employee));
console.log("Is Person a subclass of Employee?", Employee.isSubClass(Person));


##  Test SubClass self
A Class is considered a sub-class of itself
--
console.log("Is Person a subclass of Person?", Person.isSubClass(Person));


##  Test FObject SubClass
FObject is the root class of all other classes
--
console.log("Is Employee an FObject?", foam.core.FObject.isSubClass(Employee));
console.log("Is Person an FObject?", foam.core.FObject.isSubClass(Person));


##  Test isSubClass and package
isSubClass() isn't confused by classes with the same name in different packages
--
foam.CLASS({
  package: 'com.acme.package',
  name: 'Person'
});
// The two Person classes are independent of each other
console.log("Is Person a packaged-Person?", com.acme.package.Person.isSubClass(Person));
console.log("Is packaged-Person a Person?", Person.isSubClass(com.acme.package.Person));


##  Test isSubClass and interfaces
isSubClass() works for interfaces
--
foam.CLASS({
  package: 'test',
  name: 'ThingI',
  methods: [ function foo() { console.log('Called ThingI.foo()'); } ]
});
foam.CLASS({
  package: 'test',
  name: 'C1',
  implements: [ 'test.ThingI' ]
});
console.log("Is C1 a ThingI?", test.ThingI.isSubClass(test.C1));


##  Test isSubClass sub interfaces
isSubClass() works for sub-interfaces
--
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

console.log("Is C2 a ThingI?", test.ThingI.isSubClass(test.C2));
console.log("Is C2 a Thing2I?", test.Thing2I.isSubClass(test.C2));
console.log("Is C2 a Thing3I?", test.Thing3I.isSubClass(test.C2));


##  Test isInstance sub interfaces
isInstance() works for sub-interfaces
--
console.log("Is o a ThingI?", test.ThingI.isInstance(o));
console.log("Is o a Thing2I?", test.Thing2I.isInstance(o));
console.log("Is o a Thing3I?", test.Thing3I.isInstance(o));
console.log("Is o a C2?", test.C2.isInstance(o));


##  Package imports exports demo
Package and imports/exports demo
--
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


##  Class Refinement
Refinement upgrades the existing class rather than create a new sub-class
--
// In addition to being extended, a Class can also be refined.
// Refinement upgrades the existing class rather than create a
// new sub-class. In the following example we add 'salary' to
// the person class, rather than creating a new Employee sub-class.
foam.CLASS({
  refines: 'Person',
  properties: [ { class: 'Float', name: 'salary', value: 0 } ],
  methods: [
    function toString() { return this.name + ' ' + this.sex + ' ' + this.salary; }
  ]
});
var n = Person.create({name: 'Bob', sex: 'M', salary: 40000});
console.log("New person after refinement:", n.toString());
// The already created person, John, now has a salary too!
console.log("Old person after refinement:", p.toString());


##  Refine a Property
Properties in classes can be changed in a refinement
--
console.log("Old type of Person.salary:", Person.SALARY.cls_.name);

// Change the salary property type, add a default value
foam.CLASS({
  refines: 'Person',
  properties: [ { name: 'salary', value: 30000 } ]
});

console.log("New type of Person.salary:", Person.SALARY.cls_.name);

var o = Person.create({name:'John'});
console.log("Now with default value:", o.salary);
console.log("And original person gets the default too:", p.salary);


##  Cannot Refine a Property Class
Refining Properties is currently unsupported and unlikely to be supported.
--
// Refining a type of Property after classes have already been created using
// the old version will not propagate the changes to those existing classes.
foam.CLASS({ name: 'Salary', extends: 'Float' });
foam.CLASS({ name: 'Emp', properties: [ { class: 'Salary', name: 'salary' } ] });

// Since Classes are not constructed until used, we create an instance to force
// Emp to be loaded (otherwise the refinement will appear to work):
console.log("Emp.salary before:", Emp.create().salary);
foam.CLASS({ refines: 'Salary', properties: [ { name: 'value', value: 30000 } ]});
console.log("Emp.salary refined:", Emp.create().salary);


##  Refine Property
Refine foam.core.Property Class
--
// Property has special support for refinement or existing Property instances
foam.CLASS({ name: 'Emp', properties: [ { class: 'Float', name: 'salary' } ] });
Emp.create();
foam.CLASS({ refines: 'Float', properties: [ [ 'javaClass', 'Float' ] ]});
console.log(Emp.SALARY.javaClass);


##  Cannot Refine a SuperProperty Class
Currently unsupported and unlikely to be supported
--
foam.CLASS({ name: 'SuperClass', properties: [ 'p1' ]});
foam.CLASS({ name: 'SubClass', extends: 'SuperClass', properties: [ 'p1' ]});
console.log('Before: super: ', SuperClass.create().p1, 'sub: ', SubClass.create().p1);

foam.CLASS({ refines: 'SuperClass', properties: [ { name: 'p1', value: 42 } ]});
console.log('Refined: super: ', SuperClass.create().p1, 'sub: ', SubClass.create().p1);


##  Cannot Refine a DoubleSuperProperty Class
Currently unsupported and unlikely to be supported. Two inheritance levels.
--
foam.CLASS({ name: 'SuperClass', properties: [ 'p1' ]});
foam.CLASS({ name: 'MidClass', extends: 'SuperClass' });
foam.CLASS({ name: 'SubClass', extends: 'MidClass', properties: [ 'p1' ]});
console.log('Before: super: ', SuperClass.create().p1, 'mid: ', MidClass.create().p1, 'sub: ', SubClass.create().p1);

// MidClass will see the refinement since it does not redefine the p1 property, so it
// uses SuperClass' directly. SubClass keeps its own definition, and doesn't see the changes
// to SuperClass.p1
foam.CLASS({ refines: 'SuperClass', properties: [ { name: 'p1', value: 42 } ]});
console.log('Refined: super: ', SuperClass.create().p1, 'mid: ', MidClass.create().p1, 'sub: ', SubClass.create().p1);


##  Create Listeners
Listeners are pre-bound Methods, suitable for use as callbacks (DOM, or otherwise).
--
foam.CLASS({
  name: 'ListenerTest',
  properties: [ 'name' ],
  methods: [ function m1() {
    console.log('m1', this.name);
    return 'M1' + this.name;
  } ],
  listeners: [ function l1() {
    console.log('l1', this.name);
    return 'L1' + this.name; // listener return value is ignored by most callers
  } ]
});
var o = ListenerTest.create({ name: 'Steve' });


##  Test Listeners as methods
Listeners are pre-bound Methods, suitable for use as callbacks (DOM, or otherwise).
--
// When called as methods, the same as Methods.
o.m1();
o.l1();


##  Test Listener binding
Listeners remember their self, binding "this" automatically
--
// When called as functions, the method forgets its 'self' and doesn't work,
// but the listener works.
var m = o.m1;
var l = o.l1;
m()
l();


##  Test Merged and Framed validation
It's an error to make a listener both isMerged and isFramed
--
foam.CLASS({
  name: 'MergedAndFramedTest',
  listeners: [
    {
      name: 'l',
      isMerged: true,
      isFramed: true,
      code: function() { console.log('listener'); }
    }
  ]
});
MergedAndFramedTest.create();


##  Test isMerged
isMerged will merge multiple events
--
c() {
      // TODO: for all async, pass things for postTestCode in promise resolve
      // If a listener has isMerged: true, it will merge multiple
      // events received withing 'mergeDelay' milliseconds into
      // a single event. 'mergeDelay' is optional and defaults to
      // 16ms.
      var mergedCalls = 0;

      foam.CLASS({
        name: 'MergedListenerTest',
        listeners: [
          {
            name: 'notMerged',
            isMerged: false, // the default
            code: function() {
              console.log('not merged listener');
            }
          },
          {
            name: 'merged',
            isMerged: true,
            mergeDelay: 1, // 1ms
            code: function() {
              console.log('merged listener ' + mergedCalls);
              mergedCalls += 1;
            }
          }
        ]
      });

      var o = MergedListenerTest.create();
      o.merged(); o.notMerged();
      o.merged(); o.notMerged();
      o.merged(); o.notMerged();
      o.merged(); o.notMerged();
      o.merged(); o.notMerged();
      o.merged(); o.notMerged();
      o.merged(); o.notMerged();

      // stop this test after one frame
      return new Promise(function(res) {
        setTimeout(res, 16);
      });


##  Framed Listener Test
isFramed will merge multiple events within an animation frame
--
c() {
      // If a listener has isFramed: true, it will merge multiple
      // events received withing one animation frame to a single
      // event delivered at the next animationFrame.
      var framedCalls = 0;
      foam.CLASS({
        name: 'FramedListenerTest',
        listeners: [
          {
            name: 'framed',
            isFramed: true,
            code: function() {
              console.log('framed listener ' + framedCalls);
              framedCalls += 1;
            }
          }
        ]
      });
      var o = FramedListenerTest.create();
      o.framed();
      o.framed();
      o.framed();
      o.framed();

      // delay for more than one frame to ensure the listener runs
      return new Promise(function(res) {
        setTimeout(res, 32);
      });


##  Listener delayed
Decorate a listener with delayed() to delay the execution without merging
--
c() {
      // You can decorate a listener with delayed() to delay the
      // execution of the listener. Unlike merged(), which also delays
      // results, delayed() does not merge results.
      var callOrder = '';
      var l1 = foam.__context__.delayed(function() {
        console.log('l1');
        callOrder += 'l1';
      }, 10);
      var l2 = foam.__context__.delayed(function() {
        console.log('l2');
        callOrder += 'l2';
      }, 5);
      l1();
      l2();
      l1();
      l2();

      // delay to ensure the listener runs
      return new Promise(function(res) {
        setTimeout(res, 16);
      });



##  Listener async
async(l) is the same as delayed(l, 0)
--
var callOrder = '';
var d1 = foam.__context__.async(function() {
  console.log('d1');
  callOrder += 'd1';
});
var d2 = function() {
  console.log('d2');
  callOrder += 'd2';
};
d1();
d2();
d1();
d2();

// delay to ensure the listener runs
return new Promise(function(res) {
  setTimeout(res, 16);
});


##  Listener SUPER
Listeners, like Methods, have SUPER support.
--
var alarms = '';
foam.CLASS({
  name: 'Alarm',
  listeners: [
    function alarm() { alarms += 'alarm!'; }
  ]
});
foam.CLASS({
  name: 'LongAlarm',
  extends: 'Alarm',
  listeners: [
    function alarm() {
      alarms += 'LongAlarm: ';
      this.SUPER(); this.SUPER(); this.SUPER();
    }
  ]
});
LongAlarm.create().alarm();
console.log(alarms);


##  Test Actions
Actions are methods which have extra information for GUIs
--
// Actions are methods which have extra information to make it easier
// to call them from GUIs. Extra information includes things like:
// a label, speech label, functions to determine if the action is currently
// available and enabled, user help text, etc.
var longCalls = 0;
foam.CLASS({
  name: 'ActionTest',
  properties: [ 'enabled', 'available' ],
  actions: [
    function shortForm() { console.log('short action!'); },
    {
      name: 'longForm',
      isAvailable: function() { return this.available; },
      isEnabled: function() { return this.enabled; },
      code: function() {
        console.log('long action!');
        longCalls += 1;
      }
    }
  ]
});
var o = ActionTest.create();
o.shortForm();

o.longForm(); // Won't be called because is not enabled or available yet
o.enabled = true;
o.longForm(); // Won't be called because is not available yet
o.available = true;
o.longForm(); // Finally able to be called


##  Interface inheritance
Interfaces copy Axioms from another class
--
// In addition to class-inheritance, FOAM also supports
// interfaces, which are a form of multiple-inheritance which
// copy Axioms from another model.
foam.CLASS({
  name: 'SampleI',
  properties: [ 't1', 't2', 't3' ],
  methods: [
    function tfoo() { console.log('tfoo'); },
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
var tt = ImplementsTest.create({p1:1, t1:2});
tt.tfoo(); // From SampleI
tt.foo();
console.log("Properties p1:", tt.p1, "t1:", tt.t1);


##  Interface multiple inheritance
Implements allows multiple inheritance, unlike extends
--
// Unlike regular inheritance with extends:, classes
// can implement: from multiple sources. However,
// implements only takes axioms from the class you reference,
// not anything it extends or implements.
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

console.log("ImplementsTest2 properties:",
  ImplementsTest2.getAxiomsByClass(foam.core.Property));


##  Property Inheritance
Properties in subclasses inherit from the parent's Properties
--
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
console.log(PropertyInheritA.SAME_NAME.cls_.id, PropertyInheritB.SAME_NAME.cls_.id);


##  Inner Classes
Inner classes are defined inside another class, not directly available in the global namespace.
--
// Classes can have inner-Classes.
var results = '';
foam.CLASS({
  name: 'InnerClassTest',
  classes: [
    { name: 'InnerClass1', properties: ['a', 'b'] },
    { name: 'InnerClass2', properties: ['x', 'y'] }
  ],
  methods: [
    function init() {
      // access from within the outer class
      var ic1 = this.InnerClass1.create({a:1, b:2});
      var ic2 = this.InnerClass2.create({x:5, y:10});
      results += ic1.a + ", " + ic1.b + ", " + ic2.x + ", " + ic2.y;
    }
  ]
});
InnerClassTest.create();
console.log(results);


##  Inner Class access
Inner classes are only accessible through their outer class
--
console.log("Access through outer:", InnerClassTest.InnerClass1.name);

// Inner-classes do not appear in the global namespace
console.log("Available globally?", !! global.InnerClass1);


##  Inner Enums
Similar to Inner-classes, there's also Inner-enums
--
var result = '';
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
      // access from within the outer class
      result += this.InnerEnum.OPEN + " / " + this.InnerEnum.CLOSED;
    }
  ]
});
InnerEnumTest.create();
console.log(result);


##  Inner Enum access
Inner-enums can only be accessed through the outer-class
--
console.log("Access through outer:", InnerEnumTest.InnerEnum.name);

// Inner-enums do not appear in the global namespace
console.log("Available globally?", !! global.InnerEnum);


##  Pub Sub
Objects can publish events and subscribe to other objects
--
foam.CLASS({
  name: 'PubSubTest'
});
var o = PubSubTest.create();


##  Subscribing
Objects can publish events and subscribe to other objects
--
// Objects support pub() for publishing events,
// and sub() for subscribing to published events.
var globalCalls = 0;
var alarmCalls = 0;
var globalResult = '';
// Install a listener that listens to all events
// Listeners are called with a subscription object and the given
//   arguments from pub().
o.sub(function() {
  console.log('  global listener: ', [].join.call(arguments, ' '));
  globalCalls += 1;
  globalResult += ' a' + arguments.length;
});
// This listener will only fire if the first argument matches 'alarm'
o.sub('alarm', function() {
  console.log('  alarm: ', [].join.call(arguments, ' '));
  alarmCalls += 1;
});
console.log("Pub alarm:");
o.pub('alarm', 'on');
console.log("Pub lifecycle:");
o.pub('lifecycle', 'loaded');


##  Publish arguments
Any number of arguments can be published
--
// Test publishing with many args
console.log("Pub many arguments:");
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
console.log(globalResult);


##  Topics
A Class can declare Topics that it publishes events for
--
foam.CLASS({
  name: 'TopicTest',
  topics: [ 'alarm' ]
});
var o = TopicTest.create();
var normalCalls = 0;
var topicCalls = 0;

o.sub('alarm', function(_, __, state) {
  console.log('alarm: ', state);
  normalCalls += 1;
});
// The next line uses the Topic and is slightly shorter than the equivalent above.
o.alarm.sub(function(_, __, state) {
  console.log('alarm (topic): ', state);
  topicCalls += 1;
});
o.alarm.pub('on');
o.pub('alarm', 'off');


##  propertyChange
Objects implicitly pub events on the propertyChange topic when property values change
--
foam.CLASS({
  name: 'PropertyChangeTest',
  properties: [ 'a', 'b' ]
});
o = PropertyChangeTest.create();
// propertyChange event listeners are called with:
//   sub  - the subscription object, which can be detach()ed to end
//            the subscription
//   p    - the string 'propertyChange'
//   name - the name of the changed property
//   dyn  - a dynamic access object to .get() the current value and
//            getPrev() the pre-change value

var anyChangeCalls = 0;
var propAChangeCalls = 0;
// Listen for all propertyChange events:
o.propertyChange.sub(function(sub, p, name, dyn) {
  console.log('propertyChange: ', p, name, dyn.getPrev(), dyn.get());
  anyChangeCalls += 1;
});

// Listen for only changes to the 'a' Property:
o.propertyChange.sub('a', function(sub, p, name, dyn) {
  console.log('propertyChange.a: ', p, name, dyn.getPrev(), dyn.get());
  propAChangeCalls += 1;
});

o.a = 42;
o.b = 'bar';
o.a++;


##  Unsubscribe from subscriber
1. Call .detach() on the Detachable that sub() returns
--

var calls = 0;
var l = function(sub, name) {
  console.log('Event:', name);
  calls += 1;
};

var sub = o.sub(l);
o.pub('fire');
sub.detach();
o.pub("fire again, but nobody's listenering");


##  Unsubscribe from listener
2. Detach the subscription, which is supplied to the listener
--
var calls = 0;
var once = function(sub, name) {
  console.log('Event:', name);
  calls += 1;
  // stop listening
  sub.detach();
};

o.sub(once);
o.pub('fire');
o.pub("fire again, but nobody's listening");


##  Unsubscribe with oneTime helper
3. If you only want to receive the first event, use foam.events.oneTime()
--
// If you only want to receive the first event, decorate your
// listener with foam.events.oneTime() and it will cancel the subscription
// when it receives the first event.
o.sub(foam.events.oneTime(function() {
  console.log.apply(console.log, arguments);
}));

o.pub('fire');
o.pub("fire again, but nobody's listenering");


##  Slot get
Slots are like Object-Oriented pointers
--
// A property's slot is accessed as 'name'$.
// get() is used to dereference the value of a slot
var p = Person.create({ name: 'Bob' });
var dyn = p.name$;
console.log("Person name:", dyn.get());


##  Slot set
set() is used to set a Slot's value
--
dyn.set('John'); // sets p.name implicitly
console.log("Name after set:", p.name, "get():", dyn.get());


##  Slot get with slot method
Calling obj.slot('name') is the same as obj.name$
--
var p = Person.create({name: 'Bob'});

var dyn = p.slot('name'); // same as p.name$
console.log("slot value:", dyn.get());

dyn.set('John');
console.log("after set:", dyn.get());


##  Slot nesting
Slots can be nested with dot() to bind to a sub-property of a property value
--
// Nested slots
foam.CLASS({ name: 'Holder', properties: [ 'data' ] });
var p1 = Person.create({name: 'John'});
var p2 = Person.create({name: 'Paul'});
var h = Holder.create({data: p1});
// Bind to the 'name' of whatever h.data will be, even if it changes
var s = h.data$.dot('name');

// Note that this listener is called when we swap p2 for p1, since
//  p2.name is not the same as p1.name.
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

s.set('George');
console.log("  After setting s, p2.name:", p2.name);

p2.name = 'Ringo';
console.log("  After setting p2.name, s:", s.get());


##  Subscription nesting
Subscribe using valueSub() of the slot, automatically resubscribed as the value changes
--
// Subscribe to the value of the slot data$, removing the
// subscription and resubscribing to the new value of data$
// if it changes.
foam.CLASS({ name: 'Holder', properties: [ 'data' ] });
var p1 = Person.create({name: 'John'});
var p2 = Person.create({name: 'Paul'});
var h = Holder.create({data: p1});
var changes = "";
h.data$.valueSub(function(e, topic, name, dyn) {
  console.log('sub change: ', e.src.name, topic, name);
  changes += topic + ':' + (dyn && dyn.get()) + ' ';
});

p1.name = 'Peter';
p2.name = 'Mary';
h.data = p2;
p1.name = 'James';
p2.name = 'Ringo';
p2.pub('test','event');


##  Data Binding two way
Assiging one slot to another binds their values
--
// Two-Way Data-Binding
// Slots can be assigned, causing two values to be
// bound to the same value.
var p1 = Person.create(), p2 = Person.create();

p1.name$ = p2.name$;
p1.name = 'John'; // also sets p2.name
console.log("Assigned first:", p1.name, p2.name);

p2.name = 'Steve'; // also sets p1.name
console.log("Assigned second: ", p1.name, p2.name);


##  Data Binding linkFrom
Another way to link two Slots is to call .linkFrom() on one of them
--
var p1 = Person.create({ name: 'p1' });
var p2 = Person.create({ name: 'p2' });
var d = p1.name$.linkFrom(p2.name$);
p1.name = 'John';
console.log("Assigned first:", p1.name, p2.name);


##  Data Binding linkFrom unbind
linkFrom/To() returns a detachable that unbinds the slots
--
// But this style of link can be broken by calling .detach()
// on the object return from .linkFrom/To().
d.detach();
p2.name = 'Steve';
console.log("No longer bound:", p1.name, p2.name);


##  Data Binding linkTo
linkTo() is the same as linkFrom(), except that the initial value is taken from 'this' instead of the other object
--
// linkTo() is the same as linkFrom(), except that the initial value
// is taken from 'this' instead of the other object.
var p1 = Person.create({ name:'p1' }), p2 = Person.create({ name:'p2' });
var d = p1.name$.linkTo(p2.name$);
console.log("After linkTo:", p1.name, p2.name);
var name2 = p2.name;

p1.name = 'John';
console.log("Assigned first:", p1.name, p2.name);


##  Data Binding relateTo
Two values can be linked through relateTo
--
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
        function f2c(f) {
          console.log('f2c', f); return 5/9 * ( f - 32 );
        },
        function c2f(c) {
          console.log('c2f', c); return 9/5 * c + 32;
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


##  Data Binding one way
The .follow() method binds in one direction only
--
// Calling .linkFrom()/.linkTo() creates a two-way data-binding, meaning a change in either
// value is reflected in the other.  But FOAM supports one-way data-binding as well.
// To do this, use the .follow() method.
var p1 = Person.create({ name:'p1' }), p2 = Person.create({ name:'p2' });
var d = p1.name$.follow(p2.name$);

p2.name = 'Ringo'; // Will update p1 and p2
p2.name = 'Paul'; // Will update p1 and p2
console.log('Assigned p2:', p1.name, p2.name);
p1.name = 'George'; // Will only update p1
console.log('Assigned p1:', p1.name, p2.name);
d.detach();


##  Data Binding one way initialization
Follow copies the initial value of the followed slot
--
p1 = Person.create();
p2 = Person.create({name:'John'});
console.log("Initial:", p1.name, p2.name);

p1.name$.follow(p2.name$);
console.log("After follow:", p1.name, p2.name);


##  Data Binding one way mapFrom
One-Way Data-Binding, with Map function (mapFrom)
--
var p1 = Person.create(), p2 = Person.create();
var d = p1.name$.mapFrom(p2.name$, function(n) {
  return n + "es";
});

p2.name = 'Ringo'; // Will update p1 and p2
console.log('Assigned second:', p1.name, p2.name);
p1.name = 'George'; // Will only update p1
console.log('Assigned first:', p1.name, p2.name);
d.detach();


##  Data Binding one way mapTo
One-Way Data-Binding, with Map function (mapTo)
--
// The reverse of mapFrom(), mapTo() takes the value of this,
// mapping it and assigning to the target.
var p1 = Person.create(), p2 = Person.create();
var d = p2.name$.mapTo(p1.name$, function(n) {
  return 'One' + n;
});

p2.name = 'Ringo'; // Will update p1 and p2
console.log("Assigned second:", p1.name, p2.name);
p1.name = 'George'; // Will only update p1
console.log("Assigned first:", p1.name, p2.name);
d.detach();


##  Slot isDefined
Slots also let you check if the value is defined by calling isDefined()
--
// Calling obj.name$.isDefined() is equivalent to obj.hasOwnProperty('name');
foam.CLASS({name: 'IsDefinedTest', properties: [ { name: 'a', value: 42 } ]});
var o = IsDefinedTest.create();
var dv = o.a$;
console.log("Default value only, isDefined?", dv.isDefined());
dv.set(99);
console.log("Set to 99, isDefined?", dv.isDefined());


##  Slot clear
You can reset a Slot to its default value by calling .clear()
--
// Calling obj.name$.clear() is equivalent to obj.clearProperty('name');
dv.clear();
console.log("After clearing:", dv.get(), dv.isDefined());


##  ConstantSlot
ConstantSlot creates an immutable slot
--
var s = foam.core.ConstantSlot.create({ value: 42 });
console.log("Intial value:", s.get());
s.value = 66;
s.set(66);
console.log("After set to 66:", s.get());


##  SimpleSlot
SimpleSlot creates a mutable slot.
--
var s = foam.core.SimpleSlot.create({ value: 42 });
console.log("Intial value:", s.get());
s.value = 66;
s.set(66);
console.log("After set to 66:", s.get());


##  PromiseSlot
PromiseSlot provides a declarative way of creating a slot that should contain the value of a promise when it resolves.
--
var promise = new Promise(function(resolve, reject) {
  window.setTimeout(function() {
    resolve(66);
  }, 3000);
}).then((value) => {
  console.log('Promise resolved!', new Date());
  console.log('Slot value:', value);
});
console.log('Promise created.', new Date());
var s = foam.core.PromiseSlot.create({
  value: 42,
  promise: promise
});
console.log("Intial value of the slot:", s.get());
window.setTimeout(() => {
  console.log('Value 1 second later, at ' + new Date() + ':', s.get());
}, 1000);
return promise;


##  ArraySlot
ArraySlot provides a way to group several slots together so that when any of them update we can invalidate.
--
var promise = new Promise(function(resolve, reject) {
  window.setTimeout(() => resolve('bar'), 3000);
});
var s1 = foam.core.SimpleSlot.create({ value: 42 });
var s2 = foam.core.PromiseSlot.create({ value: 'foo', promise: promise });
var arraySlot = foam.core.ArraySlot.create({ slots: [s1, s2] });
console.log('Initial value:', arraySlot.get());
arraySlot.sub((detachable, eventName, propName, slot) => {
  console.log('Value updated to:', arraySlot.get());
});
s1.set(66);
return promise;


##  ProxySlot
ProxySlot provides a way to flatten/join a slot of a slot into what appears to be a slot of the inner slot's value. It lets you abstract away the inner slot.Using ProxySlot in this way is similar to how Promises that return Promises are automatically flattened/joined for you. However, in the case of slots, you need to explicitly use ProxySlot if you want this joining behaviour, otherwise you'll simply have a slot whose value is a slot. In this regard, slots are more flexible than Promises because it is up to the programmer to decide whether they want flattening/joining behaviour or not.
--
var s1 = foam.core.SimpleSlot.create({ value: 'fname' });
foam.CLASS({ name: 'Person', properties: ['fname', 'lname'] });
var p = Person.create({ fname: 'John', lname: 'Smith' });
var slotOfSlot = s1.map((propName) => {
  return p.slot(propName).map((propValue) => propName + ' = ' + propValue);
});
var proxySlot = foam.core.ProxySlot.create({ delegate$: slotOfSlot });
console.log('Value:', proxySlot.get());
s1.set('lname');
console.log('Value:', proxySlot.get());


##  Expression Slots
ExpressionSlot creates a Slot from a list of Slots and a function to combine them
--
foam.CLASS({ name: 'Person', properties: ['fname', 'lname'] });
var p = Person.create({ fname: 'John', lname: 'Smith' });
// When fname or lname changes, the new values are fed into the function
// to produce a new value for ExpressionSlot e
var e = foam.core.ExpressionSlot.create({
  args: [ p.fname$, p.lname$ ],
  code: function(f, l) { return f + ' ' + l; }
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


##  Expression Slot with object
ExpressionSlot can use an object to supply the source slots
--
foam.CLASS({ name: 'Person', properties: [ 'f', 'l' ] });
var p = Person.create({ f:'John', l: 'Smith' });
// function arguments 'f' and 'l' are treated as property names on obj
var e = foam.core.ExpressionSlot.create({
  obj: p,
  code: function(f, l) { return f + ' ' + l; }
});
console.log("Initial e:", e.get());
e.sub(function() {
  console.log("e changed:", e.get());
});
p.f = 'Steve';
p.l = 'Jones';
console.log("Final e:", e.get());


##  Expression Slot unbinding
Detach the ExpressionSlot to prevent further updates
--
calls = 0;
e.detach();
console.log("e detached, setting f and l again...");
p.f = 'Bob';
p.l = 'Roberts';
console.log("Updates since detach:", calls);


##  Property Expression Class
The same functionality of ExpressionSlot is built into Properties
--
// Properties have the 'expression' feature
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
var p = Person.create({ fname: 'John', lname: 'Smith' });


##  Property Expressions
Expression properties are invalidated whenever of their listed source values change
--
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


##  Property Expression setting
Expression properties can also be explicitly set, disabling the dynamic expression
--
console.log(p.name, p.hasOwnProperty('name'));
p.name = 'Kevin Greer';
console.log(p.name, p.hasOwnProperty('name'));
p.fname = 'Sebastian';
console.log(p.fname, p.lname, ':', p.name);


##  Property Expression
Clearing a set expression property reverts it to expression mode
--
p.name = "Joe"
console.log("Set directly:", p.name, "hasOwnProperty(name)?", p.hasOwnProperty('name'));
p.clearProperty('name');
console.log("After clearing:", p.name, "hasOwnProperty(name)?", p.hasOwnProperty('name'));


##  Detachables
Detachables or functions can be registered to be called when an object is detached.
--
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
o.detach();


##  Detachables idempotent
It doesn't hurt to try and detach an object more than once
--
var o = foam.core.FObject.create();
o.detach();
o.detach();


##  Detachables unsubscribe

--
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
source.sub('ping', sink.l);
source.pub('ping');
source.pub('pong'); // There is no subscriber to the topic 'pong'
source.pub('ping');

// Detaching object and unsubscribing all subscribers
source.detach();
source.pub('ping');


##  Model validation extends refines
Extends and refines are mutually-exclusive
--
foam.CLASS({
  name: 'EandRTest',
  extends: 'FObject',
  refines: 'Model'
});
EandRTest.model_.validate();


##  Model validation property name exists
Properties must have names
--
foam.CLASS({
  name: 'ValidationTest',
  properties: [
    { name: '' }
  ]
});
ValidationTest.model_.validate();


##  Action validation names
Actions must have a name
--
foam.CLASS({
  name: 'ActionNameValidation',
  actions: [
    { name: '', code: function() {} }
  ]
});
ActionNameValidation.model_.validate();


##  Action validation code
Actions must have code
--
foam.CLASS({
  name: 'ActionCodeValidation',
  actions: [
    { name: 'test' }
  ]
});
ActionCodeValidation.model_.validate();


##  Model validation property slot name
Properties names must not end with $
--
foam.CLASS({
  name: 'DollarValidationTest',
  properties: [
    { name: 'name$' }
  ]
});
DollarValidationTest.model_.validate();


##  Model validation property constants
Property constants must not conflict
--
foam.CLASS({
  name: 'ConstantConflictTest',
  properties: [ 'firstName', 'FirstName' ]
});
ConstantConflictTest.model_.validate();


##  Model validation property same name
Properties must not have the same name
--
foam.CLASS({
  name: 'AxiomConflict1',
  properties: [ 'sameName', 'sameName' ]
});
AxiomConflict1.model_.validate();


##  Model validation same method name
Methods must not have the same name
--
foam.CLASS({
  name: 'AxiomConflict2',
  methods: [ function sameName() {}, function sameName() {} ]
});
AxiomConflict2.model_.validate();


##  Axiom validation same name
Axioms must not have the same name
--
//
foam.CLASS({
  name: 'AxiomConflict3',
  properties: [ 'sameName' ],
  methods: [ function sameName() {} ]
});
AxiomConflict3.model_.validate();


##  Axiom validation sub property type
A Property cannot be changed to a non-Property
--
foam.CLASS({
  name: 'AxiomChangeSuper',
  properties: [ 'sameName' ] // property
});
foam.CLASS({
  name: 'AxiomChangeSub',
  extends: 'AxiomChangeSuper',
  methods: [ function sameName() {} ] // now it's a method? no!
});
AxiomChangeSub.model_.validate();


##  Axiom validation class change
Warn if an Axiom changes its class
--
foam.CLASS({
  name: 'AxiomChangeSuper2',
  methods: [ function sameName() {} ]
});
foam.CLASS({
  name: 'AxiomChangeSub2',
  extends: 'AxiomChangeSuper2',
  properties: [ 'sameName' ]
});
AxiomChangeSub2.model_.validate();


##  Property validation single accessor
Properties may only have one of factory, value, expression, or getter; one of setter or adapt+preset+postset
--
var setTo;
foam.CLASS({
  name: 'PropertyValidationTest',
  properties: [
    {
      name: 't1',
      setter: function() { setTo = 1; this.instance_.t1 = 1; },
      adapt: function(_,v) { return v + 1; },
      preSet: function(_,v) { return v + 1; },
      postSet: function(_,v) { setTo = v + 1; }
    },
    {
      name: 't2',
      getter: function() { return 42; },
      factory: function() { return 43; },
      expression: function() { return 44; },
      value: 45
    }
  ]
});
PropertyValidationTest.model_.validate();


##  Property required
Properties marked required must have values supplied to create()
--
// Required
foam.CLASS({
  name: 'ValidationTest',
  properties: [
    { name: 'test', required: true }
  ]
});

var o = ValidationTest.create({test: '42'});
o.validate();
console.log('-');
var o = ValidationTest.create();
o.validate();


##  Unknown Properties
Unknown Model and Property properties are detected
--
foam.CLASS({
  name: 'ValidationTest',
  unknown: 'foobar',
  properties: [
    { name: 'test', unknown: 'foobar' }
  ]
});
ValidationTest.model_.validate();


##  Context create sub context
Contexts can be explicitly created with foam.createSubContext()
--
// The second argument of createSubContext() is an optional name for the Context
var Y1 = foam.createSubContext({
  key: 'value',
  fn: function() {
    return 'here';
  }
}, 'SubContext');
console.log("Y1:", Y1.key, Y1.fn());


##  Context context sub context
Sub-Contexts can be created from other Contexts
--
var Y2 = Y1.createSubContext({ key: 'value2' });
console.log("Y2:", Y2.key, Y2.fn());


##  Context sub context describe
A Context's contents can be inspected with .describe()
--
Y1.describe();
Y2.describe();


##  Imports Test Class
Imports are pulled from the context when an instance is created
--
foam.CLASS({
  name: 'ImportsTest',
  imports: [ 'myLogger' ],
  methods: [ function foo() {
    this.myLogger('log foo from ImportTest');
  } ]
});


##  Import context values
Classes can import values from the Context so that they can be accessed from this
--
// First try the import with no 'myLogger' in its context
try {
  var o = ImportsTest.create(); // should fail here, on object creation
  console.log('test created');
  o.foo();
} catch(e) {
  console.log('Could not import "myLogger" since nobody provided it.');
}

var lastLogMsg = "";
// Provide a 'myLogger' on a context
var Y = foam.createSubContext({ myLogger: function(msg) {
  console.log('log:', msg);
  lastLogMsg = msg;
}});

Y.myLogger('test');
// Using 'requires' supplies the context automatically, but for this
// example we supply the context explicitly.
var o = ImportsTest.create(null, Y); // create with context Y
o.foo();


##  Imports optional
Optional imports, marked with a ?, don't warn if not found
--
foam.CLASS({
  name: 'OptionalImportsTest',
  imports: [ 'myLogger?' ],
  methods: [ function foo() {
    this.myLogger('log foo from ImportTest');
  } ]
});
try {
  var o = OptionalImportsTest.create();
  console.log('Test created ok');
  console.log('Trying to use missing import...');
  o.foo(); // should fail here, on import use
} catch(e) {
  console.log('As expected, could not import "myLogger" since nobody provided it.');
}


##  Export context values
Classes can export values for use by objects they create
--
var calls = 0;
foam.CLASS({
  name: 'ExportsTest',
  requires: [ 'ImportsTest' ],
  exports: [ 'myLogger' ],
  methods: [
    function init() {
      this.ImportsTest.create().foo();
    },
    function myLogger(msg) {
      // this function is exported, thus available to object we create
      // (like ImportsTest in our init)
      console.log('ExportsTest logger call:', msg);
      calls += 1;
    }
  ]
});
ExportsTest.create();


##  Packages
Classes can specify a package
--
foam.CLASS({
  package: 'com.acme',
  name: 'Test',
  methods: [ function foo() {
    console.log('Hello, I am foo() from com.acme.Test');
  } ]
});
com.acme.Test.create().foo();


##  Requires
Classes should requires: other Classes they need to use
--
// Classes can requires: other Classes to avoid having to reference them
// by their fully-qualified names. The creation context (and thus our
// exports) is also automatically provided.
foam.CLASS({
  name: 'RequiresTest',
  requires: ['com.acme.Test' ],
  methods: [ function foo() {
    this.Test.create().foo();
  } ]
});

console.log("When required:");
RequiresTest.create().foo();


##  Requires as
Requires can use as to alias required Classes
--
// Use 'as' to pick the name to use on 'this'. If a required
// class is named the same as one of your properties or methods,
// or two required classes have the same name, you may be forced
// to specify the name with 'as':
foam.CLASS({
  name: 'RequiresAliasTest',
  requires: ['com.acme.Test as NotTest' ],
  methods: [ function foo() {
    this.NotTest.create().foo();
  } ]
});

console.log("Required as NotTest:");
RequiresAliasTest.create().foo();


##  Primary Key
Classes can have a unique-id or primary-key
--
// By default, this is simply the field named 'id'.
foam.CLASS({
  name: 'Invoice',
  properties: [ 'id', 'desc', 'amount' ]
});
var o = Invoice.create({ id: 1, desc: 'Duct Cleaning', amount: 99.99 });
console.log(o.id);


##  Primary Key ids
Use the ids property to specify that the primary key be something other than id
--
// You can also use the 'ids' property to specify that
// the primary key be something other than 'id'.
// In this case, 'id' will become an psedo-property for
// accessing the real 'invoiceId' property.
foam.CLASS({
  name: 'Invoice2',
  ids: [ 'invoiceId' ],
  properties: [ 'invoiceId', 'desc', 'amount' ]
});
var o = Invoice2.create({ invoiceId: 23, desc: 'Duct Cleaning', amount: 99.99 });
console.log("Id:", o.id, "invoiceId:", o.invoiceId);


##  Primary Key multipart Class
Multi-part unique identifiers are also supported by setting ids
--
foam.CLASS({
  name: 'Invoice3',
  ids: [ 'customerId', 'invoiceId' ],
  properties: [ 'customerId', 'invoiceId', 'desc', 'amount' ]
});


##  Primary Key multipart
Multi-part unique identifiers are also supported by setting ids
--
var o = Invoice3.create({customerId: 1, invoiceId: 1, desc: 'Duct Cleaning', amount: 99.99});
console.log("initial           id:", o.id, "customerId:", o.customerId, "invoiceId:", o.invoiceId);
// setting id propagates the changes to the properties that make up the
// multipart id:
o.id = [2, 3];
console.log("after setting id, id:", o.id, "customerId:", o.customerId, "invoiceId:", o.invoiceId);


##  Primary Key multipart comparison
Multi-part ids are comparable
--
var results = '';
results += Invoice3.ID.compare(
  Invoice3.create({customerId: 1, invoiceId: 2}),
  Invoice3.create({customerId: 1, invoiceId: 1}));

results += ", " + Invoice3.ID.compare(
  Invoice3.create({customerId: 1, invoiceId: 1}),
  Invoice3.create({customerId: 1, invoiceId: 2}));

results += ", " + Invoice3.ID.compare(
  Invoice3.create({customerId: 1, invoiceId: 1}),
  Invoice3.create({customerId: 1, invoiceId: 1}));

results += ", " + Invoice3.ID.compare(
  Invoice3.create({customerId: 2, invoiceId: 1}),
  Invoice3.create({customerId: 1, invoiceId: 1}));

results += ", " + Invoice3.ID.compare(
  Invoice3.create({customerId: 1, invoiceId: 1}),
  Invoice3.create({customerId: 2, invoiceId: 1}));

console.log("Comparison results:", results);


##  Class Id
A Class' id is a combination of its package and name
--
console.log("Test class id:", com.acme.Test.id);


##  Custom Axioms
Specify arbitrary Axioms for a Class with axioms:
--
// In addition the the built-in Axiom types, you can also
// specify arbitrary Axioms with 'axioms:'.
// This example adds the 'Singleton' axiom to make a class
// implement the Singleton patter (ie. there can only be
// one instance)
foam.CLASS({
  name: 'AxiomTest',
  axioms: [ foam.pattern.Singleton.create() ],
  methods: [ function init() {
    console.log('Creating AxiomTest');
  } ]
});

AxiomTest.create();
AxiomTest.create();
console.log("Same instance?", AxiomTest.create() === AxiomTest.create());


##  Custom Axioms inherit
Gain the custom axioms of a Class you extend
--
//
foam.CLASS({
  name: 'AxiomSubTest',
  extends: 'AxiomTest',
  methods: [ function init() {
    console.log('Creating AxiomSubTest');
  } ]
});
AxiomSubTest.create();
AxiomSubTest.create();
console.log("sub is same instance?", AxiomSubTest.create() === AxiomSubTest.create());
console.log("sub same as super?", AxiomSubTest.create() === AxiomTest.create());


##  Multiton
Add the Multion axiom to implement the Multiton pattern
--
// Multitons create one shared instance per value, based on the given
// property.
foam.CLASS({
  name: 'Color',
  axioms: [ foam.pattern.Multiton.create({ property: 'color' }) ],
  properties: [ 'color' ],
  methods: [ function init() {
    console.log('Creating Color:', this.color);
  } ]
});

var red1 = Color.create({color: 'red'});
var red2 = Color.create({color: 'red'});
var blue = Color.create({color: 'blue'});

console.log('reds same?', red1 === red2);
console.log('red same as blue?', red1 === blue);


##  Object UID
All Objects have a unique identifier, accessible with the .$UID property
--
var a = {}, b = [], c = Person.create();
console.log(a.$UID, b.$UID, c.$UID);


##  Console log listener
foam.events.consoleLog() returns a convenient listener that logs
--
// foam.events.consoleLog
foam.CLASS({name: 'ConsoleLogTest'});
var o = ConsoleLogTest.create();
o.sub(foam.events.consoleLog());
o.pub();
o.pub('foo');
o.pub('foo','bar');


##  Function memoize1
foam.Function.memoize1() memoizes a one-argument function
--
// if called again with the same argument, the previously generated
// value will be returned rather than calling the function again.
var calls = 0;
var f = foam.Function.memoize1(function(x) {
  calls += 1;
  console.log('calculating ', x, "=>", x*x);
  return x*x;
});

console.log(f(2));
console.log(f(2));
console.log(f(4));
console.log("Total number of calls:", calls);


##  Function memoize1 one arg only
A call to memoize1'ed function with no arguments or too many arguments will trigger a failed assertion
--
f();
f(1, 2);


##  Function argsStr
foam.Function.argsStr() returns a function's arguments as a string
--
var f = function(a, b, fooBar) { };
var argsAsStr = foam.Function.argsStr(f);
console.log('Function args:', argsAsStr);


##  Function argNames
foam.Function.argNames() returns a function's arguments an an array
--
var f = function(a, b, fooBar) { };
var argsAsArray = foam.Function.argNames(f);
console.log('Function args array:', argsAsArray);


##  String constantize
foam.String.constantize converts strings from camelCase to CONSTANT_FORMAT
--
console.log('foo      =>', foam.String.constantize('foo'));
console.log('fooBar   =>', foam.String.constantize('fooBar'));
console.log('fooBar12 =>', foam.String.constantize('fooBar12'));


##  String capitalize
foam.String.capitalize capitalizes the first letter of a string
--
console.log(foam.String.capitalize('Abc def'));
console.log(foam.String.capitalize('abc def'));


##  String labelize
foam.String.labelize converts from camelCase to labels
--
console.log(foam.String.labelize('camelCase'));
console.log(foam.String.labelize('firstName'));
console.log(foam.String.labelize('someLongName'));


##  String multiline
foam.String.multiline lets you build multi-line strings from function comments
--
console.log(foam.String.multiline(function(){/*This is
a
multi-line
string*/}));


##  String pad
foam.String.pad() pads a string to the specified length
--
var s = foam.String.pad('foobar', 10);
console.log("padded  10:", '"' + s + '"', s.length);

// pad() is right justifying if given a negative number
var s = foam.String.pad('foobar', -10);
console.log("padded -10:", '"' + s + '"', s.length);


##  Template basics
Templates use a JSP syntax to insert properties and code
--
//
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
console.log(o.hello());


##  Template arguments
Templates can be declared to accept arguments
--
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
console.log(o.greet("Bob"));


##  Template nesting
Templates can be called from other templates. Include output as the first argument.
--
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
      // 'output' is an implicit argument you must pass when calling one template
      // from another.
      template: '<% this.greeter(output, stranger); %>, my name is <%= this.name %>'
    }
  ]
});

var o = TemplateTest.create({ name: 'Adam' });
console.log(o.greet("Alice"));


##  Template code
Template can use raw JS code for loops and control structures
--
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

console.log(TemplateTest.create({ name: 'Adam' }).complexTemplate());


##  Template mutliline
Multi-line templates can be defined as function comments
--
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
      console.log(MultiLineTemplateTest.create({ name: 'Adam' }).complexTemplate());


##  Create JSON Class
Conversion to and from JSON is supported
--
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


##  JSON parse
Use foam.json.parse(someJSONobject) to convert to an FObject
--
var o = foam.json.parse({
  class: 'JSONTest',
  name: 'John',
  age: 42,
  children: ['Peter', 'Paul']});
o.describe();


##  JSON output
Use foam.json.stringify(fobject) to serialize an FObject to a JSON string
--
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
console.log(foam.json.stringify(o));



##  JSON output modes
Different outputters support suppressing properties, transients, and other options
--
// Outputters have different defaults for formatting, which properties
// to output, etc. You can clone one and change these settings on the
// outputter to customize your JSON output.

console.log('\nConvert to a JSON object (instead of a String):');
console.log(foam.json.stringify(JSONTest.create(foam.json.objectify(o))));

console.log('\nAs a method on Objects:');
console.log(o.stringify());

console.log('\nPretty-printed output:');
console.log(foam.json.Pretty.stringify(o));

console.log('\nDisable class name output by cloning your own outputter:');
console.log(foam.json.Pretty.clone().copyFrom({ outputClassNames: false }).stringify(o));

console.log('\nStrict output:');
console.log(foam.json.Strict.stringify(o));

console.log('\nStrict-but-still-readable output:');
console.log(foam.json.PrettyStrict.stringify(o));

console.log('\nCompact output:');
console.log(foam.json.Compact.stringify(o));

console.log('\nShort-name (very compact) output:');
console.log(foam.json.Short.stringify(o));

console.log('\nNetwork (network-transient properties omitted) output:');
console.log(foam.json.Network.stringify(o));

console.log('\nStorage (storage-transient properties omitted) output:');
console.log(foam.json.Storage.stringify(o));


##  Graphics Support
CViews enable canvas rendering
--
foam.CLASS({
  name: 'GraphicsDemo',
  extends: 'foam.graphics.CView',
  requires: [
    'foam.graphics.Arc',
    'foam.graphics.Box',
    'foam.graphics.Circle',
    'foam.graphics.CView',
    'foam.graphics.Gradient'
  ],
  properties: [
    [ 'width', 500 ],
    [ 'height', 500 ],
    {
      name: 'children',
      factory: function() {
        var objects = [
          this.Arc.create({
            start: 0,
            end: 1.5*Math.PI,
            radius: 40
          }),
          this.Circle.create({
            color: this.Gradient.create({
              radial: true,
              x0: 0, y0: 0, r0: 10,
              x1: 0, y1: 0, r1: 100,
              colors: [
                [0, 'green'],
                [0.4, 'blue'],
                [0.6, 'red'],
                [1, 'white']
              ]
            }),
            border: '',
            radius: 100,
            x: 300,
            y: 300
          }),
          this.Box.create({
            color: this.Gradient.create({
              radial: false,
              x0: 0, y0: 0,
              x1: 100, y1: 100,
              colors: [
                [0, 'black'],
                [1, 'white']
              ]
            }),
            width: 100,
            height: 100,
            originX: 50,
            originY: 50,
            x: 100,
            y: 400,
            children: [
              this.Circle.create({
                color: 'red',
                x: 30,
                y: 30,
                radius: 10
              }),
              this.Circle.create({
                color: 'red',
                x: 70,
                y: 30,
                radius: 10
              }),
              this.Circle.create({
                color: 'red',
                x: 30,
                y: 70,
                radius: 10
              }),
              this.Circle.create({
                color: 'red',
                x: 70,
                y: 70,
                radius: 10
              }),
              this.Circle.create({
                color: 'red',
                x: 50,
                y: 50,
                radius: 10
              })
            ]
          })
        ];
        return objects;
      }
    },
    {
      name: 'counter',
      value: 0
    }
  ],
  listeners: [
    {
      name: 'step',
      isFramed: true,
      code: function() {
        this.counter += 0.01
        this.children[0].rotation += 0.1;
        this.children[0].x = 150 + 50 * Math.cos(this.counter);
        this.children[0].y = 150 + 50 * Math.sin(this.counter);
        this.children[1].skewX = Math.sin(this.counter);
        this.children[2].scaleX = 0.5 + 0.5 * Math.abs(Math.cos(this.counter));
        this.children[2].scaleY = 0.5 + 0.5 * Math.abs(Math.sin(this.counter));
        this.children[2].rotation += 0.01;
        this.step();
        this.invalidated.pub();
      }
    }
  ]
});
var g = GraphicsDemo.create();
add(g);
//g.write();
g.step();
## DAO By Example
##  Load MLangs
Loads the mlang query langauage
--
var M = foam.mlang.ExpressionsSingleton.create();


##  Bank Classes
Example data models for bank accounts
--
foam.CLASS({
  package: 'example',
  name: 'Bank',
  properties: [ 'id', 'name' ]
});
foam.CLASS({
  package: 'example',
  name: 'Customer',
  properties: [ 'id', 'firstName', 'lastName' ]
});
foam.CLASS({
  package: 'example',
  name: 'Account',
  properties: [ 'id', 'type' ]
});
foam.CLASS({
  package: 'example',
  name: 'Transaction',
  properties: [
    'id',
    'label',
    'amount',
    { class: 'Date', name: 'date' },
  ]
});

// relate with foreign key relationships
foam.RELATIONSHIP({
  sourceModel: 'example.Bank',
  forwardName: 'customers', // adds a 'customers' property to Bank
  targetModel: 'example.Customer',
  inverseName: 'bank' // adds 'bank' property to Customer
});
foam.RELATIONSHIP({
  sourceModel: 'example.Customer',
  forwardName: 'accounts',
  targetModel: 'example.Account',
  inverseName: 'owner'
});
foam.RELATIONSHIP({
  sourceModel: 'example.Account',
  forwardName: 'transactions',
  targetModel: 'example.Transaction',
  inverseName: 'account'
});

// create the example app with our DAOs exported
foam.CLASS({
  package: 'example',
  name: 'BankApp',
  requires: [ // using app.Customer.create() gives it our exports
    'example.Bank',
    'example.Customer',
    'example.Account',
    'example.Transaction',
    'foam.dao.EasyDAO'
  ],
  exports: [ // by default, DAOs are looked up by class name
    'bankDAO',
    'customerDAO',
    'accountDAO',
    'transactionDAO',
  ],
  properties: [
    { name: 'bankDAO', factory: function() {
      return this.EasyDAO.create({
        name: 'banks',
        of: this.Bank, daoType: 'MDAO'
      });
    }},
    { name: 'customerDAO', factory: function() {
      return this.EasyDAO.create({
        name: 'customers',
        seqNo: true,
        of: this.Customer, daoType: 'MDAO'
      });
    }},
    { name: 'accountDAO', factory: function() {
      return this.EasyDAO.create({
        name: 'accounts',
        seqNo: true,
        of: this.Account, daoType: 'MDAO'
      });
    }},
    { name: 'transactionDAO', factory: function() {
      return this.EasyDAO.create({
        name: 'transactions',
        seqNo: true,
        of: this.Transaction, daoType: 'MDAO'
      });
    }}
  ]
});
var app = example.BankApp.create();


##  Load Banks
Sets up Bank DAO with example banks
--
return Promise.all([
  app.bankDAO.put(app.Bank.create({ id: 'fn', name: 'First National' })),
  app.bankDAO.put(app.Bank.create({ id: 'tt', name: 'Tortuga Credit Union' }))
]);

##  Load Customers
Sets up Customer DAO with example customers
--
return Promise.all([
  app.customerDAO.put(app.Customer.create({ firstName: 'Sarah',  lastName: 'Smith',    bank: 'fn' })),
  app.customerDAO.put(app.Customer.create({ firstName: 'Harry',  lastName: 'Sullivan', bank: 'fn' })),
  app.customerDAO.put(app.Customer.create({ firstName: 'Jamie', lastName: 'MacKenzie',  bank: 'fn' })),

  app.customerDAO.put(app.Customer.create({ firstName: 'Herman',  lastName: 'Blackbeard', bank: 'tt' })),
  app.customerDAO.put(app.Customer.create({ firstName: 'Hector',  lastName: 'Barbossa',   bank: 'tt' })),
  app.customerDAO.put(app.Customer.create({ firstName: 'William', lastName: 'Roberts',    bank: 'tt' })),
]);

##  Create Accounts
Sets up Accounts DAO with example account, by select()ing into a sink
--
// we want to wait for the puts to complete, so save the promises
accountPuts = [];
// Generate accounts for each customer. Select into an in-line
// sink to process results as they come in.
return app.customerDAO.select(foam.dao.QuickSink.create({
  putFn: function(customer) {
    // create accounts, add to accountDAO, save the promises for later
    // so we know all the puts have completed.
    accountPuts.push(customer.accounts.put(app.Account.create({ type: 'chq' })));
    accountPuts.push(customer.accounts.put(app.Account.create({ type: 'sav' })));
  }
})).then(function() {
  return Promise.all(accountPuts);
});

##  Create Transactions
Sets up Transactions DAO with example transactions
--
// we want to wait for the puts to complete, so save the promises
transactionPuts = [];

// Generate transactions for each account.
var amount = 0;
var date = new Date(0);

// functions to generate some data
function generateAccountChq(account) {
  for ( var j = 0; j < 10; j++ ) {
    date.setDate(date.getDate() + 1);
    transactionPuts.push(account.transactions.put(app.Transaction.create({
      date: new Date(date),
      label: 'x'+amount+'x',
      amount: ((amount += 0.25) % 20) - 5 + (amount % 2) * 5
    })));
  }
}
function generateAccountSav(account) {
  for ( var j = 0; j < 5; j++ ) {
    date.setDate(date.getDate() + 2.5);
    transactionPuts.push(account.transactions.put(app.Transaction.create({
      date: new Date(date),
      label: 's'+amount+'s',
      amount: ((amount += 1.5) % 50) + (amount % 4) * 5
    })));
  }
}

// Select into an ArraySink, which dumps the results of the query to a
// plain array, and run data generating functions for each one.
// Calling select() with no arguments resolves with an ArraySink.
// If you pass a sink to .select(mySink), your sink is resolved.

// Select 'chq' accounts first
return app.accountDAO.where(M.EQ(app.Account.TYPE, 'chq'))
  .select().then(function(defaultArraySink) {
    var accounts = defaultArraySink.array;
    for ( var i = 0; i < accounts.length; i++ ) {
      generateAccountChq(accounts[i]);
    }
}).then(function() {
  // Then select 'sav' accounts
  amount = 0;
  date = new Date(0);
  app.accountDAO.where(M.EQ(app.Account.TYPE, 'sav'))
    .select().then(function(defaultArraySink) {
      var accounts = defaultArraySink.array;
      for ( var i = 0; i < accounts.length; i++ ) {
        generateAccountSav(accounts[i]);
      }
    });
}).then(function() {
  // build transactionPuts first, when selects are done the list is ready
  return Promise.all(transactionPuts);
});

##  Join
Finds all transactions for a given customer
--
var tdao = foam.dao.ArrayDAO.create();
var tsink = foam.dao.DAOSink.create({ dao: tdao });
foam.u2.TableView.create({ of: app.Transaction, data: tdao }).write();

// Start querying at the top, and produce a larger set of results
//   to sub-query at each step
return app.customerDAO.find(2)
  .then(function(customer) {
    var transactionSelectPromises = [];
    return customer.accounts.select(foam.dao.QuickSink.create({
      putFn: function(account) {
        // no route to return promise here, since Sink.put doesn't return a promise...
        transactionSelectPromises.push(account.transactions.select(tsink));
      }
    })).then(function() {
      return Promise.all(transactionSelectPromises);
    })
  });

##  Manual Join
Without using Relationships, finds all transactions for a given customer
--
var tdao = foam.dao.ArrayDAO.create();
var tsink = foam.dao.DAOSink.create({ dao: tdao });
foam.u2.TableView.create({ of: app.Transaction, data: tdao }).write();

// to store intermediate reuslts for matching customer IDs
var customerIds = foam.dao.ArraySink.create();

// to store intermediate results for matching account IDs
var accountIds = foam.dao.ArraySink.create();

// Start querying at the top, and produce a larger set of results
//   to sub-query at each step
return app.customerDAO
  .where(M.EQ(app.Customer.ID, 2)) // a fixed customer ID, in this case
  .select(M.MAP(app.Customer.ID, customerIds)) // extract ID from results
  .then(function() {
    return app.accountDAO // query matches for the array of customer IDs
      .where(M.IN(app.Account.OWNER, customerIds.array))
      .select(M.MAP(app.Account.ID, accountIds)) // extract account ID
      .then(function() {
          return app.transactionDAO // query matches for list of accounts
            .where(M.IN(app.Transaction.ACCOUNT, accountIds.array))
            .select(tsink) // could dedup, but no duplicates in this case
      });
  });

##  Selecting with skip and limit
A pseudo scroll effect with skip and limit
--
var proxyDAO = foam.dao.ProxyDAO.create({ delegate: app.customerDAO });
var skip = 0;
var limit = 3;

// Change skip value, reassign the proxy's source.
// The table will update automatically.
setInterval(function() {
  skip = (skip + 1) % 4;
  proxyDAO.delegate = app.customerDAO.skip(skip).limit(limit);
}, 500);

foam.__context__.document.write("Customers with Skip and Limit");
foam.u2.TableView.create({ of: app.Customer, data: proxyDAO }).write();


##  Ordering
Sorting results
--
return app.accountDAO.find(3).then(function(account) {
  var transactionsDAO = account.transactions;

  foam.__context__.document.write("Sort by amount, descending");
  foam.u2.TableView.create({
    of: app.Transaction,
    data: transactionsDAO.orderBy(M.DESC(app.Transaction.AMOUNT))
  }).write();

  foam.__context__.document.write("Sort by date");
  foam.u2.TableView.create({
    of: app.Transaction,
    data: transactionsDAO.orderBy(app.Transaction.DATE)
  }).write();
})
`;
      var a = [];
      var id = [];
      var e;
      var mode = 'text';
      s = s.substring(1).split('\n').forEach(l => {
        if ( l.startsWith('##') ) {
//          e = this.Example.create({id: i++, title: l.substring(3)});
          var depth = l.substring(2).match(/^ */)[0].length;
          id.length = depth;
          id[depth-1] = (id[depth-1] || 0)+1;
          e = {id: id.join('.') + '.', title: l.substring(3), code: '', text: ''};
          a.push(e);
          mode = 'text';
        } else if ( l.startsWith('--') ) {
          mode = 'code';
        } else if ( ! e ) {
        } else if ( mode == 'text' ) {
          e.text += l + '\n';
        } else {
          e.code += l + '\n';
        }
      });
      return a;
    }
  ]
});


if ( false ) {
s = '## DAO By Example';

function deindent(s) {
  var a = s.split('\n');
  var min = a.filter(l => l.trim().length).map(l => l.match(/^ */)[0].length).reduce((a,b) => Math.min(a,b));
  return a.map(l => l.trim().length ? l.substring(min) : '').join('\n');
}

examples.forEach(e => {
  var code = e.code.toString();
  code = deindent(code.substring(13, code.length-1));
  s += `
##  ${e.name}
${e.description}
--
${code}
`;
});

console.log(s);
}
