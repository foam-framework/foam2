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
  name: 'ValidateTest',
  properties: [
    {
      name: 'gt10',
      validateObj: function(gt10) {
        if ( gt10 <= 10 ) return 'Value must be >10.';
      }
    },
    {
      name: 'lt10',
      validateObj: function(lt10) {
        if ( lt10 >= 10 ) return 'Value must be <10.';
      }
    }
  ]
});

var vt = ValidateTest.create({gt10: 11, lt10: 9});
console.log('error: ', vt.errors_);
vt.errors_$.sub(function(_,_,_,errs) { console.log('Error_$.sub::', errs.get());});
vt.gt10 = 9;
vt.lt10 = 11;
console.log('error: ', vt.errors_);

/*
foam.CLASS({
  package: 'graphics',
  name: 'Square',
  properties: [ 'side' ]
});

foam.CLASS({
  name: 'Test',
  methods: [
    {
      name: 'sizeOf',
      code: foam.mmethod({
        Null: function() { return 0; },
//        Int: function() { return 1; },
        String: function(o) { return o.length; },
        "graphics.Square": function(o) { return o.side * o.side; },
        "graphics.Circle": function(o) { return Math.PI * o.radius * o.radius; }
      })
    }
  ]
});

foam.CLASS({
  package: 'graphics',
  name: 'Circle',
  properties: [ 'radius' ]
});

var t = Test.create();
console.log(
  t.sizeOf(null),
//  t.sizeOf(42),
  t.sizeOf('Hello'),
  t.sizeOf(graphics.Square.create({side: 4})),
  t.sizeOf(graphics.Circle.create({radius: 1}))
);
*/

/*
foam.CLASS({
  name: 'Test',
  listeners: [
    {
      name: 'l1',
      code: function() {
        console.log('l1');
      }
    },
    {
      name: 'l2',
      isFramed: true,
      code: function() {
        console.log('l2');
      }
    },
    {
      name: 'l3',
      isMerged: true,
      code: function() {
        console.log('l3');
      }
    },
    {
      name: 'l4',
      isMerged: true,
      mergeDelay: 0,
      code: function() {
        console.log('l4');
      }
    },
    {
      name: 'l5',
      isMerged: true,
      mergeDelay: 1000,
      code: function() {
        console.log('l5');
      }
    },
  ]
});
var t = Test.create();

t.l1();t.l1();t.l1();
t.l2();t.l2();t.l2();
t.l3();t.l3();t.l3();
t.l4();t.l4();t.l4();

for ( var i = 0 ; i < 20 ; i++ )
  setTimeout(function() { t.l5(); }, 100*i);

*/

/*
foam.CLASS({
  name: 'Test2',
  properties: [ 'id', 'fname', 'lname' ]
});

var dao = foam.dao.EasyDAO.create({
  of: 'Test2',
//  daoType: 'MDAO',
  seqNo: true,
  cache: true,
  testData: [
    { fname: 'Madonna' },
    { fname: 'Z', lname: 'Z' },
    { fname: 'A', lname: 'Z' },
    { fname: 'B', lname: 'Z' },
    { fname: 'C', lname: 'Z' },
    { fname: 'A', lname: 'A' },
    { fname: 'B', lname: 'A' },
    { fname: 'C', lname: 'A' },
    { fname: 'A', lname: 'B' },
    { fname: 'B', lname: 'B' },
    { fname: 'C', lname: 'B' },
    { fname: 'A', lname: 'C' },
    { fname: 'B', lname: 'C' },
    { fname: 'C', lname: 'C' }
  ]
});

var e = foam.mlang.Expressions.create();

dao.where(e.EQ(Test2.LNAME, null)).select().then(function (a) {
  console.log('EQ(null)');
  a.a.forEach(function (t) { console.log(t.fname); });
});

dao.where(e.NOT(e.HAS(Test2.LNAME))).select().then(function (a) {
  console.log('NOT(HAS())');
  a.a.forEach(function (t) { console.log(t.fname); });
});

dao.orderBy(Test2.LNAME).select().then(function (a) {
  console.log('by LNAME');
  a.a.forEach(function (t) { console.log(t.fname + ' ' + t.lname); });
});

dao.orderBy(Test2.FNAME).select().then(function (a) {
  console.log('by FNAME');
  a.a.forEach(function (t) { console.log(t.fname + ' ' + t.lname); });
});

dao.orderBy(Test2.LNAME, Test2.FNAME).select().then(function (a) {
  console.log('by LNAME, FNAME');
  a.a.forEach(function (t) { console.log(t.fname + ' ' + t.lname); });
});

// dao.removeAll();

*/

/*
foam.CLASS({
  name: 'Parent',
  properties: [ 'a', 'b' ]
});

foam.CLASS({
  name: 'Child',
  extends: 'Parent',
  properties: [ 'c', 'd' ]
});

var c;
c = Child.create({});
console.log(c.stringify(), c.clone().stringify());

c = Child.create({a:'a', b:'b'});
console.log(c.stringify(), c.clone().stringify());

c = Child.create({c:'c', d:'d'});
console.log(c.stringify(), c.clone().stringify());

c = Child.create({a:'a', b:'b', c:'c', d:'d'});
console.log(c.stringify(), c.clone().stringify());
*/
/*
foam.CLASS({
  name: 'JTest',
  properties: [
    'a',
    { class: 'Boolean', name: 'b' },
    { class: 'Int', name: 'c' },
    { class: 'Float', name: 'd' },
    { class: 'String', name: 'e' },
    { class: 'Array', name: 'f' },
  ]
});

var t = JTest.create();
var t2 = JTest.create({b: true, c: 42, d: 4.5, e: 'foobar', f: []});
var t3 = JTest.create({b: true, c: 42, d: 4.5, e: 'foobar', f: [1,2,3]});
console.log(foam.json.Storage.stringify(t));
console.log(foam.json.Storage.stringify(t2));
console.log(foam.json.Storage.stringify(t3));
*/

function foo(/* Int */ i, /* String */ s, /* FObject */ o) {
  console.log('foo');
}

console.log(foam.Function.argNames(foo));
console.log(foam.Function.args(foo));

foam.CLASS({
  name: 'Test',

  xxxaxioms: [
    foam.core.MultiMethod.create({
      methodName: 'foo',
      code: function() {
        return 'NoArgs';
      }
    }),
    foam.core.MultiMethod.create({
      methodName: 'foo',
      code: function(/*String*/ str) {
        return 'String: ' + str;
      }
    }),
    foam.core.MultiMethod.create({
      methodName: 'foo',
      code: function(/*Float*/ f) {
        return 'Float: ' + f;
      }
    })
  ]
});

var t = Test.create();


foam.CLASS({
  name: 'RefTest',
});
foam.CLASS({
  refines: 'RefTest',
});
console.log('1: ', RefTest.create());
foam.CLASS({
  refines: 'RefTest',
  properties: ['f1']
});
console.log('2: ', RefTest.create());



console.log('-------------');

foam.ENUM({
  name: 'IssueStatus',

  // Enums share many features with regular classes, the properties
  // and methods we want our enums to have are defined as follows.
  properties: [
    {
      class: 'Boolean',
      name: 'consideredOpen',
      value: true
    }
  ],

  methods: [
    function foo() {
      return this.label + ( this.consideredOpen ? ' is' : ' is not' ) +
          ' considered open.';
    }
  ],

  // Use the values: key to define the actual Enum Values that we
  // want to exist.
  values: [
    {
      name: 'OPEN'
    },
    {
      // The ordinal can be specified explicitly.
      name: 'CLOSED',
      ordinal: 100
    },
    {
      // If the ordinal isn't given explicitly it is auto assigned as
      // the previous ordinal + 1
      name: 'ASSIGNED'
    },
    {
      // You can specify the label, which will be used when rendering in a
      // combo box or similar
      name: 'UNVERIFIED',
      label: 'Unverified'
    },
    {
      // Values for additional properties to your enum are also defined
      // inline.
      name: 'FIXED',
      label: 'Fixed',
      consideredOpen: false
    }
  ]
});

console.log('open', IssueStatus.OPEN.name); // outputs "OPEN"
console.log(true, IssueStatus.ASSIGNED.consideredOpen); // outputs "true"

// Enum value ordinals can be specified.
console.log(100, IssueStatus.CLOSED.ordinal); // outputs 100
// values without specified ordinals get auto assigned.
console.log(101, IssueStatus.ASSIGNED.ordinal); // outputs 101

// Methods can be called on the enum values.
// outputs "Fixed is not considered open."
console.log(IssueStatus.FIXED.foo());

// To store enums on a class, it is recommended to use the Enum property
// type.
foam.CLASS({
  name: 'Issue',
  properties: [
    {
      class: 'Enum',
      of: 'IssueStatus',
      name: 'status'
    }
  ]
});


var issue = Issue.create({ status: IssueStatus.UNVERIFIED });
console.log('unverified: ', issue.status, issue.status.cls_.id, 'label: ', issue.status.label); // outputs "Unverified"

// Enum properties give you some convenient adapting.
// You can set the property to the ordinal or the
// name of an enum, and it will set the property
// to the correct Enum value.

issue.status = 100;

console.log(true, issue.status === IssueStatus.CLOSED); // is true

// Enum properties also allow you to assign them via the name
// of the enum.

issue.status = "ASSIGNED"
console.log(true, issue.status === IssueStatus.ASSIGNED); // is true

console.log(IssueStatus.VALUES, IssueStatus.CLOSED.VALUES);




foam.CLASS({
  name: 'DateTimeTest',
  properties: [
    'id',
    {
      class: 'Date',
      name: 'date'
    },
    {
      class: 'DateTime',
      name: 'dateTime'
    }
  ]
});

var dt = DateTimeTest.create();
foam.u2.DetailView.create({data: dt}).write();
foam.u2.DetailView.create({data: dt}).write();

      foam.ENUM({
        name: 'BadEnum',
        values: [
          {
            name: 'a',
          },
          {
            name: 'b',
            ordinal: 0
          }
        ]
      });

foam.ENUM({
  name: 'DaysOfWeek',
  values: [
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY'
  ]
});

console.log(DaysOfWeek.VALUES);



  foam.CLASS({
    name: 'View',
    axioms: [ foam.pattern.Faceted.create() ],
    properties: [ 'of' ],
    methods: [ function view() { return 'default' } ]
  });

  foam.CLASS({name: 'A'});
  foam.CLASS({name: 'B'});
  foam.CLASS({name: 'C'});
  foam.CLASS({name: 'BView', extends: 'View', methods: [function view() { return 'BView'; }]});
  foam.CLASS({name: 'CView', extends: 'View', methods: [function view() { return 'CView'; }]});

console.log(View.create({of: A}).view());
console.log(View.create({of: B}).view());
console.log(View.create({of: C}).view());
