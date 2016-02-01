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
    var s = X.Slot.create({});
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
    slotA = X.Slot.create({});
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
    slotA = X.Slot.create({});
    slotB = X.Slot.create({});
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

describe('Slot.pipe', function() {
  var slotA;
  var slotB;

  beforeEachTest(function() {
    slotA = X.Slot.create({});
    slotB = X.Slot.create({});
  });
  afterEach(function() {
    slotA = null;
    slotB = null;
  });

  it('adds follower and updates propagate', function() {
    slotA.pipe(); // should be ignored
    slotA.pipe(slotB);
    slotA.set('hello');
    expect(slotB.get()).toEqual('hello');
    slotB.set(4); // B isn't following A
    expect(slotA.get()).toEqual('hello');
  });

  it('adds reciprocal followers and updates propagate but do not feed back', function() {
    slotA.pipe(slotB);
    slotB.pipe(slotA);
    slotA.set('hello');
    expect(slotB.get()).toEqual('hello');
    slotB.set(4);
    expect(slotA.get()).toEqual(4);
  });

});

describe('Slot.unpipe', function() {
  var slotA;
  var slotB;

  beforeEachTest(function() {
    slotA = X.Slot.create({});
    slotB = X.Slot.create({});
  });
  afterEach(function() {
    slotA = null;
    slotB = null;
  });

  it('removes follower and stops propagation', function() {
    slotA.pipe(slotB);
    slotA.set('hello');
    expect(slotB.get()).toEqual('hello');

    slotA.unpipe(slotB);
    slotA.set('goodbye');
    expect(slotB.get()).toEqual('hello');
  });

  it('remove ignores non-existent follower', function() {
    slotA.unpipe();
    slotA.unpipe(slotB);
    slotA.set('hello');
    expect(slotB.get()).toBeUndefined();
  });

});


describe('Slot.map', function() {
  var slotA;
  var slotB;
  var listener;

  beforeEachTest(function() {
    slotA = X.Slot.create({});
    slotB = X.Slot.create({});
    listener = function(val) {
      listener.count += 1;
      return val+1;
    }
    listener.count = 0;
  });
  afterEach(function() {
    slotA = null;
    slotB = null;
    listener = null;
  });

  it('propagates value through the function', function() {
    slotA.map(); // ignored
    slotA.map(slotB, listener);
    slotA.set(5);
    expect(slotB.get()).toEqual(6);
    expect(listener.count).toEqual(2); // invoked by recordListener_(), then set()
    slotA.set(5);
    //TODO: listen to B, should be no change
  });


});


describe('Slot.link', function() {
  var slotA;
  var slotB;

  beforeEachTest(function() {
    slotA = X.Slot.create({});
    slotB = X.Slot.create({});
  });
  afterEach(function() {
    slotA = null;
    slotB = null;
  });

  it('propagates values both directions', function() {
    slotA.link(); // ignored
    slotA.link(slotB);

    slotB.set('hello');
    expect(slotA.get()).toEqual('hello');

    slotA.set('goodbye');
    expect(slotB.get()).toEqual('goodbye');

  });


});

describe('Slot.unlink', function() {
  var slotA;
  var slotB;

  beforeEachTest(function() {
    slotA = X.Slot.create({});
    slotB = X.Slot.create({});
  });
  afterEach(function() {
    slotA = null;
    slotB = null;
  });

  it('unlistens both directions', function() {
    slotA.unlink(); // ignored
    slotA.unlink(slotB); // ignored

    slotA.link(slotB);

    slotB.set('hello');
    expect(slotA.get()).toEqual('hello');

    slotA.set('goodbye');
    expect(slotB.get()).toEqual('goodbye');

    slotA.unlink(slotB);

    slotB.set('unlinkedB');
    expect(slotA.get()).toEqual('goodbye'); // no change

    slotA.set('unlinkedA');
    expect(slotB.get()).toEqual('unlinkedB'); // no change


  });

  it('does not care which side of the link it is called from', function() {
    slotA.unlink(); // ignored
    slotA.unlink(slotB); // ignored

    slotA.link(slotB);

    slotB.set('hello');
    expect(slotA.get()).toEqual('hello');

    slotA.set('goodbye');
    expect(slotB.get()).toEqual('goodbye');

    slotB.unlink(slotA); // reverse of previous test case

    slotB.set('unlinkedB');
    expect(slotA.get()).toEqual('goodbye'); // no change

    slotA.set('unlinkedA');
    expect(slotB.get()).toEqual('unlinkedB'); // no change


  });
});


describe('Slot.destroy', function() {
  var slotA;
  var slotB;

  beforeEachTest(function() {
    slotA = X.Slot.create({});
    slotB = X.Slot.create({});
  });
  afterEach(function() {
    slotA = null;
    slotB = null;
  });

  it('disconnects all listeners', function() {

    slotA.destroy();// ignored

    slotA.pipe(slotB);
    slotA.set('hello');
    expect(slotB.get()).toEqual('hello');

    slotA.destroy();

    slotA.set('unlinkedA');
    expect(slotB.get()).toEqual('hello'); // no change


  });
});


describe('Slot.relate', function() {
  var slotA;
  var slotB;
  var listener1;
  var listener2;

  beforeEachTest(function() {
    slotA = X.Slot.create({});
    slotB = X.Slot.create({});
    listener1 = function(val) { // this fn will stop altering the value at 10 to test feedback
      listener1.count += 1;
      return (val < 10) ? val+1 : val;
    }
    listener1.count = 0;
    listener2 = function(val) { // this fn will stop altering the value at 10 to test feedback
      listener2.count += 1;
      return (val < 10) ? val+2 : val;
    }
    listener2.count = 0;
  });
  afterEach(function() {
    slotA = null;
    slotB = null;
  });

  it('maps values without a feedback loop', function() {
    slotA.relate(); // ignored

    slotA.relate(slotB, listener1, listener2, true);

    slotA.set(1);
    expect(slotB.get()).toEqual(2);
    expect(slotA.get()).toEqual(1);

    slotB.set(4);
    expect(slotB.get()).toEqual(4);
    expect(slotA.get()).toEqual(6);
  });

  it('maps values with a feedback loop', function() {
    // these listeners are set up to stop feedback loops at 10
    slotA.relate(slotB, listener1, listener2);

    slotA.set(1);
    expect(slotB.get()).toEqual(10);
    expect(slotA.get()).toEqual(10);

    slotB.set(4);
    expect(slotB.get()).toEqual(10);
    expect(slotA.get()).toEqual(10);


  });
});


