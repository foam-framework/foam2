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

//   it('asserts on a duplicate follow', function() {
//     slotA.recordListener_(slotB, listener);

//     expect(slotA.recordListener_(slotB, listener);

//   });

});


