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

/** Foam By Example */
var FBE = [
  {
    name: 'Test Class',
    description: 'Define a new class with foam.CLASS',
    code: function() {
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
    },
    postTestCode: function() {
      //toBeAssertedThat(Test).not.toBeUndefined();
    }
  },
  {
    name: 'Test describe',
    description: 'Use class.describe() to learn about the class',
    dependencies: [ 'Test Class' ],
    code: function() {
      Test.describe();
    },
    postTestCode: function() {
    }
  },
  {
    name: 'Test create',
    description: 'Create an instance of Test',
    dependencies: [ 'Test Class' ],
    code: function() {
      var o = Test.create();
      console.log("Class: ", o);
      console.log('a: ' + o.a + ', b: ' + o.b);
    },
    postTestCode: function() {
      //toBeAssertedThat(o.a).toBeUndefined();
      //toBeAssertedThat(o.b).toBeUndefined();
    }
  },
  {
    name: 'Test create with values',
    description: 'Create an instance with a map argument to initialize properties',
    dependencies: [ 'Test Class' ],
    code: function() {
      var o = Test.create({ a: 3, b: 'hello' });
      console.log("Class: ", o);
      console.log('a: ' + o.a + ', b: ' + o.b);
    },
    postTestCode: function() {
      //toBeAssertedThat(o.a).toEqual(3);
      //toBeAssertedThat(o.b).toEqual('hello');
    }
  },
  {
    name: 'Class reference',
    description: 'Objects have a reference to their class in .cls_',
    dependencies: [ 'Test create with values' ],
    code: function() {
      console.log("Class object:", o.cls_);
    },
    postTestCode: function() {
      //toBeAssertedThat(o.cls_.name).toEqual('Test');
    }
  },
  {
    name: 'Test isInstance',
    description: 'Test Class membership with Class.isInstance()',
    dependencies: [ 'Test create with values' ],
    code: function() {
      console.log('Test.isInstance(o)?', Test.isInstance(o));
      console.log('Test.isInstance("foo")?', Test.isInstance("Test"));
    },
    postTestCode: function() {
      //toBeAssertedThat(Test.isInstance(o)).toBe(true);
      //toBeAssertedThat(Test.isInstance("Test")).toBe(false);
    }
  },
  {
    name: 'Test Methods',
    description: 'Call Methods on the Test instance',
    dependencies: [ 'Test create with values' ],
    code: function() {
      console.log("Methods return: ", o.f1(), o.f2());
    },
    postTestCode: function() {
      //toBeAssertedThat(o.f1()).toEqual(1);
      //toBeAssertedThat(o.f2()).toEqual(2);
    }
  },
  {
    name: 'Update Properties',
    description: 'Properties accept value changes as normal',
    dependencies: [ 'Test create with values' ],
    code: function() {
      o.a++;
      o.b = 'bye';
      console.log('New values: a: ' + o.a + ', b: ' + o.b);
    },
    postTestCode: function() {
      //toBeAssertedThat(o.a).toEqual(4);
      //toBeAssertedThat(o.b).toEqual('bye');
    }
  },
  {
    name: 'Test copyFrom',
    description: 'Multiple properties can be updated at once using copyFrom()',
    dependencies: [ 'Test create' ],
    code: function() {
      o.copyFrom({a: 42, b: 'rosebud'});
      console.log('New values: a: ' + o.a + ', b: ' + o.b);
    },
    postTestCode: function() {
      //toBeAssertedThat(o.a).toEqual(42);
      //toBeAssertedThat(o.b).toEqual('rosebud');
    }
  },
  {
    name: 'Test toString',
    description: 'Call toString on an object',
    dependencies: [ 'Test create with values' ],
    code: function() {
      console.log("toString:", o.toString());
    },
    postTestCode: function() {
      //toBeAssertedThat(o.toString()).toEqual('Test');
    }
  },
  {
    name: 'Describe instance',
    description: 'Call describe() on an object to see its Property values',
    dependencies: [ 'Test create with values' ],
    code: function() {
      o.describe();
    },
    postTestCode: function() {
    }
  },
  {
    name: 'Properties and Methods are types of Axioms',
    description: 'Get an array of all Axioms belonging to a Class by calling getAxioms',
    dependencies: [ 'Test Class' ],
    code: function() {
      Test.getAxioms().forEach(function(a) {
        console.log(a.cls_ && a.cls_.name, a.name);
      });
    },
    postTestCode: function() {
      // TODO: improve this, maybe search for some that should be present
      //toBeAssertedThat(Test.getAxioms().length).toBeGreaterThan(4);
    }
  },
  {
    name: 'Test getAxiomByName',
    description: 'Find an Axiom for a class using getAxiomByName',
    dependencies: [ 'Test Class' ],
    code: function() {
      var a = Test.getAxiomByName('a');
      console.log(a.cls_.name, a.name);
    },
    postTestCode: function() {
    }
  },
  {
    name: 'Test getAxiomsByClass',
    description: 'Find all Axioms of a particular class using getAxiomsByClass',
    dependencies: [ 'Test Class' ],
    code: function() {
      Test.getAxiomsByClass(foam.core.Method).forEach(function(a) {
        console.log(a.cls_ && a.cls_.name, a.name);
      });
    },
    postTestCode: function() {
    }
  },
  {
    name: 'Test Property constants',
    description: 'Properties are defined on the class as constants',
    dependencies: [ ],
    code: function() {
      console.log("Method CODE property constant:", foam.core.Method.CODE);
      foam.core.Method.CODE.describe();
    },
    postTestCode: function() {
      //toBeAssertedThat(foam.core.Method.CODE.name).toEqual("code");
    }
  },
  {
    name: 'Property mapping',
    description: 'Property constants contain map functions',
    dependencies: [ 'Test Class' ],
    code: function() {
      // foam.core.Method.NAME.f(obj) returns obj.name
      console.log("Method names in Test:",
        Test
          .getAxiomsByClass(foam.core.Method)
          .map(foam.core.Method.NAME.f)
          .join(', ')
      );
    },
    postTestCode: function() {
      //toBeAssertedThat(foam.core.Method.NAME.f).not.toBeUndefined();
    }
  },
  {
    name: 'Property comparators',
    description: 'Property constants contain comparators',
    dependencies: [ 'Test Class' ],
    code: function() {
      // foam.core.Method.NAME.compare is a compare function
      // that properly compares values of NAME.
      console.log("Method names in Test, sorted:",
        Test
          .getAxiomsByClass(foam.core.Method)
          .sort(foam.core.Method.NAME.compare)
          .map(foam.core.Method.NAME.f)
          .join(', ')
      );
    },
    postTestCode: function() {
    }
  },
  {
    name: 'Test init',
    description: 'If a Class defineds an init() method, it\'s called when an object is created.',
    dependencies: [  ],
    code: function() {
      foam.CLASS({
        name: 'InitTest',
        properties: [ 'a' ],
        methods: [ function init() { this.a = 'just born!'; } ]
      });
      var o = InitTest.create();
      console.log("Initialized value:", o.a);
    },
    postTestCode: function() {
      //toBeAssertedThat(o.a).toEqual('just born!');
    }
  },
  {
    name: 'Create default values',
    description: 'Default Values can be defined for Properties',
    dependencies: [  ],
    code: function() {
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
    },
    postTestCode: function() {
      //toBeAssertedThat(o.a).toEqual(42);
      //toBeAssertedThat(o.b).toEqual('foo');
      //toBeAssertedThat(o.c).toBeUndefined();
    }
  },
  {
    name: 'Test hasOwnProperty',
    description: 'FObject.hasOwnProperty() tells you if a Property has been set',
    dependencies: [ 'Create default values' ],
    code: function() {
      console.log("Before setting:", o.hasOwnProperty('a'), o.hasOwnProperty('b'), o.hasOwnProperty('c'));
      o.a = 99;
      o.c = 'test';
      console.log("After setting a, c:", o.hasOwnProperty('a'), o.hasOwnProperty('b'), o.hasOwnProperty('c'));
    },
    postTestCode: function() {
      //toBeAssertedThat(o.hasOwnProperty('a')).toBe(true);
      //toBeAssertedThat(o.hasOwnProperty('b')).toBe(false);
      //toBeAssertedThat(o.hasOwnProperty('c')).toBe(true);
    }
  },
  {
    name: 'Test clearProperty',
    description: 'FObject.clearProperty() reverts a value back to its value',
    dependencies: [ 'Test hasOwnProperty' ],
    code: function() {
      console.log("Before clearing:", o.hasOwnProperty('a'), o.a);
      o.clearProperty('a');
      console.log("After clearing:", o.hasOwnProperty('a'), o.a);
    },
    postTestCode: function() {
      //toBeAssertedThat(o.hasOwnProperty('a')).toBe(false);
      //toBeAssertedThat(o.a).toEqual(42);
    }
  },
  {
    name: 'Create factory test',
    description: 'Properties can have factory methods which create their initial value when they are first accessed.',
    dependencies: [ ],
    code: function() {
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
    },
    postTestCode: function() {
    }
  },
  {
    name: 'Test factory running',
    description: 'Factories run once when the property is first accessed',
    dependencies: [ 'Create factory test' ],
    code: function() {
      console.log("Before:    factory run count:", factoryCount);
      console.log("Value:", o.a, " factory run count:", factoryCount);
      // Factory not called value accessed second time:
      console.log("Again:", o.a, " factory run count:", factoryCount);
    },
    postTestCode: function() {
      //toBeAssertedThat(factoryCount).toEqual(1);
    }
  },
  {
    name: 'Test factory not run',
    description: 'Factories do not run if the value is set before being accessed',
    dependencies: [ 'Create factory test' ],
    code: function() {
      // Value supplied in create()
      o = FactoryTest.create({a: 42});
      console.log("Value:", o.a, " factory run count:", factoryCount);

      // Value set before first access
      o = FactoryTest.create();
      o.a = 99;
      console.log("Value:", o.a, " factory run count:", factoryCount);
    },
    postTestCode: function() {
      //toBeAssertedThat(factoryCount).toEqual(0);
    }
  },
  {
    name: 'FactoryTest',
    description: 'Factory is called again if clearProperty() called',
    dependencies: [ 'Create factory test' ],
    code: function() {
      var o = FactoryTest.create();
      console.log("Run factory: ", o.a);
      console.log(" factory run count:", factoryCount);
      o.clearProperty('a');
      console.log("Again:       ", o.a);
      console.log(" factory run count:", factoryCount);
    },
    postTestCode: function() {
      //toBeAssertedThat(factoryCount).toEqual(2);
    }
  },
  {
    name: 'Property Getters and Setters',
    description: 'Properties can define their own getter and setter functions',
    dependencies: [ ],
    code: function() {
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

    },
    postTestCode: function() {
      //toBeAssertedThat(o.diameter).toEqual(20);
      //toBeAssertedThat(o.radius).toEqual(10);
    }
  },
  {
    name: 'Property Adapt',
    description: 'The adapt function is called on a property value update',
    dependencies: [ ],
    code: function() {
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
    },
    postTestCode: function() {
      //toBeAssertedThat(o.flag).toBe(false);
    }
  },
  {
    name: 'Property preSet',
    description: 'The preSet function is called on a property update, after adapt',
    dependencies: [ ],
    code: function() {
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
    },
    postTestCode: function() {
      //toBeAssertedThat(o.a).toEqual('Jonesy');
    }
  },
  {
    name: 'Property postSet',
    description: 'The postSet function is called after a property update',
    dependencies: [ ],
    code: function() {
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
    },
    postTestCode: function() {
      //toBeAssertedThat(lastPostSetValue).toEqual('Green');
    }
  },
  {
    name: 'Property adapt pre post',
    description: 'Properties can define adapt, preSet, and postSet all at once',
    dependencies: [ ],
    code: function() {
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
    },
    postTestCode: function() {
      //toBeAssertedThat(lastPostSetValue).toEqual(13);
    }
  },
  {
    name: 'Create constant test',
    description: 'Classes can define Constants',
    dependencies: [ ],
    code: function() {
      foam.CLASS({
        name: 'ConstantTest',
        constants: {
          MEANING_OF_LIFE: 42,
          FAVOURITE_COLOR: 'green'
        }
      });
      var o = ConstantTest.create();
      console.log("Constant values:", o.MEANING_OF_LIFE, o.FAVOURITE_COLOR);
    },
    postTestCode: function() {
      //toBeAssertedThat(o.MEANING_OF_LIFE).toEqual(42);
      //toBeAssertedThat(o.FAVOURITE_COLOR).toEqual('green');
    }
  },
  {
    name: 'Constants Class access',
    description: 'Constants can also be accessed from the Class',
    dependencies: [ 'Create constant test' ],
    code: function() {
      console.log("ConstantTest constants:", ConstantTest.MEANING_OF_LIFE, ConstantTest.FAVOURITE_COLOR);
      console.log("o.cls_ constants:", o.cls_.MEANING_OF_LIFE, o.cls_.FAVOURITE_COLOR);
    },
    postTestCode: function() {
      //toBeAssertedThat(ContantTest.MEANING_OF_LIFE).toEqual(42);
      //toBeAssertedThat(ContantTest.FAVOURITE_COLOR).toEqual('green');
    }
  },
  {
    name: 'Constants are constant',
    description: 'Constants are constant, and cannot be assigned',
    dependencies: [ 'Create constant test' ],
    code: function() {
      o.MEANING_OF_LIFE = 43;
      console.log("Constant after setting to 43:", o.MEANING_OF_LIFE);
    },
    postTestCode: function() {
      //toBeAssertedThat(o.MEANING_OF_LIFE).toEqual(42);
    }
  },
  {
    name: 'Person Class',
    description: 'A basic Person class',
    dependencies: [ ],
    code: function() {
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
    }
  },
  {
    name: 'Create Person and Employee',
    description: 'Classes can be subclassed with extends',
    dependencies: [ 'Person Class' ],
    code: function() {
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
    },
    postTestCode: function() {
      //toBeAssertedThat(Employee.NAME).not.toBeUndefined();
      //toBeAssertedThat(Person.SALARY).toBeUndefined();
      //toBeAssertedThat(e.toString()).toEqual('Jane F 50000');
    }
  },
  {
    name: 'Test SubClass',
    description: 'Test if one class is a sub-class of another',
    dependencies: [ 'Create Person and Employee' ],
    code: function() {
      console.log("Is Employee a subclass of Person?", Person.isSubClass(Employee));
      console.log("Is Person a subclass of Employee?", Employee.isSubClass(Person));
    },
    postTestCode: function() {
      //toBeAssertedThat(Person.isSubClass(Employee)).toBe(true);
      //toBeAssertedThat(Employee.isSubClass(Person)).toBe(false);
    }
  },
  {
    name: 'Test SubClass self',
    description: 'A Class is considered a sub-class of itself',
    dependencies: [ 'Create Person and Employee' ],
    code: function() {
      console.log("Is Person a subclass of Person?", Person.isSubClass(Person));
    },
    postTestCode: function() {
      //toBeAssertedThat(Person.isSubClass(Person)).toBe(true);
    }
  },
  {
    name: 'Test FObject SubClass',
    description: 'FObject is the root class of all other classes',
    dependencies: [ 'Create Person and Employee' ],
    code: function() {
      console.log("Is Employee an FObject?", foam.core.FObject.isSubClass(Employee));
      console.log("Is Person an FObject?", foam.core.FObject.isSubClass(Person));
    },
    postTestCode: function() {
      //toBeAssertedThat(foam.core.FObject.isSubClass(Employee)).toBe(true);
      //toBeAssertedThat(foam.core.FObject.isSubClass(Person)).toBe(true);
    }
  },
  {
    name: 'Test isSubClass and package',
    description: 'isSubClass() isn\'t confused by classes with the same name in different packages',
    dependencies: [ 'Create Person and Employee' ],
    code: function() {
      foam.CLASS({
        package: 'com.acme.package',
        name: 'Person'
      });
      // The two Person classes are independent of each other
      console.log("Is Person a packaged-Person?", com.acme.package.Person.isSubClass(Person));
      console.log("Is packaged-Person a Person?", Person.isSubClass(com.acme.package.Person));
    },
    postTestCode: function() {
      //toBeAssertedThat(com.acme.package.Person.isSubClass(Person)).toBe(false);
      //toBeAssertedThat(Person.isSubClass(com.acme.package.Person)).toBe(false);
    }
  },
  {
    name: 'Test isSubClass and interfaces',
    description: 'isSubClass() works for interfaces',
    dependencies: [ ],
    code: function() {
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
    },
    postTestCode: function() {
      //toBeAssertedThat(test.ThingI.isSubClass(test.C1)).toBe(true)
    }
  },
  {
    name: 'Test isSubClass sub interfaces',
    description: 'isSubClass() works for sub-interfaces',
    dependencies: [ 'Test isSubClass and interfaces' ],
    code: function() {
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
    },
    postTestCode: function() {
      //toBeAssertedThat(test.ThingI.isSubClass(test.C2)).toBe(true);
      //toBeAssertedThat(test.Thing2I.isSubClass(test.C2)).toBe(true);
      //toBeAssertedThat(test.Thing3I.isSubClass(test.C2)).toBe(false);
    }
  },
  {
    name: 'Test isInstance sub interfaces',
    description: 'isInstance() works for sub-interfaces',
    dependencies: [ 'Test isSubClass sub interfaces' ],
    code: function() {
      console.log("Is o a ThingI?", test.ThingI.isInstance(o));
      console.log("Is o a Thing2I?", test.Thing2I.isInstance(o));
      console.log("Is o a Thing3I?", test.Thing3I.isInstance(o));
      console.log("Is o a C2?", test.C2.isInstance(o));
    },
    postTestCode: function() {
      //toBeAssertedThat(test.ThingI.isInstance(o)).toBe(true);
      //toBeAssertedThat(test.Thing2I.isInstance(o)).toBe(true);
      //toBeAssertedThat(test.Thing3I.isInstance(o)).toBe(false);
      //toBeAssertedThat(test.C2.isInstance(o)).toBe(true);
    }
  },
  {
    name: 'Package imports exports demo',
    description: 'Package and imports/exports demo',
    dependencies: [ ],
    code: function() {
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
    },
    postTestCode: function() {
      //toBeAssertedThat(a.balance).toEqual(90);
      //toBeAssertedThat(s.balance).toEqual(89.95);
    }
  },
  {
    name: 'Class Refinement',
    description: 'Refinement upgrades the existing class rather than create a new sub-class',
    dependencies: [ 'Create Person and Employee' ],
    code: function() {
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
    },
    postTestCode: function() {
      //toBeAssertedThat(Person.SALARY).not.toBeUndefined();
      //toBeAssertedThat(n.salary).toEqual(40000);
      //toBeAssertedThat(p.salary).toEqual(0);
    }
  },
  {
    name: 'Refine a Property',
    description: 'Properties in classes can be changed in a refinement',
    dependencies: [ 'Class Refinement' ],
    code: function() {
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
    },
    postTestCode: function() {
      //toBeAssertedThat(o.salary).toEqual(30000);
      //toBeAssertedThat(p.salary).toEqual(30000);
      //toBeAssertedThat(Person.SALARY.cls_).toBe(foam.core.Property);
    }
  },
  {
    name: 'Cannot Refine a Property Class',
    description: 'Refining Properties is currently unsupported and unlikely to be supported.',
    dependencies: [ ],
    code: function() {
      // Refining a type of Property after classes have already been created using
      // the old version will not propagate the changes to those existing classes.
      foam.CLASS({ name: 'Salary', extends: 'Float' });
      foam.CLASS({ name: 'Emp', properties: [ { class: 'Salary', name: 'salary' } ] });
      // Since Classes are not constructed until used, we create an instance to force
      // Emp to be loaded (otherwise the refinement will appear to work):
      console.log("Emp.salary before:", Emp.create().salary);
      foam.CLASS({ refines: 'Salary', properties: [ { name: 'value', value: 30000 } ]});
      console.log("Emp.salary refined:", Emp.create().salary);
    },
    postTestCode: function() {
      //toBeAssertedThat(Emp.create().salary).toEqual(0);
    }
  },
  {
    name: 'Refine Property',
    description: 'Refine foam.core.Property Class',
    dependencies: [ ],
    code: function() {
      // Property has special support for refinement or existing Property instances
      foam.CLASS({ name: 'Emp', properties: [ { class: 'Float', name: 'salary' } ] });
      Emp.create();
      foam.CLASS({ refines: 'Float', properties: [ [ 'javaClass', 'Float' ] ]});
      console.log(Emp.SALARY.javaClass);
    },
    postTestCode: function() {
      //toBeAssertedThat(Emp.SALARY.javaClass).toEqual('Float');
    }
  },
  {
    name: 'Cannot Refine a SuperProperty Class',
    description: 'Currently unsupported and unlikely to be supported',
    dependencies: [ ],
    code: function() {
      foam.CLASS({ name: 'SuperClass', properties: [ 'p1' ]});
      foam.CLASS({ name: 'SubClass', extends: 'SuperClass', properties: [ 'p1' ]});
      console.log('Before: super: ', SuperClass.create().p1, 'sub: ', SubClass.create().p1);

      foam.CLASS({ refines: 'SuperClass', properties: [ { name: 'p1', value: 42 } ]});
      console.log('Refined: super: ', SuperClass.create().p1, 'sub: ', SubClass.create().p1);
    },
    postTestCode: function() {
      //toBeAssertedThat(SuperClass.create().p1).toEqual(42);
      //toBeAssertedThat(SubClass.create().p1).toBeUndefined();
    }
  },
  {
    name: 'Cannot Refine a DoubleSuperProperty Class',
    description: 'Currently unsupported and unlikely to be supported. Two inheritance levels.',
    dependencies: [ ],
    code: function() {
      foam.CLASS({ name: 'SuperClass', properties: [ 'p1' ]});
      foam.CLASS({ name: 'MidClass', extends: 'SuperClass' });
      foam.CLASS({ name: 'SubClass', extends: 'MidClass', properties: [ 'p1' ]});
      console.log('Before: super: ', SuperClass.create().p1, 'mid: ', MidClass.create().p1, 'sub: ', SubClass.create().p1);

      // MidClass will see the refinement since it does not redefine the p1 property, so it
      // uses SuperClass' directly. SubClass keeps its own definition, and doesn't see the changes
      // to SuperClass.p1
      foam.CLASS({ refines: 'SuperClass', properties: [ { name: 'p1', value: 42 } ]});
      console.log('Refined: super: ', SuperClass.create().p1, 'mid: ', MidClass.create().p1, 'sub: ', SubClass.create().p1);
    },
    postTestCode: function() {
      //toBeAssertedThat(SuperClass.create().p1).toEqual(42);
      //toBeAssertedThat(MidClass.create().p1).toEqual(42);
      //toBeAssertedThat(SubClass.create().p1).toBeUndefined();
    }
  },
  {
    name: 'Create Listeners',
    description: 'Listeners are pre-bound Methods, suitable for use as callbacks (DOM, or otherwise).',
    dependencies: [ ],
    code: function() {
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
    }
  },
  {
    name: 'Test Listeners as methods',
    description: 'Listeners are pre-bound Methods, suitable for use as callbacks (DOM, or otherwise).',
    dependencies: [ 'Create Listeners' ],
    code: function() {
      // When called as methods, the same as Methods.
      o.m1();
      o.l1();
    },
    postTestCode: function() {
      //toBeAssertedThat(o.m1()).toEqual('M1Steve');
      //toBeAssertedThat(o.l1()).toEqual('L1Steve');
    }
  },
  {
    name: 'Test Listener binding',
    description: 'Listeners remember their self, binding "this" automatically',
    dependencies: [ 'Create Listeners' ],
    code: function() {
      // When called as functions, the method forgets its 'self' and doesn't work,
      // but the listener works.
      var m = o.m1;
      var l = o.l1;
      m()
      l();
    },
    postTestCode: function() {
      //toBeAssertedThat(o.m1()).toEqual('M1');
      //toBeAssertedThat(o.l1()).toEqual('L1Steve');
    }
  },
  {
    name: 'Test Merged and Framed validation',
    description: 'It\'s an error to make a listener both isMerged and isFramed',
    dependencies: [ ],
    code: function() {
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
    },
    postTestCode: function() {
      //toBeAssertedThat(function() {
      //  MergedAndFramedTest.create();
      //}).toThrow();
    }
  },
  {
    name: 'Test isMerged',
    description: 'isMerged will merge multiple events',
    dependencies: [ ],
    code: function async() { // TODO: for all async, pass things for postTestCode in promise resolve
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
    },
    postTestCode: function() {
      //toBeAssertedThat(mergedCalls).toEqual(1);
    }
  },
  {
    name: 'Framed Listener Test',
    description: 'isFramed will merge multiple events within an animation frame',
    dependencies: [ ],
    code: function async() {
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
    },
    postTestCode: function() {
      //toBeAssertedThat(framedCalls).toEqual(1);
    }
  },
  {
    name: 'Listener delayed',
    description: 'Decorate a listener with delayed() to delay the execution without merging',
    dependencies: [ ],
    code: function async() {
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

    },
    postTestCode: function() {
      //toBeAssertedThat(callOrder).toEqual('l2l2l1l1');
    }
  },
  {
    name: 'Listener async',
    description: 'async(l) is the same as delayed(l, 0)',
    dependencies: [ ],
    code: function() {
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
    },
    postTestCode: function() {
      //toBeAssertedThat(callOrder).toEqual('d2d2d1d1');
    }
  },
  {
    name: 'Listener SUPER',
    description: 'Listeners, like Methods, have SUPER support.',
    dependencies: [  ],
    code: function() {
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
    },
    postTestCode: function() {
      //toBeAssertedThat(alarms).toEqual('LongAlarm: alarm!alarm!alarm!')
    }
  },
  {
    name: 'Test Actions',
    description: 'Actions are methods which have extra information for GUIs',
    dependencies: [  ],
    code: function() {
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
    },
    postTestCode: function() {
      //toBeAssertedThat(longCalls).toEqual(1);
    }
  },
  {
    name: 'Interface inheritance',
    description: 'Interfaces copy Axioms from another class',
    dependencies: [  ],
    code: function() {
      // In addition to class-inheritance, FOAM also supports
      // interfaces, which are a form of multiple-inheritance which
      // copy Axioms from another model.
      var callOrder = '';
      foam.CLASS({
        name: 'SampleI',
        properties: [ 't1', 't2', 't3' ],
        methods: [
          function tfoo() { console.log('ffoo'); callOrder += 'tfoo'; },
          function tbar() { console.log('tbar'); callOrder += 'tbar'; }
        ]
      });
      foam.CLASS({
        name: 'ImplementsTest',
        implements: ['SampleI'],
        properties: [ 'p1', 'p2', 'p3' ],
        methods: [
          function foo() { console.log('foo'); callOrder += 'foo'; },
          function bar() { console.log('bar'); callOrder += 'bar'; }
        ]
      });
      var tt = ImplementsTest.create({p1:1, t1:2});
      tt.tfoo(); // From SampleI
      tt.foo();
      console.log("Properties p1:", tt.p1, "t1:", tt.t1);
    },
    postTestCode: function() {
      //toBeAssertedThat(callOrder).toEqual('tfoofoo');
    }
  },
  {
    name: 'Interface multiple inheritance',
    description: 'Implements allows multiple inheritance, unlike extends',
    dependencies: [ 'Interface inheritance' ],
    code: function() {
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
    },
    postTestCode: function() {
      //toBeAssertedThat(ImplementsTest2.TB1).not.toBeUndefined();
      //toBeAssertedThat(ImplementsTest2.T1).not.toBeUndefined();
    }
  },
  {
    name: 'Property Inheritance',
    description: 'Properties in subclasses inherit from the parent\'s Properties',
    dependencies: [  ],
    code: function() {
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
    },
    postTestCode: function() {
    }
  },
  {
    name: 'Inner Classes',
    description: 'Inner classes are defined inside another class, not directly available in the global namespace.',
    dependencies: [  ],
    code: function() {
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
    },
    postTestCode: function() {
      //toBeAssertedThat(results).toEqual("1, 2, 5, 10");
    }
  },
  {
    name: 'Inner Class access',
    description: 'Inner classes are only accessible through their outer class',
    dependencies: [ 'Inner Classes' ],
    code: function() {
      console.log("Access through outer:", InnerClassTest.InnerClass1.name);

      // Inner-classes do not appear in the global namespace
      console.log("Available globally?", !! global.InnerClass1);
    },
    postTestCode: function() {
      //toBeAssertedThat(InnerClassTest.InnerClass1).not.toBeUndefined();
      //toBeAssertedThat(global.InnerClass1).toBeUndefined();
    }
  },
  {
    name: 'Inner Enums',
    description: 'Similar to Inner-classes, there\'s also Inner-enums',
    dependencies: [  ],
    code: function() {
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
    },
    postTestCode: function() {
      //toBeAssertedThat(result).toEqual("OPEN / CLOSED");
    }
  },
  {
    name: 'Inner Enum access',
    description: 'Inner-enums can only be accessed through the outer-class',
    dependencies: [  ],
    code: function() {
      console.log("Access through outer:", InnerEnumTest.InnerEnum.name);

      // Inner-enums do not appear in the global namespace
      console.log("Available globally?", !! global.InnerEnum);
    },
    postTestCode: function() {
      //toBeAssertedThat(InnerEnumTest.InnerEnum).not.toBeUndefined();
      //toBeAssertedThat(global.InnerEnum).toBeUndefined();
    }
  },
  {
    name: 'Pub Sub',
    description: 'Objects can publish events and subscribe to other objects',
    dependencies: [ ],
    code: function() {
      foam.CLASS({
        name: 'PubSubTest'
      });
      var o = PubSubTest.create();
    }
  },
  {
    name: 'Subscribing',
    description: 'Objects can publish events and subscribe to other objects',
    dependencies: [ 'Pub Sub' ],
    code: function() {
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
    },
    postTestCode: function() {
      //toBeAssertedThat(globalCalls).toEqual(2);
      //toBeAssertedThat(alarmCalls).toEqual(1);
    }
  },
  {
    name: 'Publish arguments',
    description: 'Any number of arguments can be published',
    dependencies: [ 'Subscribing' ],
    code: function() {
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
    },
    postTestCode: function() {
      //toBeAssertedThat(globalResult).toEqual(' a3 a3 a2 a3 a4 a5 a6 a7 a8 a9 a10 a11 a12');
    }
  },
  {
    name: 'Topics',
    description: 'A Class can declare Topics that it publishes events for',
    dependencies: [  ],
    code: function() {
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
    },
    postTestCode: function() {
      //toBeAssertedThat(normalCalls).toEqual(2);
      //toBeAssertedThat(topicCalls).toEqual(2);
    }
  },
  {
    name: 'propertyChange',
    description: 'Objects implicitly pub events on the propertyChange topic when property values change',
    dependencies: [  ],
    code: function() {
      foam.CLASS({
        name: 'PropertyChangeTest',
        properties: [ 'a', 'b' ]
      });
      o = PropertyChangeTest.create();
      // propertyChange event listeners are called with:
      //   sub  - the subscription object, which can be destroy()ed to end
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
    },
    postTestCode: function() {
      //toBeAssertedThat(anyChangeCalls).toEqual(3);
      //toBeAssertedThat(propAChangeCalls).toEqual(1);
    }
  },
  {
    name: 'Unsubscribe from subscriber',
    description: '1. Call .destroy() on the Destroyable that sub() returns',
    dependencies: [ 'Pub Sub' ],
    code: function() {

      var calls = 0;
      var l = function(sub, name) {
        console.log('Event:', name);
        calls += 1;
      };

      var sub = o.sub(l);
      o.pub('fire');
      sub.destroy();
      o.pub("fire again, but nobody's listenering");
    },
    postTestCode: function() {
      //toBeAssertedThat(calls).toEqual(1);
    }
  },
  {
    name: 'Unsubscribe from listener',
    description: '2. Destroy the subscription, which is supplied to the listener',
    dependencies: [ 'Pub Sub' ],
    code: function() {
      var calls = 0;
      var once = function(sub, name) {
        console.log('Event:', name);
        calls += 1;
        // stop listening
        sub.destroy();
      };

      o.sub(once);
      o.pub('fire');
      o.pub("fire again, but nobody's listening");
    },
    postTestCode: function() {
      //toBeAssertedThat(calls).toEqual(1);
    }
  },
  {
    name: 'Unsubscribe with oneTime helper',
    description: '3. If you only want to receive the first event, use foam.events.oneTime()',
    dependencies: [ 'Pub Sub' ],
    code: function() {
      // If you only want to receive the first event, decorate your
      // listener with foam.events.oneTime() and it will cancel the subscription
      // when it receives the first event.
      o.sub(foam.events.oneTime(function() {
        console.log.apply(console.log, arguments);
      }));

      o.pub('fire');
      o.pub("fire again, but nobody's listenering");
    },
    postTestCode: function() {

    }
  },
  {
    name: 'Slot get',
    description: 'Slots are like Object-Oriented pointers',
    dependencies: [ 'Person Class' ],
    code: function() {
      // A property's slot is accessed as 'name'$.
      // get() is used to dereference the value of a slot
      var p = Person.create({ name: 'Bob' });
      var dyn = p.name$;
      console.log("Person name:", dyn.get());
    },
    postTestCode: function() {
      //toBeAssertedThat(dyn.get()).toEqual('Bob');
    }
  },
  {
    name: 'Slot set',
    description: 'set() is used to set a Slot\'s value',
    dependencies: [ 'Slot get' ],
    code: function() {
      dyn.set('John'); // sets p.name implicitly
      console.log("Name after set:", p.name, "get():", dyn.get());
    },
    postTestCode: function() {
      //toBeAssertedThat(p.name).toEqual('John');
    }
  },
  {
    name: 'Slot get with slot method',
    description: 'Calling obj.slot(\'name\') is the same as obj.name$',
    dependencies: [ 'Person Class' ],
    code: function() {
      var p = Person.create({name: 'Bob'});

      var dyn = p.slot('name'); // same as p.name$
      console.log("slot value:", dyn.get());

      dyn.set('John');
      console.log("after set:", dyn.get());
    },
    postTestCode: function() {
      //toBeAssertedThat(p.name).toEqual('John');
    }
  },
  {
    name: 'Slot nesting',
    description: 'Slots can be nested with dot() to bind to a sub-property of a property value',
    dependencies: [ 'Person Class' ],
    code: function() {
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
    },
    postTestCode: function() {
      //toBeAssertedThat(changes).toEqual("George Ringo Paul George Ringo ");
    }
  },
  {
    name: 'Subscription nesting',
    description: 'Subscribe using valueSub() of the slot, automatically resubscribed as the value changes',
    dependencies: [  ],
    code: function() {
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
    },
    postTestCode: function() {
      //toBeAssertedThat(changes).toEqual("propertyChange:Peter propertyChange:Ringo test:undefined ");
    }
  },
  {
    name: 'Data Binding two way',
    description: 'Assiging one slot to another binds their values',
    dependencies: [ 'Person Class' ],
    code: function() {
      // Two-Way Data-Binding
      // Slots can be assigned, causing two values to be
      // bound to the same value.
      var p1 = Person.create(), p2 = Person.create();

      p1.name$ = p2.name$;
      p1.name = 'John'; // also sets p2.name
      console.log("Assigned first:", p1.name, p2.name);

      p2.name = 'Steve'; // also sets p1.name
      console.log("Assigned second: ", p1.name, p2.name);
    },
    postTestCode: function() {
      //toBeAssertedThat(p1.name).toEqual(p2.name);
    }
  },
  {
    name: 'Data Binding linkFrom',
    description: 'Another way to link two Slots is to call .linkFrom() on one of them',
    dependencies: [  ],
    code: function() {
      var p1 = Person.create({ name: 'p1' });
      var p2 = Person.create({ name: 'p2' });
      var d = p1.name$.linkFrom(p2.name$);
      p1.name = 'John';
      console.log("Assigned first:", p1.name, p2.name);
    },
    postTestCode: function() {
      //toBeAssertedThat(p1.name).toEqual(p2.name);
    }
  },
  {
    name: 'Data Binding linkFrom unbind',
    description: 'linkFrom/To() returns a destroyable that unbinds the slots',
    dependencies: [ 'Data Binding linkFrom' ],
    code: function() {
      // But this style of link can be broken by calling .destroy()
      // on the object return from .linkFrom/To().
      d.destroy();
      p2.name = 'Steve';
      console.log("No longer bound:", p1.name, p2.name);
    },
    postTestCode: function() {
      //toBeAssertedThat(p1.name).not.toEqual(p2.name);
    }
  },
  {
    name: 'Data Binding linkTo',
    description: 'linkTo() is the same as linkFrom(), except that the initial value is taken from \'this\' instead of the other object',
    dependencies: [  ],
    code: function() {
      // linkTo() is the same as linkFrom(), except that the initial value
      // is taken from 'this' instead of the other object.
      var p1 = Person.create({ name:'p1' }), p2 = Person.create({ name:'p2' });
      var d = p1.name$.linkTo(p2.name$);
      console.log("After linkTo:", p1.name, p2.name);
      var name2 = p2.name;

      p1.name = 'John';
      console.log("Assigned first:", p1.name, p2.name);
    },
    postTestCode: function() {
      //toBeAssertedThat(p1.name).toEqual(p2.name);
      //toBeAssertedThat(name2).toEqual('p1');
    }
  },
  {
    name: 'Data Binding relateTo',
    description: 'Two values can be linked through relateTo',
    dependencies: [  ],
    code: function() {
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
              function f2c(c) {
                console.log('f2c', c); return 5/9 * ( c - 32 );
              },
              function c2f(f) {
                console.log('c2f', f); return 9/5 * f + 32;
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
    },
    postTestCode: function() {
      //toBeAssertedThat(t.c).toEqual(100);
      //toBeAssertedThat(t.f).toEqual(212);
    }
  },
  {
    name: 'Data Binding one way',
    description: 'The .follow() method binds in one direction only',
    dependencies: [  ],
    code: function() {
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
      d.destroy();
    },
    postTestCode: function() {
      //toBeAssertedThat(p1.name).toEqual('George');
      //toBeAssertedThat(p2.name).toEqual('Paul');
    }
  },
  {
    name: 'Data Binding one way initialization',
    description: 'Follow copies the initial value of the followed slot',
    dependencies: [  ],
    code: function() {
      p1 = Person.create();
      p2 = Person.create({name:'John'});
      console.log("Initial:", p1.name, p2.name);

      p1.name$.follow(p2.name$);
      console.log("After follow:", p1.name, p2.name);
    },
    postTestCode: function() {
      //toBeAssertedThat(p1.name).toEqual('John');
    }
  },
  {
    name: 'Data Binding one way mapFrom',
    description: 'One-Way Data-Binding, with Map function (mapFrom)',
    dependencies: [  ],
    code: function() {
      var p1 = Person.create(), p2 = Person.create();
      var d = p1.name$.mapFrom(p2.name$, function(n) {
        return n + "es";
      });

      p2.name = 'Ringo'; // Will update p1 and p2
      console.log('Assigned second:', p1.name, p2.name);
      p1.name = 'George'; // Will only update p1
      console.log('Assigned first:', p1.name, p2.name);
      d.destroy();
    },
    postTestCode: function() {
      //toBeAssertedThat(p1.name).toEqual('George');
      //toBeAssertedThat(p2.name).toEqual('Ringo');
    }
  },
  {
    name: 'Data Binding one way mapTo',
    description: 'One-Way Data-Binding, with Map function (mapTo)',
    dependencies: [  ],
    code: function() {
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
      d.destroy();
    },
    postTestCode: function() {
      //toBeAssertedThat(p1.name).toEqual('George');
      //toBeAssertedThat(p2.name).toEqual('Ringo');
    }
  },
  {
    name: 'Slot isDefined',
    description: 'Slots also let you check if the value is defined by calling isDefined()',
    dependencies: [  ],
    code: function() {
      // Calling obj.name$.isDefined() is equivalent to obj.hasOwnProperty('name');
      foam.CLASS({name: 'IsDefinedTest', properties: [ { name: 'a', value: 42 } ]});
      var o = IsDefinedTest.create();
      var dv = o.a$;
      console.log("Default value only, isDefined?", dv.isDefined());
      dv.set(99);
      console.log("Set to 99, isDefined?", dv.isDefined());
    },
    postTestCode: function() {
      //toBeAssertedThat(dv.isDefined()).toBe(true);
    }
  },
  {
    name: 'Slot clear',
    description: 'You can reset a Slot to its default value by calling .clear()',
    dependencies: [ 'Slot isDefined' ],
    code: function() {
      // Calling obj.name$.clear() is equivalent to obj.clearProperty('name');
      dv.clear();
      console.log("After clearing:", dv.get(), dv.isDefined());
    },
    postTestCode: function() {
      //toBeAssertedThat(dv.isDefined()).toBe(false);
    }
  },
  {
    name: 'ConstantSlot',
    description: 'ConstantSlot creates an immutable slot',
    dependencies: [  ],
    code: function() {
      var s = foam.core.ConstantSlot.create({ value: 42 });
      console.log("Intial value:", s.get());
      s.value = 66;
      s.set(66);
      console.log("After set to 66:", s.get());
    },
    postTestCode: function() {
      //toBeAssertedThat(s.get()).toEqual(42);
    }
  },
  {
    name: 'Expression Slots',
    description: 'ExpressionSlot creates a Slot from a list of Slots and a function to comine them',
    dependencies: [  ],
    code: function() {
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
    },
    postTestCode: function() {
      //toBeAssertedThat(e.get()).toEqual('Steve Jones');
      //toBeAssertedThat(calls).toEqual(2);
    }
  },
  {
    name: 'Expression Slot with object',
    description: 'ExpressionSlot can use an object to supply the source slots',
    dependencies: [  ],
    code: function() {
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
    },
    postTestCode: function() {
      //toBeAssertedThat(e.get()).toEqual('Steve Jones');
    }
  },
  {
    name: 'Expression Slot unbinding',
    description: 'Destroy the ExpressionSlot to prevent further updates',
    dependencies: [ 'Expression Slots' ],
    code: function() {
      calls = 0;
      e.destroy();
      console.log("e destroyed, setting f and l again...");
      p.f = 'Bob';
      p.l = 'Roberts';
      console.log("Updates since destroy:", calls);
    },
    postTestCode: function() {
      //toBeAssertedThat(calls).toEqual(0);
    }
  },


  {
    name: 'Property Expression Class',
    description: 'The same functionality of ExpressionSlot is built into Properties',
    dependencies: [  ],
    code: function() {
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
    }
  },
  {
    name: 'Property Expressions',
    description: 'Expression properties are invalidated whenever of their listed source values change',
    dependencies: [ 'Property Expression Class' ],
    code: function() {
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
    },
    postTestCode: function() {
      //toBeAssertedThat(p.name).toEqual('Steve Jones');
    }
  },
  {
    name: 'Property Expression setting',
    description: 'Expression properties can also be explicitly set, disabling the dynamic expression',
    dependencies: [ 'Property Expression Class' ],
    code: function() {
      console.log(p.name, p.hasOwnProperty('name'));
      p.name = 'Kevin Greer';
      console.log(p.name, p.hasOwnProperty('name'));
      p.fname = 'Sebastian';
      console.log(p.fname, p.lname, ':', p.name);
    },
    postTestCode: function() {
      //toBeAssertedThat(p.name).toEqual('Kevin Greer');
    }
  },
  {
    name: 'Property Expression ',
    description: 'Clearing a set expression property reverts it to expression mode',
    dependencies: [ 'Property Expression Class' ],
    code: function() {
      p.name = "Joe"
      console.log("Set directly:", p.name, "hasOwnProperty(name)?", p.hasOwnProperty('name'));
      p.clearProperty('name');
      console.log("After clearing:", p.name, "hasOwnProperty(name)?", p.hasOwnProperty('name'));
    },
    postTestCode: function() {
      //toBeAssertedThat(p.name).toEqual('John Smith');
    }
  },
  {
    name: 'Destroyables',
    description: 'Destroyables or functions can be registered to be called when an object is destroyed.',
    dependencies: [  ],
    code: function() {
      // Destroyables are objects with a destroy() method, such as FObjects
      // and sub()-returned subscriptions.
      var o = foam.core.FObject.create();
      var o2 = foam.core.FObject.create();
      var destroys = '';

      // onDestroy adds a function to be called when the object is destroyed
      o.onDestroy(function() {
        console.log('destroy 1');
        destroys += '1 ';
      });
      o2.onDestroy(function() {
        console.log('destroy 2');
        destroys += '2 ';
      });

      // cause o2 to be destroyed when o is destroyed
      o.onDestroy(o2);
      o.destroy();
    },
    postTestCode: function() {
      //toBeAssertedThat(destroys).toEqual('1 2 ');
    }
  },
  {
    name: 'Destroyables idempotent',
    description: 'It doesn\'t hurt to try and destroy an object more than once',
    dependencies: [  ],
    code: function() {
      var o = foam.core.FObject.create();
      o.destroy();
      o.destroy();
    },
    postTestCode: function() {
      //toBeAssertedThat(function() { o.destroy(); }).not.toThrow();
    }
  },
  {
    name: 'Destroyables unsubscribe',
    description: '',
    dependencies: [  ],
    code: function() {
      // If an Object is destroyed, it will unsubscribe from any
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
      sink.destroy();
      source.pub('ping');
    },
    postTestCode: function() {
      //toBeAssertedThat(calls).toEqual(2);
    }
  },
  {
    name: 'Model validation extends refines',
    description: 'Extends and refines are mutually-exclusive',
    dependencies: [  ],
    code: function() {
      foam.CLASS({
        name: 'EandRTest',
        extends: 'FObject',
        refines: 'Model'
      });
      EandRTest.model_.validate();
    },
    postTestCode: function() {
      //toBeAssertedThat(function() { EandRTest.model_.validate(); }).toThrow();
    }
  },
  {
    name: 'Model validation property name exists',
    description: 'Properties must have names',
    dependencies: [  ],
    code: function() {
      foam.CLASS({
        name: 'ValidationTest',
        properties: [
          { name: '' }
        ]
      });
      ValidationTest.model_.validate();
    },
    postTestCode: function() {
      //toBeAssertedThat(function() { ValidationTest.model_.validate(); }).toThrow();
    }
  },
  {
    name: 'Action validation names',
    description: 'Actions must have a name',
    dependencies: [  ],
    code: function() {
      foam.CLASS({
        name: 'ActionNameValidation',
        actions: [
          { name: '', code: function() {} }
        ]
      });
      ActionNameValidation.model_.validate();
    },
    postTestCode: function() {
      //toBeAssertedThat(function() { ActionNameValidation.model_.validate(); }).toThrow();
    }
  },
  {
    name: 'Action validation code',
    description: 'Actions must have code',
    dependencies: [  ],
    code: function() {
      foam.CLASS({
        name: 'ActionCodeValidation',
        actions: [
          { name: 'test' }
        ]
      });
      ActionCodeValidation.model_.validate();
    },
    postTestCode: function() {
      //toBeAssertedThat(function() { ActionCodeValidation.model_.validate(); }).toThrow();
    }
  },
  {
    name: 'Model validation property slot name',
    description: 'Properties names must not end with $',
    dependencies: [  ],
    code: function() {
      foam.CLASS({
        name: 'DollarValidationTest',
        properties: [
          { name: 'name$' }
        ]
      });
      DollarValidationTest.model_.validate();
    },
    postTestCode: function() {
      //toBeAssertedThat(function() { DollarValidationTest.model_.validate(); }).toThrow();
    }
  },
  {
    name: 'Model validation property constants',
    description: 'Property constants must not conflict',
    dependencies: [  ],
    code: function() {
      foam.CLASS({
        name: 'ConstantConflictTest',
        properties: [ 'firstName', 'FirstName' ]
      });
      ConstantConflictTest.model_.validate();
    },
    postTestCode: function() {
      //toBeAssertedThat(function() { ConstantConflictTest.model_.validate(); }).toThrow();
    }
  },
  {
    name: 'Model validation property same name',
    description: 'Properties must not have the same name',
    dependencies: [  ],
    code: function() {
      foam.CLASS({
        name: 'AxiomConflict1',
        properties: [ 'sameName', 'sameName' ]
      });
      AxiomConflict1.model_.validate();
    },
    postTestCode: function() {
      //toBeAssertedThat(function() { AxiomConflict1.model_.validate(); }).toThrow();
    }
  },
  {
    name: 'a',
    description: '',
    dependencies: [  ],
    code: function() {
      // Methods must not have the same name
      foam.CLASS({
        name: 'AxiomConflict2',
        methods: [ function sameName() {}, function sameName() {} ]
      });
      AxiomConflict2.model_.validate();
    },
    postTestCode: function() {
      //toBeAssertedThat(function() { AxiomConflict2.model_.validate(); }).toThrow();
    }
  },
  {
    name: 'Axiom validation same name',
    description: 'Axioms must not have the same name',
    dependencies: [  ],
    code: function() {
      //
      foam.CLASS({
        name: 'AxiomConflict3',
        properties: [ 'sameName' ],
        methods: [ function sameName() {} ]
      });
      AxiomConflict3.model_.validate();
    },
    postTestCode: function() {
      //toBeAssertedThat(function() { AxiomConflict3.model_.validate(); }).toThrow();
    }
  },
  {
    name: 'Axiom validation sub property type',
    description: 'A Property cannot be changed to a non-Property',
    dependencies: [  ],
    code: function() {
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
    },
    postTestCode: function() {
      //toBeAssertedThat(function() { AxiomChangeSub.model_.validate(); }).toThrow();
    }
  },
  {
    name: 'Axiom validation class change',
    description: 'Warn if an Axiom changes its class',
    dependencies: [  ],
    code: function() {
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
    },
    postTestCode: function() {
      //toBeAssertedThat(function() { AxiomChangeSub2.model_.validate(); }).not.toThrow();
    }
  },
  {
    name: 'Property validation single accessor',
    description: 'Properties may only have one of factory, value, expression, or getter; one of setter or adapt+preset+postset',
    dependencies: [  ],
    code: function() {
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
    },
    postTestCode: function() {
      var testPV = PropertyValidationTest.create();
      //toBeAssertedThat(function() { PropertyValidationTest.model_.validate(); }).not.toThrow();
      //toBeAssertedThat(testPV.t2).toEqual(42);
      testPV.t1 = 10;
      //toBeAssertedThat(testPV.t1).toEqual(1);
    }
  },
  {
    name: 'Property required',
    description: 'Properties marked required must have values supplied to create()',
    dependencies: [  ],
    code: function() {
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
    },
    postTestCode: function() {
      //toBeAssertedThat(function() { o.validate(); }).toThrow();
    }
  },
  {
    name: 'Unknown Properties',
    description: 'Unknown Model and Property properties are detected',
    dependencies: [  ],
    code: function() {
      foam.CLASS({
        name: 'ValidationTest',
        unknown: 'foobar',
        properties: [
          { name: 'test', unknown: 'foobar' }
        ]
      });
      ValidationTest.model_.validate();
    },
    postTestCode: function() {
      //toBeAssertedThat(function() { ValidationTest.model_.validate(); }).not.toThrow();
    }
  },
  {
    name: 'Context create sub context',
    description: 'Contexts can be explicitly created with foam.createSubContext()',
    dependencies: [  ],
    code: function() {
      // The second argument of createSubContext() is an optional name for the Context
      var Y1 = foam.createSubContext({
        key: 'value',
        fn: function() {
          return 'here';
        }
      }, 'SubContext');
      console.log("Y1:", Y1.key, Y1.fn());
    },
    postTestCode: function() {
      //toBeAssertedThat(Y1.key).toEqual('value');
      //toBeAssertedThat(Y1.fn()).toEqual('here');
    }
  },
  {
    name: 'Context context sub context',
    description: 'Sub-Contexts can be created from other Contexts',
    dependencies: [ 'Context create sub context' ],
    code: function() {
      var Y2 = Y1.createSubContext({ key: 'value2' });
      console.log("Y2:", Y2.key, Y2.fn());
    },
    postTestCode: function() {
      //toBeAssertedThat(Y2.key).toEqual('value2');
      //toBeAssertedThat(Y2.fn()).toEqual('here');
    }
  },
  {
    name: 'Context sub context describe',
    description: 'A Context\'s contents can be inspected with .describe()',
    dependencies: [ 'Context context sub context' ],
    code: function() {
      Y1.describe();
      Y2.describe();
    },
    postTestCode: function() {
      //toBeAssertedThat(Y1.describe).not.toBeUndefined();
      //toBeAssertedThat(Y2.describe).not.toBeUndefined();
    }
  },
  {
    name: 'Import context values',
    description: 'Classes can import values from the Context so that they can be accessed from this',
    dependencies: [  ],
    code: function() {
      var lastLogMsg = "";
      var Y = foam.createSubContext({ myLogger: function(msg) {
        console.log('log:', msg);
        lastLogMsg = msg;
      }});
      foam.CLASS({
        name: 'ImportsTest',
        imports: [ 'myLogger' ],
        methods: [ function foo() {
          this.myLogger('log foo from ImportTest');
        } ]
      });
      try {
        var o = ImportsTest.create(); // should fail here, on object creation
        console.log('test created');
        o.foo();
      } catch(e) {
        console.log('Could not import "myLogger" since nobody provided it.');
      }
      Y.myLogger('test');
      var o = ImportsTest.create(null, Y);
      o.foo();
    },
    postTestCode: function() {
      //toBeAssertedThat(lastLogMsg).toEqual('log foo from ImportTest');
    }
  },
  {
    name: 'Imports optional',
    description: 'Optional imports, marked with a ?, don\'t warn if not found',
    dependencies: [  ],
    code: function() {
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
    },
    postTestCode: function() {
       //toBeAssertedThat(o.myLogger).toBeUndefined();
    }
  },

  {
    name: '',
    description: '',
    dependencies: [  ],
    code: function() {
    },
    postTestCode: function() {
    }
  },

];

var reg = test.helpers.ExemplarRegistry.create(undefined, foam.__context__);
var FBE = FBE.map(function(def) {
  return test.helpers.Exemplar.create(def, reg);
});

// // TODO: BooleanProperty

// // TODO: IntProperty

// // TODO: StringProperty

// // TODO: ArrayProperty



// // Classes can export values for use by objects they create.
// foam.CLASS({
//   name: 'ExportsTest',
//   requires: [ 'ImportsTest' ],
//   exports: [ 'myLogger' ],
//   methods: [
//     function init() {
//       this.ImportsTest.create().foo();
//     },
//     function myLogger(msg) {
//       console.log('log from ExportsTest:', msg);
//     }
//   ]
// });
// ExportsTest.create();

// // Packages
// // Classes can specify a 'package'.
// foam.CLASS({
//   package: 'com.acme',
//   name: 'Test',
//   methods: [ function foo() { console.log('foo from com.acme.Test'); } ]
// });
// com.acme.Test.create().foo();

// // Classes can requires: other Classes to avoid having to reference them
// // by their fully-qualified names.
// foam.CLASS({
//   name: 'RequiresTest',
//   requires: ['com.acme.Test' ],
//   methods: [ function foo() { this.Test.create().foo(); } ]
// });
// RequiresTest.create().foo();

// // Requires can use 'as' to alias required Classes so that they are named something different.
// foam.CLASS({
//   name: 'RequiresAliasTest',
//   requires: ['com.acme.Test as NotTest' ],
//   methods: [ function foo() { this.NotTest.create().foo(); } ]
// });
// RequiresAliasTest.create().foo();

// // Classes can have a unique-id or primary-key.
// // By default, this is simply the field named 'id'.
// foam.CLASS({
//   name: 'Invoice',
//   properties: [ 'id', 'desc', 'amount' ]
// });
// var o = Invoice.create({id: 1, desc: 'Duct Cleaning', amount: 99.99});
// log(o.id);

// // But you can also use the 'ids' property to specify that
// // the primary key be something other than 'id'.
// // In this case, 'id' will become an psedo-property for
// // accessing the real 'invoiceId' property.
// foam.CLASS({
//   name: 'Invoice2',
//   ids: [ 'invoiceId' ],
//   properties: [ 'invoiceId', 'desc', 'amount' ]
// });
// var o = Invoice2.create({invoiceId: 1, desc: 'Duct Cleaning', amount: 99.99});
// log(o.id, o.invoiceId);

// // Multi-part unique identifiers are also supported.
// foam.CLASS({
//   name: 'Invoice3',
//   ids: [ 'customerId', 'invoiceId' ],
//   properties: [ 'customerId', 'invoiceId', 'desc', 'amount' ]
// });
// var o = Invoice3.create({customerId: 1, invoiceId: 1, desc: 'Duct Cleaning', amount: 99.99});
// log(o.id, o.customerId, o.invoiceId);
// o.id = [2, 3];
// log(o.id, o.customerId, o.invoiceId);

// // Multi-part ids are comparable
// log(Invoice3.ID.compare(
//   Invoice3.create({customerId: 1, invoiceId: 2}),
//   Invoice3.create({customerId: 1, invoiceId: 1})));
// log(Invoice3.ID.compare(
//   Invoice3.create({customerId: 1, invoiceId: 1}),
//   Invoice3.create({customerId: 1, invoiceId: 2})));
// log(Invoice3.ID.compare(
//   Invoice3.create({customerId: 1, invoiceId: 1}),
//   Invoice3.create({customerId: 1, invoiceId: 1})));
// log(Invoice3.ID.compare(
//   Invoice3.create({customerId: 2, invoiceId: 1}),
//   Invoice3.create({customerId: 1, invoiceId: 1})));
// log(Invoice3.ID.compare(
//   Invoice3.create({customerId: 1, invoiceId: 1}),
//   Invoice3.create({customerId: 2, invoiceId: 1})));

// // A Classes 'id' is a combination of its package and name.
// log(com.acme.Test.id);

// // In addition the the built-in Axiom types, you can also
// // specify arbitrary Axioms with 'axioms:'.
// // This example adds the 'Singleton' axiom to make a class
// // implement the Singleton patter (ie. there can only be
// // one instance)
// foam.CLASS({
//   name: 'AxiomTest',
//   axioms: [ foam.pattern.Singleton.create() ],
//   methods: [ function init() { log('Creating AxiomTest'); } ]
// });
// AxiomTest.create();
// AxiomTest.create();
// log(AxiomTest.create() === AxiomTest.create());

// //
// foam.CLASS({
//   name: 'AxiomSubTest',
//   extends: 'AxiomTest',
//   methods: [ function init() { log('Creating AxiomSubTest'); } ]
// });
// AxiomSubTest.create();
// AxiomSubTest.create();
// log(AxiomSubTest.create() === AxiomSubTest.create());
// log(AxiomSubTest.create() === AxiomTest.create());

// // Or add the Multion axiom to implement the Multiton pattern.
// foam.CLASS({
//   name: 'Color',
//   axioms: [ foam.pattern.Multiton.create({property: 'color'}) ],
//   properties: [ 'color' ],
//   methods: [ function init() { log('Creating Color:', this.color); } ]
// });
// var red1 = Color.create({color: 'red'});
// var red2 = Color.create({color: 'red'});
// var blue = Color.create({color: 'blue'});
// log(red1 === red2);
// log(red1 === blue);


// // Stdlib

// //:NOTEST
// // All Objects have a unique identifier, accessible with the .$UID property.
// var a = {}, b = [], c = Person.create();
// log(a.$UID, b.$UID, c.$UID);
// log(a.$UID, b.$UID, c.$UID);

// // foam.events.consoleLog
// foam.CLASS({name: 'ConsoleLogTest'});
// var o = ConsoleLogTest.create();
// o.sub(foam.events.consoleLog());
// o.pub();
// o.pub('foo');
// o.pub('foo','bar');

// // foam.Function.memoize1() memozies a one-argument function so that if called again
// // with the same argument, the previously generated value will be returned
// // rather than calling the function again.
// var f = foam.Function.memoize1(function(x) { log('calculating ', x); return x*x; });
// log(f(2));
// log(f(2));
// log(f(4));

// // A call to memoize1() with no arguments will trigger a failed assertion.
// log(f());

// // A call to memoize1() with more than one argument will trigger a failed assertion.
// log(f(1,2));

// // foam.Function.argsStr() returns a function's arguments an a string.
// log(foam.Function.argsStr(function(a,b,fooBar) { }));
// log(typeof foam.Function.argsStr(function() { }));

// // foam.Function.formalArgs() returns a function's arguments an an array.
// log(foam.Function.formalArgs(function(a,b,fooBar) { }));
// log(Array.isArray(foam.Function.formalArgs(function() { })));

// // foam.String.constantize converts strings from camelCase to CONSTANT_FORMAT
// log(foam.String.constantize('foo'));
// log(foam.String.constantize('fooBar'));
// log(foam.String.constantize('fooBar12'));

// // foam.String.capitalize capitalizes strings
// log(foam.String.capitalize('Abc def'));
// log(foam.String.capitalize('abc def'));

// // foam.String.labelize converts from camelCase to labels
// log(foam.String.labelize('camelCase'));
// log(foam.String.labelize('firstName'));
// log(foam.String.labelize('someLongName'));

// // foam.String.multiline lets you build multi-line strings
// // from function comments.
// log(foam.String.multiline(function(){/*This is
// a
// multi-line
// string*/}));

// // foam.String.pad() pads a string to the specified length.
// var s = foam.String.pad('foobar', 10);
// log(s, s.length);

// // foam.String.pad() pads a string to the specified length, right justifying if given a negative number.
// var s = foam.String.pad('foobar', -10);
// log(s, s.length);

// // Basic templates
// foam.CLASS({
//   name: 'TemplateTest',
//   properties: [
//     'name'
//   ],
//   templates: [
//     {
//       name: 'hello',
//       template: 'Hello, my name is <%= this.name %>.'
//     }
//   ]
// });
// var o = TemplateTest.create({ name: 'Adam' });
// log(o.hello());

// foam.CLASS({
//   name: 'TemplateTest',
//   properties: [
//     'name'
//   ],
//   templates: [
//     {
//       name: 'greet',
//       args: [
//         'stranger'
//       ],
//       template: 'Hello <%= stranger %>, my name is <%= this.name %>.'
//     }
//   ]
// });
// var o = TemplateTest.create({ name: 'Adam' });
// log(o.greet("Bob"));

// foam.CLASS({
//   name: 'TemplateTest',
//   properties: [ 'name' ],
//   templates: [
//     {
//       name: 'greeter',
//       args: [ 'stranger' ],
//       template: 'Hello <%= stranger %>'
//     },
//     {
//       name: 'greet',
//       args: ['stranger'],
//       template: '<% this.greeter(output, stranger); %>, my name is <%= this.name %>'
//     }
//   ]
// });
// var o = TemplateTest.create({ name: 'Adam' });
// log(o.greet("Alice"));

// // More
// foam.CLASS({
//   name: 'TemplateTest',
//   properties: [ 'name' ],
//   templates: [
//     {
//       name: 'complexTemplate',
//       template: 'Use raw JS code for loops and control structures' +
//         '<% for ( var i = 0 ; i < 10; i++ ) { %>\n' +
//         'i is: "<%= i %>" <% if ( i % 2 == 0 ) { %> which is even!<% } '+
//         '} %>' +
//         '\n\n' +
//         'Use percent signs to shortcut access to local properties\n' +
//         'For instance, my name is %%name\n'
//     }
//   ]
// });
// log(TemplateTest.create({ name: 'Adam' }).complexTemplate());

// // Multi-line templates can be defined as function comments.
// foam.CLASS({
//   name: 'MultiLineTemplateTest',
//   properties: [ 'name' ],
//   templates: [
//     {
//       name: 'complexTemplate',
//       template: function() {/*
//         Use raw JS code for loops and control structures
//         <% for ( var i = 0 ; i < 10; i++ ) { %>
//         i is: "<%= i %>" <% if ( i % 2 == 0 ) { %> which is even!<% }
//         } %>
//         Use percent signs to shortcut access to local properties
//         For instance, my name is %%name
//       */}
//     }
//   ]
// });
// log(MultiLineTemplateTest.create({ name: 'Adam' }).complexTemplate());

// // JSON Support
// foam.CLASS({
//   name: 'JSONTest',
//   properties: [
//     { name: 'name', shortName: 'n' },
//     { class: 'Int', name: 'age', shortName: 'a' },
//     { class: 'StringArray', name: 'children', shortName: 'cs' },
//     { name: 'name That Needs Quoting' },
//     { name: 'undefined' },
//     { name: 'defined' },
//     { class: 'String', name: 'undefinedString' },
//     { class: 'String', name: 'definedString' },
//     { class: 'String', name: 'defaultString', value: 'default' },
//     { class: 'Int', name: 'undefinedInt' },
//     { class: 'Int', name: 'definedInt' },
//     { class: 'Int', name: 'defaultInt', value: 3 },
//     { class: 'Float', name: 'undefinedFloat' },
//     { class: 'Float', name: 'definedFloat' },
//     { class: 'Float', name: 'defaultFloat', value: 3.14 },
//     { class: 'Boolean', name: 'undefinedBoolean' },
//     { class: 'Boolean', name: 'trueBoolean' },
//     { class: 'Boolean', name: 'falseBoolean' },
//     { class: 'Boolean', name: 'defaultBoolean', value: true },
//     { class: 'Function', name: 'undefinedFunction' },
//     { class: 'Function', name: 'definedFunction' },
//     { name: 'undefinedFObject' },
//     { name: 'definedFObject' },
//     { name: 'transient', transient: true },
//     { name: 'networkTransient', networkTransient: true },
//     { name: 'storageTransient', storageTransient: true },
// //    { name: '' },
//   ]
// });
// var o = foam.json.parse({
//   class: 'JSONTest',
//   name: 'John',
//   age: 42,
//   children: ['Peter', 'Paul']});
// o.describe();

// //
// o = JSONTest.create({
//   name: 'John',
//   age: 42,
//   children: ['Peter', 'Paul'],
//   "name That Needs Quoting": 42,
//   defined: 'value',
//   definedString: 'stringValue',
//   definedInt: 42,
//   defaultInt: 3,
//   definedFloat: 42.42,
//   defaultFloat: 3.14,
//   trueBoolean: true,
//   falseBoolean: false,
//   defaultBoolean: true,
//   definedFunction: function plus(a, b) { return a + b; },
//   definedFObject: JSONTest.create({
//     name: 'Janet',
//     age: 32,
//     children: [ 'Kim', 'Kathy' ]
//   }),
//   transient: 'transient value',
//   networkTransient: 'network transient value',
//   storageTransient: 'storage transient value'
// });
// // Default JSON formatting
// log(foam.json.stringify(o));

// // Convert to a JSON object (instead of a String)
// log(foam.json.stringify(JSONTest.create(foam.json.objectify(o))));

// // Or as a method on Objects
// log(o.stringify());

// //
// log(foam.json.Pretty.stringify(o));

// //
// log(foam.json.Pretty.clone().copyFrom({outputClassNames: false}).stringify(o));

// //
// log(foam.json.Strict.stringify(o));

// //
// log(foam.json.PrettyStrict.stringify(o));

// //
// log(foam.json.Compact.stringify(o));

// //
// log(foam.json.Short.stringify(o));

// //
// log(foam.json.Network.stringify(o));

// //
// log(foam.json.Storage.stringify(o));

// //:NOTEST
// // Graphics Support
// foam.CLASS({
//   name: 'GraphicsDemo',
//   extends: 'foam.graphics.CView',
//   requires: [
//     'foam.graphics.Arc',
//     'foam.graphics.Box',
//     'foam.graphics.Circle',
//     'foam.graphics.CView',
//     'foam.graphics.Gradient'
//   ],
//   properties: [
//     [ 'width', 500 ],
//     [ 'height', 500 ],
//     {
//       name: 'children',
//       factory: function() {
//         var objects = [
//           this.Arc.create({
//             start: 0,
//             end: 1.5*Math.PI,
//             radius: 40
//           }),
//           this.Circle.create({
//             color: this.Gradient.create({
//               radial: true,
//               x0: 0, y0: 0, r0: 10,
//               x1: 0, y1: 0, r1: 100,
//               colors: [
//                 [0, 'green'],
//                 [0.4, 'blue'],
//                 [0.6, 'red'],
//                 [1, 'white']
//               ]
//             }),
//             border: '',
//             radius: 100,
//             x: 300,
//             y: 300
//           }),
//           this.Box.create({
//             color: this.Gradient.create({
//               radial: false,
//               x0: 0, y0: 0,
//               x1: 100, y1: 100,
//               colors: [
//                 [0, 'black'],
//                 [1, 'white']
//               ]
//             }),
//             width: 100,
//             height: 100,
//             originX: 50,
//             originY: 50,
//             x: 100,
//             y: 400,
//             children: [
//               this.Circle.create({
//                 color: 'red',
//                 x: 30,
//                 y: 30,
//                 radius: 10
//               }),
//               this.Circle.create({
//                 color: 'red',
//                 x: 70,
//                 y: 30,
//                 radius: 10
//               }),
//               this.Circle.create({
//                 color: 'red',
//                 x: 30,
//                 y: 70,
//                 radius: 10
//               }),
//               this.Circle.create({
//                 color: 'red',
//                 x: 70,
//                 y: 70,
//                 radius: 10
//               }),
//               this.Circle.create({
//                 color: 'red',
//                 x: 50,
//                 y: 50,
//                 radius: 10
//               })
//             ]
//           })
//         ];
//         return objects;
//       }
//     },
//     {
//       name: 'counter',
//       value: 0
//     }
//   ],
//   listeners: [
//     {
//       name: 'step',
//       isFramed: true,
//       code: function() {
//         this.counter += 0.01
//         this.children[0].rotation += 0.1;
//         this.children[0].x = 150 + 50 * Math.cos(this.counter);
//         this.children[0].y = 150 + 50 * Math.sin(this.counter);
//         this.children[1].skewX = Math.sin(this.counter);
//         this.children[2].scaleX = 0.5 + 0.5 * Math.abs(Math.cos(this.counter));
//         this.children[2].scaleY = 0.5 + 0.5 * Math.abs(Math.sin(this.counter));
//         this.children[2].rotation += 0.01;
//         this.step();
//         this.invalidated.pub();
//       }
//     }
//   ]
// });
// var g = GraphicsDemo.create();
// g.write();
// g.step();

