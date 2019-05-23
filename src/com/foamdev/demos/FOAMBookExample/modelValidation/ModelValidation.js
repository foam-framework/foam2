/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// Model validation
// Model validation property name exists: Properties must have names
foam.CLASS({
  name: 'ValidationTestName',
  properties: [
    { name: '' }// Uncaught (in promise) Required property
                // foam.core.Property.name not defined.
  ]
});
// ValidationTestName.model_.validate();

// Model validation property slot name: Properties names must not end with $
foam.CLASS({
  name: 'DollarValidationTest',
  properties: [
    { name: 'name$' } // Assertion failed: Illegal Property Name: Can't end with
                      // "$": name$
  ]
});
// DollarValidationTest.model_.validate();

// Model validation property constants: Property constants must not conflict
foam.CLASS({
  name: 'ConstantConflictTest',
  properties: [ 'firstName', 'FirstName' ]// Uncaught (in promise) Class
                                          // constant conflict:
                                          // ConstantConflictTest.FIRST_NAME
                                          // from: FirstName and firstName
});
// ConstantConflictTest.model_.validate();


// Model validation property same name: Properties must not have the same name
// Methods must not have the same name
foam.CLASS({
  name: 'AxiomConflict1',
  properties: [ 'sameName', 'sameName' ],// Assertion failed: Axiom name
                                          // conflict in AxiomConflict1 :
                                          // sameName
  methods: [ function sameName() {}, function sameName() {} ]// Assertion
                                                              // failed: Axiom
                                                              // name conflict
                                                              // in
                                                              // AxiomConflict1
                                                              // : sameName
});
// AxiomConflict1.model_.validate();


//Axiom validation same name: Axioms must not have the same name
foam.CLASS({
  name: 'AxiomConflict3',
  properties: [ 'sameName' ],// Assertion failed: Axiom name conflict in
                              // AxiomConflict3 : sameName
  methods: [ function sameName() {} ]
});
// AxiomConflict3.model_.validate();


// Axiom validation sub property type: A Property cannot be changed to a
// non-Property
foam.CLASS({
  name: 'AxiomChangeSuper',
  properties: [ 'sameName' ] // property
});
foam.CLASS({
  name: 'AxiomChangeSub',
  extends: 'AxiomChangeSuper',
  methods: [ function sameName() {} ] // now it's a method? no!
// Uncaught (in promise) Illegal to change Property to non-Property:
// AxiomChangeSub.sameName changed to foam.core.Method
});
// AxiomChangeSub.model_.validate();


// Axiom validation class change: Warn if an Axiom changes its class
foam.CLASS({
  name: 'AxiomChangeSuper2',
  methods: [ function sameName() {} ]
});
foam.CLASS({
  name: 'AxiomChangeSub2',
  extends: 'AxiomChangeSuper2',
  properties: [ 'sameName' ] // Warn Change of Axiom AxiomChangeSub2.sameName
                              // type from foam.core.Method to
                              // foam.core.Property
});
// AxiomChangeSub2.model_.validate();


// Property required: Properties marked required must have values supplied to create()
// Required
foam.CLASS({
  name: 'ValidationRequiredPropertyTest',
  properties: [
    {
      name: 'test',
      required: true
    }
  ]
});

var o = ValidationRequiredPropertyTest.create({
  test: '42'
});
// o.validate();
console.log('-');
var o = ValidationRequiredPropertyTest.create(); // Uncaught (in promise)
                                                  // Required property
                                                  // ValidationRequiredPropertyTest.test
                                                  // not defined.
// o.validate();


// Unknown Properties: Unknown Model and Property properties are detected
foam.CLASS({
  name: 'ValidationTest',
  unknown: 'foobar',
  properties: [
    {
      name: 'test',
      unknown: 'foobar'
    } // warn Assertion failed: ValidationTest is already registered in this
      // context.
  ]
});
// ValidationTest.model_.validate();

// Model validation extends refines: Extends and refines are mutually-exclusive
foam.CLASS({
  name: 'EandRTest',
  extends: 'FObject',
  refines: 'Model' // Uncaught (in promise) EandRTest: "extends" and "refines"
                    // are mutually exclusive.
});
// EandRTest.model_.validate();


// Action validation code: Actions must have code
foam.CLASS({
  name: 'ActionCodeValidation',
  actions: [
    { name: 'test' }// Uncaught (in promise) Required property
                    // foam.core.Action.code not defined.
  ]
});
// ActionCodeValidation.model_.validate();

// Property validation single accessor: Properties may only have one of factory,
// value, expression, or getter; one of setter or adapt+preset+postset
var setTo;
foam.CLASS({
  name: 'PropertyValidationTest',
  properties: [
    {
      name: 't1',
      setter: function() {
        setTo = 1;
        this.instance_.t1 = 1;
      }, // OK
      adapt: function(_, v) {
        return v + 1;
      },
      preSet: function(_, v) {
        return v + 1;
      },
      postSet: function(_, v) {
        setTo = v + 1;
      }
    },
    {
      name: 't2',
      getter: function() {
        return 42;
      }, // OK
      factory: function() {
        return 43;
      },
      expression: function() {
        return 44;
      },
      value: 45
    }
  ]
});
// PropertyValidationTest.model_.validate();
// PropertyValidationTest.create().t2=42