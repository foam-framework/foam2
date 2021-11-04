/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// Inheritance
// A basic Person class
// Methods in subclasses can override methods from ancestor classes, as is
// done below with toString().  Employee.toString() calls its parent classes
// toString() method by calling 'this.SUPER()'.
foam.CLASS({
  name: 'Person',
  properties: [ 'name', 'sex' ],
  methods: [
    function toString() {
      return this.name + ' ' + this.sex;
    }
  ]
});

// Classes can be subclassed with extends
// Methods in subclasses can override methods from ancestor classes, as is
// done below with toString(). Employee.toString() calls its parent classes
// toString() method by calling 'this.SUPER()'.
foam.CLASS({
  name: 'Employee',
  extends: 'Person',
  properties: [ 'salary' ],
  methods: [
    function toString() {
      return this.SUPER() + ' ' + this.salary;
    }
  ]
});

var p = Person.create({
  name: 'John',
  sex: 'M'
});
console.log("Person:", p.toString());

var e = Employee.create({
  name: 'Jane',
  sex: 'F',
  salary: 50000
});
console.log("Employee:", e.toString());

// Test if one class is a sub-class of another
console.log("Is Employee a subclass of Person?", Person.isSubClass(Employee)); // true
console.log("Is Person a subclass of Employee?", Employee.isSubClass(Person)); // false
console.log("Is Employee a Instance of Person?", Person.isInstance(Employee)); // true

// A Class is considered a sub-class of itself
console.log("Is Person a subclass of Person?", Person.isSubClass(Person)); // true

// FObject is the root class of all other classes
console.log("Is Employee an FObject?", foam.core.FObject.isSubClass(Employee)); // true
console.log("Is Person an FObject?", foam.core.FObject.isSubClass(Person));     // true

// Classes can specify a package
foam.CLASS({
  package: 'com.acme',
  name: 'Test',
  methods: [ function foo() {
    console.log('Hello, I am foo() from com.acme.Test');
  } ]
});
com.acme.Test.create().foo();

// isSubClass() isn't confused by classes with the same name in different packages
foam.CLASS({
  package: 'com.acme.package',
  name: 'Person'
});
// The two Person classes are independent of each other
console.log("Is Person a packaged-Person?", com.acme.package.Person.isSubClass(Person)); // false
console.log("Is packaged-Person a Person?", Person.isSubClass(com.acme.package.Person)); // false


// Property Inheritance: Properties in subclasses inherit from the parent's Properties
// FOAM also has Property-Inheritance.
// Test that a sub-class Property inherits its parent Property's class
foam.CLASS({
  name: 'PropertyInheritA',
  properties: [ {
    class: 'Boolean',
    name: 'sameName'
  } ]
});
foam.CLASS({
  name: 'PropertyInheritB',
  extends: 'PropertyInheritA',
  properties: [ 'sameName' ]
});
console.log(PropertyInheritA.SAME_NAME.cls_.id, PropertyInheritB.SAME_NAME.cls_.id); // TODO is SAME_NAME a slot?
// foam.core.Boolean foam.core.Boolean