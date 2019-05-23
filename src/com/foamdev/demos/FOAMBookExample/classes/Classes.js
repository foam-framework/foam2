/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// Classes

// Primary Key: Classes can have a unique-id or primary-key
// By default, this is simply the field named 'id'.
foam.CLASS({
  name: 'Invoice',
  properties: [ 'id', 'desc', 'amount' ]
});
var o = Invoice.create({
  id: 1,
  desc: 'Duct Cleaning',
  amount: 99.99
});
console.log(o.id);

// Primary Key ids: Use the ids property to specify that the primary key be
// something other than id
// You can also use the 'ids' property to specify that
// the primary key be something other than 'id'.
// In this case, 'id' will become an psedo-property for
// accessing the real 'invoiceId' property.
foam.CLASS({
  name: 'Invoice2',
  ids: [ 'invoiceId' ],
  properties: [ 'invoiceId', 'desc', 'amount' ]
});
var o = Invoice2.create({
  invoiceId: 23,
  desc: 'Duct Cleaning',
  amount: 99.99
});
console.log("Id:", o.id, "invoiceId:", o.invoiceId);

// Primary Key multipart Class: Multi-part unique identifiers are also supported
// by setting ids
foam.CLASS({
  name: 'Invoice3',
  ids: [ 'customerId', 'invoiceId' ],
  properties: [ 'customerId', 'invoiceId', 'desc', 'amount' ]
});

// Primary Key multipart: Multi-part unique identifiers are also supported by setting ids
var o = Invoice3.create({
  customerId: 1,
  invoiceId: 1,
  desc: 'Duct Cleaning',
  amount: 99.99
});
console.log("initial           id:", o.id, "customerId:", o.customerId, "invoiceId:", o.invoiceId);
// setting id propagates the changes to the properties that make up the
// multipart id:
o.id = [ 2, 3 ];
console.log("after setting id, id:", o.id, "customerId:", o.customerId, "invoiceId:", o.invoiceId);

// Primary Key multipart comparison: Multi-part ids are comparable
var results = '';
results += Invoice3.ID.compare(
  Invoice3.create({
    customerId: 1,
    invoiceId: 2
  }),
  Invoice3.create({
    customerId: 1,
    invoiceId: 1
  }));

results += ", " + Invoice3.ID.compare(
  Invoice3.create({
    customerId: 1,
    invoiceId: 1
  }),
  Invoice3.create({
    customerId: 1,
    invoiceId: 2
  }));

results += ", " + Invoice3.ID.compare(
  Invoice3.create({
    customerId: 1,
    invoiceId: 1
  }),
  Invoice3.create({
    customerId: 1,
    invoiceId: 1
  }));

results += ", " + Invoice3.ID.compare(
  Invoice3.create({
    customerId: 2,
    invoiceId: 1
  }),
  Invoice3.create({
    customerId: 1,
    invoiceId: 1
  }));

results += ", " + Invoice3.ID.compare(
  Invoice3.create({
    customerId: 1,
    invoiceId: 1
  }),
  Invoice3.create({
    customerId: 2,
    invoiceId: 1
  }));

console.log("Comparison results:", results);

// A basic Person class
foam.CLASS({
  name: 'Person',
  properties: [ 'name', 'sex' ],
  methods: [
    function toString() {
      return this.name + ' ' + this.sex;
    }
  ]
});

// Object UID: All Objects have a unique identifier, accessible with the .$UID property
var a = {},
  b = [],
  c = Person.create();
console.log(a.$UID, b.$UID, c.$UID);
// toBeAssertedThat(a.$UID).not.toEqual(b.$UID);
// toBeAssertedThat(b.$UID).not.toEqual(c.$UID);

/*
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
     1. setter()//todo test

  A sub-class or refinement can include a partial Property definition which
  will override or add meta-information to the Property.
*/

// Classes can define Constants

foam.CLASS({
  name: 'ConstantTest',
  constants: {
    MEANING_OF_LIFE: 42,
    FAVOURITE_COLOR: 'green'
  }
});
var o = ConstantTest.create();
console.log("Constant values:", o.MEANING_OF_LIFE, o.FAVOURITE_COLOR);

// Constants can also be accessed from the Class
console.log("ConstantTest constants:", ConstantTest.MEANING_OF_LIFE, ConstantTest.FAVOURITE_COLOR);
console.log("o.cls_ constants:", o.cls_.MEANING_OF_LIFE, o.cls_.FAVOURITE_COLOR);

// Constants are constant, and cannot be assigned
o.MEANING_OF_LIFE = 43;
console.log("Constant after setting to 43:", o.MEANING_OF_LIFE);

// Access to the structural feature of object

foam.CLASS({
  package: 'com.foam.demos.FOAMBookExample.Controller',
  name: 'TestClass',
  extends: 'foam.u2.Element',

  description: 'Define a new class with foam.CLASS',

  properties: [],

  methods: [
    /*
      function initE() {//TODO when to use it. -> in the vue
    },*/
    {
      name: 'init',
      code: function() {
        console.log('this in the init');

        foam.CLASS({ // inner class definition
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
            function f1() {
              return 1;
            },
            // long-form
            {
              name: 'f2',
              code: function() {
                return 2;
              }
            }
          ]
        });
        console.log('access to the fc1');
        console.log(Test.create().f1());
      },
      postTestCode: function() {
        // toBeAssertedThat(Test).not.toBeUndefined();
        a = 'hello';
      }
    //TODO We need to access to check the postTestCode is executed?
    }
  ]
});

com.foam.demos.FOAMBookExample.Controller.TestClass.create();

// Objects have a reference to their class in .cls_
var o = Test.create({
  a: 3,
  b: 'hello'
});
console.log("Class object:", o.cls_); //'Test'

// Call Methods on the Test instance
console.log("Methods return: ", o.f1(), o.f2()); // 1 2
//TODO private or protected function; function are context oriented

// Properties accept value changes as normal
o.a++;
o.b = 'bye';
console.log('New values: a: ' + o.a + ', b: ' + o.b); // 4 'bye'

// Multiple properties can be updated at once using copyFrom()
o.copyFrom({
  a: 42,
  b: 'rosebud'
});
console.log('New values: a: ' + o.a + ', b: ' + o.b); // 42 'rosebud'