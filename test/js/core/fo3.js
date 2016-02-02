var GLOBAL = global || this;

var corePromise = GLOBAL.loadCoreTo('core/fo3.js');
var beforeEachTest = function(callback) {
  return beforeEach(function(done) {
    corePromise.then(function() {
      callback();
      done();
    });
  });
};



describe('Property Getter and Setter', function() {
  var t;

  beforeEachTest(function() {
    // NOTE: globals are not defined until corePromise is run by beforeEachTest()
    CLASS({
      name: 'GetterSetterTest',
      properties: [
        {
          name: 'b'
        },
        {
          name: 'a',
          getter: function()  { console.log('getter'); return this.b; },
          setter: function(a) { console.log('setter'); this.b = a; }
        }
      ]
    });
    t = global.GetterSetterTest.create({});
  });
  afterEach(function() {
    t = null;
  });

  it('sets a value and gets it back', function() {
    t.a = 42;
    expect(t.a).toEqual(42);
  });
  it('sets values repeatedly and gets them back', function() {
    t.a = 42;
    expect(t.a).toEqual(42);
    t.a = 'hello';
    expect(t.a).toEqual('hello');
    t.a = -3;
    expect(t.a).toEqual(-3);
  });
  it('gets undefined when not yet set', function() {
    expect(t.a).toBeUndefined();
  });

});


describe('Property Factory', function() {
  var t;

  beforeEachTest(function() {
    CLASS({
      name: 'FactoryTest',
      properties: [
        {
          name: 'a',
          factory: function() { this.testCount++; return 42; }
        },
        {
          name: 'testCount',
          defaultValue: 0
        }
      ]
    });
    t = global.FactoryTest.create({});
  });
  afterEach(function() {
    t = null;
  });

  it('runs', function() {
    expect(t.testCount).toEqual(0); // factory not run on init
    expect(t.a).toEqual(42);
    expect(t.testCount).toEqual(1); // factory is run by getter
  });

  it('is overwritten by a set value', function() {
    expect(t.testCount).toEqual(0); // factory not run on init
    t.a = 84;
    expect(t.testCount).toEqual(1); // factory is run by setter
    expect(t.a).toEqual(84); // setter overwrites factory value
  });

});




describe('Property default value', function() {
  var t;

  beforeEachTest(function() {
    CLASS({
      name: 'DefaultValue',
      properties: [
        {
          name: 'a',
          defaultValue: 42
        }
      ]
    });
    t= global.DefaultValue.create({});
  });
  afterEach(function() {
    t = null;
  });

  it('provides the value when not set', function() {
    expect(t.a).toEqual(42);
  });

  it('is overwritten by a set value', function() {
    expect(t.a).toEqual(42);
    t.a = 84;
    expect(t.a).toEqual(84);
  });

  it('provides the value when cleared', function() {
    expect(t.a).toEqual(42);
    t.a = 84;
    expect(t.a).toEqual(84);
    t.clearProperty('a');
    expect(t.a).toEqual(42);
  });

});


describe('ArrayProperty', function() {
  var t;

  beforeEachTest(function() {
    CLASS({ name: 'A', properties: [ { name: 'a' } ] });
    CLASS({
      name: 'B',
      properties: [
        {
          type: 'Array',
          subType: 'A',
          name: 'as'
        }
      ]
    });
  });
  afterEach(function() {
    t = null;
  });

  it('has a adapt', function() {
    var ap = global.ArrayProperty.create({});
    expect(ap.adapt).toBeTruthy();
  });

  // it('defaults to an empty array', function() {
  //   var b = global.B.create({});
  //   expect(b.as).toEqual([]);
  // });
  // TODO: enable when MyMdl.create(instanceA) clones correctly
//   it('accepts an array value of the correct type', function() {
//     var b = global.B.create({});
//     var a = global.A.create({ a: 'a' });
//     var aa = global.A.create({ a: 'aa' });

//     b.as = [a, aa];
//     expect(b.as.toString()).toEqual([a, aa].toString());

//     console.log('b',b.as[0], 'a', a)

//     expect(b.as[0]).toEqual(a);
//     expect(b.as[1]).toEqual(aa);
//   });

});



describe('Constants', function() {
  var t;
  var t2;

  beforeEachTest(function() {
    CLASS({
      name: 'ConstantTest',

      constants: [
        {
          name: 'KEY',
          value: 'my_value'
        }
      ]
    });
    t = global.ConstantTest.create({});
    CLASS({
      name: 'ConstantTest2',

      constants: {
        KEY: 'my_value',
        KEY2: 'my_value2',
      }

    });
    t2 = global.ConstantTest2.create({});
  });
  afterEach(function() {
    t = null;
    t2 = null;
  });

  it('are available on instances', function() {
    expect(t.KEY).not.toBeUndefined();
    expect(t.KEY).toEqual('my_value');
  });

  it('accepts short map syntax', function() {
    expect(t2.KEY).not.toBeUndefined();
    expect(t2.KEY).toEqual('my_value');
    expect(t2.KEY2).not.toBeUndefined();
    expect(t2.KEY2).toEqual('my_value2');
  });

});


describe('Model.extends inheritance, isInstance(), isSubClass(), getAxioms()', function() {
  var person;
  var employee;

  beforeEachTest(function() {
    CLASS({
      name: 'Person',

      constants: [
        {
          name: 'KEY',
          value: 'my_value'
        }
      ],

      properties: [
        {
          name: 'name'
        },
        {
          name: 'age'
        },
        {
          name: 'result'
        }
      ],

      methods: [
        {
          name: 'sayHello',
          code: function() { this.result = 'hello '+this.name; }
        },
        function sayGoodbye() { this.result = "bye "+this.name; }
      ]
    });
    person = global.Person.create({name: 'Adam', age: 0});

    CLASS({
      name: 'Employee',
      extends: 'Person',

      properties: [
        {
          name: 'salary'
        }
      ],

      methods: [
        function toString() {
          return this.cls_.name + '(' + this.name + ', ' + this.age + ', ' + this.salary + ')';
        }
      ]
    });
    employee = global.Employee.create({name: 'Jane', age: 30, salary: 50000});
  });
  afterEach(function() {
    person = null;
    employee = null;
  });

  it('inherits methods', function() {
    person.sayHello();
    employee.sayHello();
    expect(person.result).toEqual('hello Adam');
    expect(employee.result).toEqual('hello Jane');
    expect(employee.sayGoodbye).not.toBeUndefined();
  });
  it('inherits constants', function() {
    expect(person.KEY).toEqual('my_value');
    expect(employee.KEY).toEqual('my_value');
  });

  it('reports correct subclass checks', function() {
    expect(global.Person.isSubClass(global.Employee)).toBe(true);
    expect(global.Employee.isSubClass(global.Person)).toBe(false);

    CLASS({ name: 'Fake' });
    expect(global.Person.isSubClass(global.Fake)).toBe(false);
  });

  it('reports correct subclass checks', function() {
    expect(global.Person.isInstance(person)).toBe(true);
    expect(global.Employee.isInstance(person)).toBe(false);
    expect(global.Person.isInstance(employee)).toBe(true);

    CLASS({ name: 'Fake' });
    expect(global.Person.isInstance(global.Fake.create({}))).toBe(false);
  });
  
  it('returns axioms correctly', function() {
    expect(global.Person.getAxiomByName('age')).toBe(global.Person.AGE);

    var axs = global.Person.getAxiomsByClass(global.Property);
    expect(axs.length).toEqual(3); 
    expect(axs[0]).toBe(global.Person.NAME);
    expect(axs[1]).toBe(global.Person.AGE);
    expect(axs[2]).toBe(global.Person.RESULT);
    expect(global.Person.getAxioms().length).toEqual(7);
  });
  
});

describe('coverage for debugging helpers', function() {
  beforeEachTest(function() {
  });
  afterEach(function() {
  });

  it('covers describe()', function() {
    var p = GLOBAL.Property.create({});
    p.describe();
    p.cls_.describe();
  });

});






