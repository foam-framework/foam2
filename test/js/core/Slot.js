var GLOBAL = global || this;

var corePromise = GLOBAL.loadCoreTo('core/Slot.js');
var beforeEachTest = function(callback) {
  return beforeEach(function(done) {
    corePromise.then(function() {
      callback();
      done();
    });
  });
};

describe('Slot.equals', function() {
  beforeEachTest(function() {});

  it('compares things', function() {
    var s = Object.create(GLOBAL.X.Slot);
    expect(s.equals(1, 1)).toBe(true);
    expect(s.equals(1, 2)).toBe(false);
    expect(s.equals(s, s)).toBe(true);
    expect(s.equals(s, GLOBAL.X.Slot)).toBe(false);
    expect(s.equals(NaN, NaN)).toBe(true);
    expect(s.equals(1, NaN)).toBe(false);
  });
});

describe('Slot.get/set', function() {
  var slotA;

  beforeEachTest(function() {
    slotA = Object.create(GLOBAL.X.Slot);
  });
  afterEach(function() {
    slotA = null;
  });

  it('returns undefined when nothing is set', function() {
    expect(slotA.get()).toBeUndefined();
  });

  it('returns the value set on the slot', function() {
    slotA.set('hello');
    expect(slotA.get()).toEqual('hello');
    slotA.set(34);
    expect(slotA.get()).toEqual(34);
  });

});


describe('Slot.recordListener', function() {
  var slotA;
  var slotB;
  var listener;

  beforeEachTest(function() {
    slotA = Object.create(GLOBAL.X.Slot);
    slotB = Object.create(GLOBAL.X.Slot);
    listener = function() {
      listener.count += 1;
    }
    listener.count = 0;
  });
  afterEach(function() {
    slotA = null;
    slotB = null;
    listener = null;
  });

  it('adds listener and records follower', function() {
    slotA.recordListener_(slotB, listener);
    expect(listener.count).toEqual(1); // recordListener calls it
    slotA.globalChange();
    expect(listener.count).toEqual(2);
  });

  it('adds listener without calling it immediately', function() {
    slotA.recordListener_(slotB, listener, true);
    expect(listener.count).toEqual(0); // recordListener calls it
    slotA.globalChange();
    expect(listener.count).toEqual(1);

  });

  it('asserts on a duplicate follow', function() {
    function lister() {
      slotA.recordListener_(slotB, listener);
    }
    lister();
    expect(lister).toThrow();
  });



});


