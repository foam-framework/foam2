/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// Refinement Pattern
// Refinement upgrades the existing class rather than create a new sub-class
// In addition to being extended, a Class can also be refined.
// Refinement upgrades the existing class rather than create a
// new sub-class. In the following example we add 'salary' to
// the person class, rather than creating a new Employee sub-class.

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

foam.CLASS({
  refines: 'Person',
  properties: [ {
    class: 'Float',
    name: 'salary',
    value: 0
  } ], //TODO class vs of?
  methods: [
    function toString() {
      return this.name + ' ' + this.sex + ' ' + this.salary;
    }
  ]
});
var n = Person.create({
  name: 'Bob',
  sex: 'M',
  salary: 40000
});

var p = Person.create({
  name: 'John',
  sex: 'M'
});
console.log("New person after refinement:", n.toString());
// The already created person, John, now has a salary too!
console.log("Old person after refinement:", p.toString());

// Properties in classes can be changed in a refinement
console.log("Old type of Person.salary:", Person.SALARY.cls_.name);

// Change the salary property type, add a default value
foam.CLASS({
  refines: 'Person',
  properties: [ {
    name: 'salary',
    value: 30000
  } ]
});

console.log("New type of Person.salary:", Person.SALARY.cls_.name); // foam.core.Property

var o = Person.create({
  name: 'John'
});
console.log("Now with default value:", o.salary);                   // 30000
console.log("And original person gets the default too:", p.salary); // 30000


// Refining Properties is currently unsupported and unlikely to be supported.
// Refining a type of Property after classes have already been created using
// the old version will not propagate the changes to those existing classes.
foam.CLASS({
  name: 'Salary',
  extends: 'Float'
});
foam.CLASS({
  name: 'Emp',
  properties: [ {
    class: 'Salary',
    name: 'salary'
  } ]
});

// Since Classes are not constructed until used, we create an instance to force
// Emp to be loaded (otherwise the refinement will appear to work):
console.log("Emp.salary before:", Emp.create().salary); // 0
foam.CLASS({
  refines: 'Salary',
  properties: [ {
    name: 'value',
    value: 30000
  } ]
});
console.log("Emp.salary refined:", Emp.create().salary); // 0
//TODO results ??????


// Refine foam.core.Property Class
// Property has special support for refinement or existing Property instances
foam.CLASS({
  name: 'Emp',
  properties: [ {
    class: 'Float',
    name: 'salary'
  } ]
});
Emp.create();
foam.CLASS({
  refines: 'Float',
  properties: [ [ 'javaClass', 'Float' ] ]
}); //TODO more details
console.log(Emp.SALARY.javaClass); // Float

// Cannot Refine a SuperProperty Class unsupported and unlikely to be supported
foam.CLASS({
  name: 'SuperClass',
  properties: [ 'p1' ]
});
foam.CLASS({
  name: 'SubClass',
  extends: 'SuperClass',
  properties: [ 'p1' ]
});
console.log('Before: super: ', SuperClass.create().p1, 'sub: ', SubClass.create().p1); 
// super:  undefined sub:  undefined

foam.CLASS({
  refines: 'SuperClass',
  properties: [ {
    name: 'p1',
    value: 42
  } ]
});
console.log('Refined: super: ', SuperClass.create().p1, 'sub: ', SubClass.create().p1); 
// super:  42 sub:  undefined

// Cannot Refine a DoubleSuperProperty Class (Two inheritance levels)
foam.CLASS({
  name: 'SuperClass',
  properties: [ 'p1' ]
});
foam.CLASS({
  name: 'MidClass',
  extends: 'SuperClass'
});
foam.CLASS({
  name: 'SubClass',
  extends: 'MidClass',
  properties: [ 'p1' ]
});
console.log('Before: super: ', SuperClass.create().p1, 'mid: ', MidClass.create().p1, 'sub: ', SubClass.create().p1);

// MidClass will see the refinement since it does not redefine the p1 property, so it
// uses SuperClass' directly. SubClass keeps its own definition, and doesn't see the changes
// to SuperClass.p1
foam.CLASS({
  refines: 'SuperClass',
  properties: [ {
    name: 'p1',
    value: 42
  } ]
});
console.log('Refined: super: ', SuperClass.create().p1, 'mid: ', MidClass.create().p1, 'sub: ', SubClass.create().p1); 
// super:  42 mid:  42 sub:  undefined
