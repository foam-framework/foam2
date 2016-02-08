
var corePromise = global.loadCoreTo('core/stdlib.js');
var beforeEachTest = function(callback) {
  return beforeEach(function(done) {
    corePromise.then(function() {
      callback();
      done();
    });
  });
};


describe('internal foam.LIB', function() {

  beforeEachTest(function() {
  });
  afterEach(function() {
  });

  it('applies constants', function() {
    foam.LIB({
        name: 'test',
        constants: {
          CONST: 'val'
        }
    });
    expect(foam.test.CONST).toEqual('val');
  });

});

describe('Object.$UID', function() {

  beforeEachTest(function() {
  });
  afterEach(function() {
  });

  it('is unique', function() {
      var o1 = {};
      var o2 = {};
      expect(o1.$UID).not.toEqual(o2.$UID);

      var o3 = {};
      expect(o1.$UID).not.toEqual(o3.$UID);
      expect(o2.$UID).not.toEqual(o3.$UID);
  });

});

describe('fn.memoize1', function() {

  beforeEachTest(function() {
  });
  afterEach(function() {
  });

  it('accepts a null argument', function() {
    var f = foam.fn.memoize1(function(arg) { return arg; });
    var r = f(null);
    expect(f(null)).toBe(r);
  });

});


describe('string.pad', function() {

  beforeEachTest(function() {
  });
  afterEach(function() {
  });

  it('pads left', function() {
    expect(foam.string.pad("wee", -6)).toEqual("   wee");
  });

});

describe('Number.compareTo', function() {

  beforeEachTest(function() {
  });
  afterEach(function() {
  });

  it('compares', function() {
    var n = new Number(3);
    expect(n.compareTo(3)).toEqual(0);
    expect(n.compareTo(1)).toEqual(1);
    expect(n.compareTo(6)).toEqual(-1);
  });

});
describe('String.compareTo', function() {

  beforeEachTest(function() {
  });
  afterEach(function() {
  });

  it('compares', function() {
    var n = new String("bbb");
    expect(n.compareTo("bbb")).toEqual(0);
    expect(n.compareTo("aa")).toEqual(1);
    expect(n.compareTo("ccc")).toEqual(-1);
  });

});



