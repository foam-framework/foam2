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
    t = X.GetterSetterTest.create({});
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
    t = X.FactoryTest.create({});
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
    t= X.DefaultValue.create({});
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

//
// var ap = ArrayProperty.create({});
// console.assert(ap.preSet, 'ArrayProperty.preSet missing.');
//
// // ArrayProperty Test
// CLASS({ name: 'A', properties: [ { name: 'a' } ] });
// CLASS({
//   name: 'B',
//   properties: [
//     {
//       type: 'Array',
//       subType: 'A',
//       name: 'as'
//     }
//   ]
// });
//
// var b = B.create({as: [{a: 'abc'}]});
// console.log(b.as);
//
//
// CLASS({
//   name: 'ConstantTest',
//
//   constants: [
//     {
//       name: 'KEY',
//       value: 'If you can see this, Constants are working!'
//     }
//   ]
// });
//
// var t1 = ConstantTest.create({});
// console.assert(t1.KEY, 'Constants don\'t work.');
// console.log(t1.KEY);
//
//
// CLASS({
//   name: 'Person',
//
//   constants: [
//     {
//       name: 'KEY',
//       value: 'If you can see this, Constants are working!'
//     }
//   ],
//
//   properties: [
//     {
//       name: 'name'
//     },
//     {
//       name: 'age'
//     }
//   ],
//
//   methods: [
//     {
//       name: 'sayHello',
//       code: function() { console.log('Hello World!'); }
//     },
//     function sayGoodbye() { console.log('Goodbye from ' + this.name); }
//   ]
// });
//
// var p = Person.create({name: 'Adam', age: 0});
// console.log(p.name, p.age, p.KEY);
// p.sayHello();
// p.sayGoodbye();
//
//
// CLASS({
//   name: 'Employee',
//   extends: 'Person',
//
//   properties: [
//     {
//       name: 'salary'
//     }
//   ],
//
//   methods: [
//     function toString() {
//       return this.cls_.name + '(' + this.name + ', ' + this.age + ', ' + this.salary + ')';
//     }
//   ]
// });
//
// var e = Employee.create({name: 'Jane', age: 30, salary: 50000});
// console.log(e.toString());
// e.sayGoodbye();
//
// /*
// // 3058ms, Jan 26, 2016, X1 Carbon
// console.time('b1');
// for ( var i = 0 ; i < 10000000 ; i++ )
//   p.age++;
// console.timeEnd('b1');
//
//
// // 1251ms, Jan 26, 2016, X1 Carbon
// console.time('b2');
// for ( var i = 0 ; i < 1000000 ; i++ )
//   Person.create({name: 'john', age: i});
// console.timeEnd('b2');
// */
