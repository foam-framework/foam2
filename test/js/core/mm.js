
var corePromise = GLOBAL.loadCoreTo('core/mm.js');
var beforeEachTest = function(callback) {
  return beforeEach(function(done) {
    corePromise.then(function() {
      callback();
      done();
    });
  });
};


describe('Untyped Property', function() {
  var t;

  beforeEachTest(function() {
    // NOTE: globals are not defined until corePromise is run by beforeEachTest()
    foam.CLASS({
      name: 'PropTest',
      properties: [
        {
          name: 'b'
        },
      ]
    });
    t = /*X.*/PropTest.create({});
  });
  afterEach(function() {
    t = null;
  });

  it('creates a Property by default', function() {
    expect(PropTest.B.cls_.name).toEqual('Property');
  });

});


describe('AbstractClass.getAxioms', function() {

  beforeEachTest(function() {
  });
  afterEach(function() {
  });

  it('coverage', function() {
    /*X.*/Property.getAxioms();
    /*X.*/Property.getAxioms(); // previous results cached
  });

});

describe('AbstractClass.toString', function() {

  beforeEachTest(function() {
  });
  afterEach(function() {
  });

  it('coverage', function() {
    /*X.*/Property.toString();
  });

});


describe('Property Getter and Setter', function() {
  var t;
  var p;

  beforeEachTest(function() {
    // NOTE: globals are not defined until corePromise is run by beforeEachTest()
    foam.CLASS({
      name: 'GetterSetterTest',
      properties: [
        {
          name: 'b',
          adapt: function(old, nu) {
            p += 'adapt'+nu;
            return nu;
          },
          preSet: function(old, nu) {
            p += 'preSet'+nu;
            return nu;
          },
          postSet: function(old, nu) {
            p += 'postSet'+nu;
          },
        },
        {
          name: 'a',
          getter: function()  { return this.b; },
          setter: function(a) { this.b = a; }
        }
      ]
    });
    t = /*X.*/GetterSetterTest.create({});
    p = "";
  });
  afterEach(function() {
    t = null;
    p = "";
  });

  it('sets a value and gets it back', function() {
    t.a = 42;
    expect(t.a).toEqual(42);
  });
  it('sets a value via custom setter', function() {
    t.a = 42;
    expect(t.b).toEqual(42);
  })
  it('reads a value via custom getter', function() {
    t.b = 42;
    expect(t.a).toEqual(42);
  })
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
  it('Hits defined adapt/pre/postSet', function() {
    t.b = 4;
    expect(p).toEqual('adapt4preSet4postSet4');
  });
});


describe('Property Factory', function() {
  var t;

  beforeEachTest(function() {
    foam.CLASS({
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
    t = /*X.*/FactoryTest.create({});
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
    expect(t.testCount).toEqual(0); // factory is not run by setter
    expect(t.a).toEqual(84); // setter overwrites factory value
    t.a = 96;
    expect(t.testCount).toEqual(0);
    expect(t.a).toEqual(96);
  });

});

describe('Property default comparators', function() {
  var c;

  beforeEachTest(function() {
    c = /*X.*/Property.create().comparePropertyValues;
  });
  afterEach(function() {
    c = null;
  });


//         return o1.$UID.compareTo(o2.$UID);

  it('accepts ===', function() {
    var s = '';
    expect(c(s, s)).toEqual(0);
  });
  it('accepts double falsey', function() {
    expect(c(false, false)).toEqual(0);
    expect(c(NaN, NaN)).toEqual(0);
    expect(c(0, 0)).toEqual(0);
    expect(c('', '')).toEqual(0);
  });
  it('accepts left falsey', function() {
    expect(c(false, 6)).toEqual(-1);
    expect(c(NaN, 6)).toEqual(-1);
    expect(c(0, 6)).toEqual(-1);
    expect(c('', 6)).toEqual(-1);
  });
  it('accepts right falsey', function() {
    expect(c(4, false)).toEqual(1);
    expect(c(4, NaN)).toEqual(1);
    expect(c(4, 0)).toEqual(1);
    expect(c(4, '')).toEqual(1);
  });
  it('accepts localeCompare', function() {
    var o1 = { localeCompare: function(arg) { return 6; } };
    expect(c(o1, 3)).toEqual(6);
  });
  it('accepts compareTo', function() {
    var o1 = { compareTo: function(arg) { return 6; } };
    expect(c(o1, 3)).toEqual(6);
  });
  it('falls back on $UID.compareTo', function() {
    var o1 = {};
    var o2 = {};
    expect(c(o1, o2)).toEqual(-1);
  });
});



describe('Property default value', function() {
  var t;

  beforeEachTest(function() {
    foam.CLASS({
      name: 'DefaultValue',
      properties: [
        {
          name: 'a',
          defaultValue: 42
        }
      ]
    });
    t= /*X.*/DefaultValue.create({});
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
    foam.CLASS({ name: 'A', properties: [ { name: 'a' } ] });
    foam.CLASS({
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
    var ap = /*X.*/ArrayProperty.create({});
    expect(ap.adapt).toBeTruthy();
  });

  // it('defaults to an empty array', function() {
  //   var b = /*X.*/B.create({});
  //   expect(b.as).toEqual([]);
  // });
  // TODO: enable when MyMdl.create(instanceA) clones correctly
//   it('accepts an array value of the correct type', function() {
//     var b = /*X.*/B.create({});
//     var a = /*X.*/A.create({ a: 'a' });
//     var aa = /*X.*/A.create({ a: 'aa' });

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
    foam.CLASS({
      name: 'ConstantTest',

      constants: [
        {
          name: 'KEY',
          value: 'my_value'
        }
      ]
    });
    t = /*X.*/ConstantTest.create({});
    foam.CLASS({
      name: 'ConstantTest2',

      constants: {
        KEY: 'my_value',
        KEY2: 'my_value2',
      }

    });
    t2 = /*X.*/ConstantTest2.create({});
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
    foam.CLASS({
      name: 'Person',

      constants: [
        {
          name: 'KEY',
          value: 'my_value'
        }
      ],

      properties: [
        {
          type: 'String',
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
    person = /*X.*/Person.create({name: 'Adam', age: 0});

    foam.CLASS({
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
    employee = /*X.*/Employee.create({name: 'Jane', age: 30, salary: 50000});
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
    expect(/*X.*/Person.isSubClass(/*X.*/Employee)).toBe(true);
    expect(/*X.*/Employee.isSubClass(/*X.*/Person)).toBe(false);

    foam.CLASS({ name: 'Fake' });
    expect(/*X.*/Person.isSubClass(/*X.*/Fake)).toBe(false);
  });

  it('reports correct subclass checks', function() {
    expect(/*X.*/Person.isInstance(person)).toBe(true);
    expect(/*X.*/Employee.isInstance(person)).toBe(false);
    expect(/*X.*/Person.isInstance(employee)).toBe(true);

    foam.CLASS({ name: 'Fake' });
    expect(/*X.*/Person.isInstance(/*X.*/Fake.create({}))).toBe(false);
  });

  it('returns axioms correctly', function() {
    expect(/*X.*/Person.getAxiomByName('age')).toBe(/*X.*/Person.AGE);

    var axs = /*X.*/Person.getAxiomsByClass(/*X.*/Property);
    expect(axs.length).toEqual(3);
    expect(axs[0]).toBe(/*X.*/Person.NAME);
    expect(axs[1]).toBe(/*X.*/Person.AGE);
    expect(axs[2]).toBe(/*X.*/Person.RESULT);
  });

});



describe('FObject white box test', function() {
  beforeEachTest(function() {
    foam.CLASS({
      name: 'Person',
      properties: [
        {
          type: 'String',
          name: 'name'
        },
        {
          name: 'age'
        },
      ],
    });
  });
  afterEach(function() {
  });

  it('inits from null', function() {
    var o = /*X.*/Person.create();
    expect(o.name).toBeUndefined();
  });
  it('inits from a POJSO', function() {
    var o = /*X.*/Person.create({ name: 'prop1' });

    expect(o.name).toEqual('prop1');
  });
  it('inits from another FObject', function() {
    var o = /*X.*/Person.create({ name: 'prop1' });
    var o2 = Person.create(o);

    expect(o2.name).toEqual('prop1');
  });
  it('covers init from another FObject with no instance_', function() {
    var prot = { name: 'prop1' };
    var o = /*X.*/Person.create(Object.create(prot));

    expect(o.name).toEqual('prop1');
  });
  it('toString()s nicely', function() {
    var o = /*X.*/Person.create();
    o.toString();
  });

});


describe('Method overrides and SUPER', function() {
  var m;
  var s;

  beforeEachTest(function() {
    foam.CLASS({
      name: 'BaseClass',
      methods: [
        function base() {
          return 5;
        }
      ]
    });
    foam.CLASS({
      name: 'SubClass',
      extends: 'BaseClass',
      methods: [
        function base() {
          return this.SUPER() + 1;
        }
      ]
    });
    foam.CLASS({
      name: 'SubSubClass',
      extends: 'SubClass',
      methods: [
        function base() {
          return this.SUPER() + 2;
        }
      ]
    });
    m = SubClass.create();
    s = SubSubClass.create();
  });
  afterEach(function() {
    BaseClass = undefined;
    SubClass = undefined;
    SubSubClass = undefined;
    m = null;
    s = null;
  });

  it('SUPER is defined for overriden methods', function() {
    expect(function() { m.base(); }).not.toThrow();
    expect(m.base()).toEqual(6);
    m.base.toString();
  });
  it('SUPER slow path works', function() {
    expect(function() { s.base(); }).not.toThrow();
    expect(s.base()).toEqual(8);
  });

});



describe('Property Mlang interop', function() {
  var t;

  beforeEachTest(function() {
    foam.CLASS({
      name: 'MTest',
      properties: [
        {
          name: 'a',
          defaultValue: 45,
        },
      ]
    });
    t = /*X.*/MTest.create({});
  });
  afterEach(function() {
    t = null;
  });

  it('predicate support works', function() {
    expect(/*X.*/MTest.A.f(t)).toEqual(45); // extracts 'a' property of instance t
  });
  it('compare support works', function() {
    var t2 = MTest.create({ a: 45 });
    expect(/*X.*/MTest.A.compare(t, t2)).toEqual(0);
    t2.a = 2;
    expect(/*X.*/MTest.A.compare(t, t2)).toEqual(1);
    t.a = 1;
    expect(/*X.*/MTest.A.compare(t, t2)).toEqual(-1);
  });
});


describe('Slots', function() {
  var t;
  var t2;

  beforeEachTest(function() {
    foam.CLASS({
      name: 'MTest',
      properties: [
        {
          name: 'a',
          defaultValue: 45,
        },
      ]
    });
    t = /*X.*/MTest.create();
    t2 = /*X.*/MTest.create();
  });
  afterEach(function() {
    t = null;
    t2 = null;
  });

  it('creates a slot for a property', function() {
    expect(t.a$).not.toBeUndefined();
    expect(t.a$.isDefined()).toBe(false);
    t.a = 4;
    expect(t.a$.isDefined()).toBe(true);
  });
  it('binds property slots', function() {
    t.a$ = t2.a$; // bind
    t.a = 999;
    expect(t2.a).toEqual(999);
  });
  it('allows links to be destroyed', function() {
    var b = t.a$.link(t2.a$);
    t.a = 999;

    b.destroy();

    t.a = 4;
    expect(t.a).toEqual(4);
    expect(t2.a).toEqual(999);
  });
  it('allows follows to be destroyed', function() {
    var b = t2.a$.follow(t.a$);
    t.a = 999;

    b.destroy();

    t.a = 4;
    expect(t.a).toEqual(4);
    expect(t2.a).toEqual(999);
  });
//   it('clears the property', function() {
//     var b = t2.a$.follow(t.a$);
//     t.a = 999;
//     expect(t2.a).toEqual(999);
//     t.a$.clear();
//     expect(t2.a).toEqual(45);
//   });
  it('subscribes manual listeners', function() {
    var last_args;
    var l = function() { last_args = Array.prototype.slice.call(arguments); };
    t.a$.subscribe(l);
    t.a = 999;
    expect(last_args).toBeDefined();
    expect(last_args[2]).toEqual('a');
    expect(last_args[4]).toEqual(999);
  });
  it('unsubscribes manual listeners', function() {
    var last_args;
    var l = function() { last_args = Array.prototype.slice.call(arguments); };
    t.a$.subscribe(l);
    t.a = 999;

    t.a$.unsubscribe(l);
    t.a = 49;

    // same as the first time
    expect(last_args).toBeDefined();
    expect(last_args[2]).toEqual('a');
    expect(last_args[4]).toEqual(999);
  });
});


describe('Listeners', function() {
  var t;

  beforeEachTest(function() {
    foam.CLASS({
      name: 'Sprinkler',
      listeners: [
        function onAlarm() {  },
        {
          name: 'onClear',
          isFramed: true,
          code: function() { }
        }
      ]
    });
    t = /*X.*/Sprinkler.create({});
  });
  afterEach(function() {
    t = null;
  });

  it('listeners are installed as method-alikes', function() {
    t.onAlarm();
    t.onClear();
  });
});


describe('Bootstrap invariants', function() {
  var t;
  it('Check that all recursive relationships are properly set', function() {
    expect(Model.isInstance(Model.model_)).toBe(true);
    expect(Model.isInstance(FObject.model_)).toBe(true);
    expect(Model.isInstance(Property.model_)).toBe(true);
    expect(Model.isInstance(Method.model_)).toBe(true);
    expect(Model.isInstance(StringProperty.model_)).toBe(true);
    expect(Model.isInstance(ArrayProperty.model_)).toBe(true);
  });

  it('Check that Class.model_ and Class.prototype.model_ are the same object', function() {
    expect(Model.isInstance(AxiomArrayProperty.model_)).toBe(true);
    expect(Model.isInstance(Constant.model_)).toBe(true);
    expect(Model.isInstance(Trait.model_)).toBe(true);
    expect(Model.isInstance(Slot.model_)).toBe(true);
    expect(Model.isInstance(PropertySlot.model_)).toBe(true);
    expect(Model.isInstance(Topic.model_)).toBe(true);
    expect(Model.isInstance(BooleanProperty.model_)).toBe(true);
  });
})
