var corePromise = global.loadCoreTo('core/debug.js');
var beforeEachTest = function(callback) {
  return beforeEach(function(done) {
    corePromise.then(function() {
      callback();
      done();
    });
  });
};


describe('coverage for debugging helpers', function() {
  beforeEachTest(function() {
  });
  afterEach(function() {
  });

  it('covers describe()', function() {
    var p = /*X.*/Property.create({});
    p.describe();
    p.cls_.describe();
  });

});