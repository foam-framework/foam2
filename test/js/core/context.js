
var corePromise = global.loadCoreTo('core/mm.js');
var beforeEachTest = function(callback) {
  return beforeEach(function(done) {
    corePromise.then(function() {
      callback();
      done();
    });
  });
};


describe('ConteXt object', function() {
  beforeEachTest(function() {

  });

  it('exists', function() {
    expect(foam).toBeTruthy();
    foam.lookup(); // TODO
    foam.register(); // TODO
  });

  it('subcontexts', function() {
    var sub = foam.sub({ hello: 4 }, 'namey');
    expect(sub.hello).toEqual(4);
  });

  it('subcontexts with dynamic values', function() {
    foam.CLASS({ name: 'Tester',
      properties: [ 'a' ]
    });
    var test = /*X.*/Tester.create({ a: 3 });
    var sub = foam.sub({ hello$: test.a$ });

    expect(sub.hello).toEqual(3);
    test.a = 99;
    expect(sub.hello).toEqual(99);

  });

  it('describes', function() {
    foam.sub().describe();

    foam.sub({ hello: 'thing', wee: /*X.*/Property.create() }, 'namey').describe();
  });

});
