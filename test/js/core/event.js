var GLOBAL = global || this;

var corePromise = GLOBAL.loadCoreTo('core/event.js');
var beforeEachTest = function(callback) {
  return beforeEach(function(done) {
    corePromise.then(function() {
      callback();
      done();
    });
  });
};

describe('EventService.oneTime', function() {
  var ep;
  var listener;

  beforeEachTest(function() {
    ep = GLOBAL.EventPublisher.create({});
    listener = function(publisher, topic, unsub) {
      listener.last_topic = topic;
      listener.last_unsub = unsub;
      listener.last_args = arguments;
      listener.count += 1;
    };
    listener.count = 0;
  });
  afterEach(function() {
    ep = null;
    listener = null;
  });

  it('removes itself after one invokation', function() {
    var one = GLOBAL.EventService.oneTime(listener);

    ep.subscribe(['simple'], one);

    ep.publish(['simple']);
    expect(listener.count).toEqual(1);

    // listener should be gone now
    expect(ep.hasListeners(['simple'])).toBe(false);
    ep.publish(['simple']);
    expect(listener.count).toEqual(1);
  });

});

describe('EventService.consoleLog', function() {
  var ep;
  var listener;

  beforeEachTest(function() {
    ep = GLOBAL.EventPublisher.create({});
    listener = function(publisher, topic, unsub) {
      listener.last_topic = topic;
      listener.last_unsub = unsub;
      listener.last_args = arguments;
      listener.count += 1;
    }
    listener.count = 0;
  });
  afterEach(function() {
    ep = null;
    listener = null;
  });

  it('logs ok', function() {
    var logger = GLOBAL.EventService.consoleLog(listener);

    ep.subscribe(['simple'], logger);

    ep.publish(['simple']);
    expect(listener.count).toEqual(1);

  });

});


describe('EventService.merged', function() {
  var ep;
  var listener;

  beforeEachTest(function() {
    ep = GLOBAL.EventPublisher.create({});
    listener = function(publisher, topic, unsub) {
      listener.last_topic = topic;
      listener.last_unsub = unsub;
      listener.last_args = arguments;
      listener.count += 1;
    }
    listener.count = 0;
    jasmine.clock().install();
  });
  afterEach(function() {
    ep = null;
    listener = null;
    jasmine.clock().uninstall();
  });

  it('merges with default parameters', function() {
    var merged = GLOBAL.EventService.merged(listener);

    ep.subscribe(['simple'], merged);

    ep.publish(['simple']);
    expect(listener.count).toEqual(0);

    ep.publish(['simple']);
    expect(listener.count).toEqual(0);

    jasmine.clock().tick(17);

    expect(listener.count).toEqual(1);

  });

  it('merges with delay specified', function() {
    var merged = GLOBAL.EventService.merged(listener, 1300);

    ep.subscribe(['simple'], merged);

    ep.publish(['simple']);
    expect(listener.count).toEqual(0);

    ep.publish(['simple']);
    expect(listener.count).toEqual(0);

    jasmine.clock().tick(17);
    expect(listener.count).toEqual(0);

    jasmine.clock().tick(1300);
    expect(listener.count).toEqual(1);
  });

  it('merges with opt_X specified', function() {
    var merged = GLOBAL.EventService.merged(listener, 1300, GLOBAL);

    ep.subscribe(['simple'], merged);

    ep.publish(['simple']);
    expect(listener.count).toEqual(0);

    ep.publish(['simple']);
    expect(listener.count).toEqual(0);

    jasmine.clock().tick(1300);
    expect(listener.count).toEqual(1);
  });


  it('unsubscribes when requested', function() {
    var EventService = GLOBAL.EventService;
    var merged = EventService.merged(EventService.oneTime(listener));

    ep.subscribe(['simple'], merged);

    ep.publish(['simple']);
    expect(listener.count).toEqual(0);

    ep.publish(['simple']);
    expect(listener.count).toEqual(0);

    jasmine.clock().tick(17);
    expect(listener.count).toEqual(1);
    expect(ep.hasListeners(['simple'])).toBe(false);
    // and unsub happens due to the oneTime

    ep.publish(['simple']);
    expect(listener.count).toEqual(1);

    ep.publish(['simple']);
    expect(listener.count).toEqual(1);

    jasmine.clock().tick(17); // should be unsubbed,
    expect(listener.count).toEqual(1); // so no change

  });
});

describe('EventService.async', function() {
  var ep;
  var listener;

  beforeEachTest(function() {
    ep = GLOBAL.EventPublisher.create({});
    listener = function(publisher, topic, unsub) {
      listener.last_topic = topic;
      listener.last_unsub = unsub;
      listener.last_args = arguments;
      listener.count += 1;
    }
    listener.count = 0;
    jasmine.clock().install();
  });
  afterEach(function() {
    ep = null;
    listener = null;
    jasmine.clock().uninstall();
  });

  it('async invokes each listener', function() {
    var delayed = GLOBAL.EventService.async(listener);

    ep.subscribe(['simple'], delayed);

    ep.publish(['simple']);
    expect(listener.count).toEqual(0);

    ep.publish(['simple']);
    expect(listener.count).toEqual(0);

    jasmine.clock().tick(1);

    expect(listener.count).toEqual(2);
  });

  it('async with opt_X specified', function() {
    var X = { setTimeout: GLOBAL.setTimeout };
    var delayed = GLOBAL.EventService.async(listener, X);

    ep.subscribe(['simple'], delayed);

    ep.publish(['simple']);
    expect(listener.count).toEqual(0);

    ep.publish(['simple']);
    expect(listener.count).toEqual(0);

    jasmine.clock().tick(1);
    expect(listener.count).toEqual(2);
  });


});


describe('EventService.framed', function() {
  var ep;
  var listener;

  beforeEachTest(function() {
    ep = GLOBAL.EventPublisher.create({});
    listener1 = function(publisher, topic, unsub) {
      listener1.count += 1;
    }
    listener1.count = 0;
    listener2 = function(publisher, topic, unsub) {
      listener2.count += 1;
    }
    listener2.count = 0;
    jasmine.clock().install();
  });
  afterEach(function() {
    ep = null;
    listener1 = null;
    listener2 = null;
    jasmine.clock().uninstall();
  });

  it('framed listeners accumulate', function() {
    var X = {
      requestAnimationFrame: function(fn) {
        setTimeout(fn, 1);
      }
    };
    var delayed1 = GLOBAL.EventService.framed(listener1, X);
    var delayed2 = GLOBAL.EventService.framed(listener2, X);
    ep.subscribe(['simple'], delayed1);
    ep.subscribe(['simple'], delayed2);

    ep.publish(['simple']);
    expect(listener1.count).toEqual(0);
    expect(listener2.count).toEqual(0);

    ep.publish(['simple']);
    expect(listener1.count).toEqual(0);
    expect(listener2.count).toEqual(0);

    jasmine.clock().tick(1);
    expect(listener1.count).toEqual(1);
    expect(listener2.count).toEqual(1);
  });

  it('coverage that will not work without Node requestAnimationFrame support', function() {
    // TODO: fix this 'polyfill' as we shouldn't change the global object.
    // This should be a browser test, most likely.
    requestAnimationFrame = function(fn) {
        setTimeout(fn, 1);
    };
    GLOBAL.EventService.framed(listener1);
  });

});









describe('EventPublisher.hasListeners()', function() {
  var ep;

  beforeEachTest(function() {
    ep = GLOBAL.EventPublisher.create({});
  });
  afterEach(function() {
    ep = null;
  });

  it('reports correctly for no listeners, ever', function() {
    expect(ep.subs_).toBeNull();
    expect(ep.hasListeners()).toBe(false);
  });

  it('reports correctly for no listeners after removing them', function() {
    ep.subs_ = {}; // listeners might have been there, but removed.
    expect(ep.hasListeners()).toBe(false);
  });

  it('reports correctly for one listener', function() {
    ep.subs_ = { null: ['myFakeListener'] };
    expect(ep.hasListeners()).toBe(true);
  });

  it('reports correctly for an empty listener list', function() {
    ep.subs_ = { null: [] };
    expect(ep.hasListeners()).toBe(false);
  });

  it('reports correctly for a specific listener', function() {
    ep.subs_ = { 'cake': { null: ['myFakeListener'] } };
    expect(ep.hasListeners(['cake'])).toBe(true);
  });

  it('reports correctly and ignores a specific listener', function() {
    ep.subs_ = { 'cake': { null: ['myFakeListener'] } };
    expect(ep.hasListeners(['lie'])).toBe(false);
  });

  it('reports correctly for a multi-level topic with a listener', function() {
    ep.subs_ = { 'the' : { 'cake': { 'is' : { null: ['myFakeListener'] } } } };
    expect(ep.hasListeners(['the','cake','is'])).toBe(true);
  });

  it('reports correctly for a multi-level topic with a partial-match listener', function() {
    ep.subs_ = { 'the' : { 'cake': { 'is' : { null: [] } } }, null: ['myFakeListener'] };
    expect(ep.hasListeners(['the','cake'])).toBe(true);
  });

  it('reports correctly for a multi-level topic with no listener', function() {
    ep.subs_ = { 'the' : { 'cake': { 'is' : { null: ['myFakeListener'] } } } };
    expect(ep.hasListeners(['the','cake'])).toBe(false);
  });

  it('reports correctly for a multi-level topic that is complete but empty listener list', function() {
    ep.subs_ = { 'the' : { 'cake': { 'is' : { null: [] } } } };
    expect(ep.hasListeners(['the','cake', 'is'])).toBe(false);
  });

  it('reports correctly for a multi-level topic with a wildcard', function() {
    ep.subs_ = { 'the' : { 'cake': { 'is' : { null: ['myFakeListener'] } } } };
    expect(ep.hasListeners(['the', GLOBAL.EventService.WILDCARD])).toBe(true);
  });

  it('reports correctly for a root level wildcard', function() {
    ep.subs_ = { 'the' : { 'cake': { 'is' : { null: ['myFakeListener'] } } } };
    expect(ep.hasListeners([GLOBAL.EventService.WILDCARD])).toBe(true);
  });

  it('reports correctly for a given topic but no listeners', function() {
    expect(ep.hasListeners([GLOBAL.EventService.WILDCARD])).toBe(false);
  });

});

describe('EventPublisher.subscribe()/.sub_()', function() {
  var ep;
  var listener;

  beforeEachTest(function() {
    ep = GLOBAL.EventPublisher.create({});
    listener = function(publisher, topic, unsub) {
      listener.last_topic = topic;
      listener.last_unsub = unsub;
      listener.last_args = arguments;
    }
  });
  afterEach(function() {
    ep = null;
    listener = null;
  });

  it('subscribes for a single topic', function() {
    ep.subscribe(['simple'], listener);
    expect(ep.hasListeners(['simple'])).toBe(true);
  });
  it('subscribes for a nested topics', function() {
    ep.subscribe(['nested', 'topics'], listener);
    expect(ep.hasListeners(['nested'])).toBe(false);
    expect(ep.hasListeners(['nested', 'topics'])).toBe(true);
  });
  it('subscribes to two different topics', function() {
    ep.subscribe(['one'], listener);
    ep.subscribe(['two'], listener);
    expect(ep.hasListeners(['one'])).toBe(true);
    expect(ep.hasListeners(['two'])).toBe(true);
  });
  it('subscribes to two different topics with multiple listeners', function() {
    ep.subscribe(['one'], listener);
    ep.subscribe(['two'], listener);
    ep.subscribe(['one'], 'fake-o-listener1');
    ep.subscribe(['two'], 'fake-o-listener2');
    expect(ep.hasListeners(['one'])).toBe(true);
    expect(ep.hasListeners(['two'])).toBe(true);
  });

  //   it('subscribes with a wildcard', function() {  // not valid case TODO
  //     ep.subscribe([EventService.WILDCARD], listener);
  //     expect(ep.hasListeners()).toBe(true);
  //   });
});

describe('EventPublisher.publish()/.pub_()', function() {
  var ep;
  var listener1;
  var listener2;

  beforeEachTest(function() {
    ep = GLOBAL.EventPublisher.create({});
    listener1 = function(publisher, topic, unsub) {
      listener1.last_publisher = publisher;
      listener1.last_topic = topic;
      listener1.last_unsub = unsub;
      listener1.last_args = arguments;
    }
    listener2 = function(publisher, topic, unsub) {
      listener2.last_publisher = publisher;
      listener2.last_topic = topic;
      listener2.last_unsub = unsub;
      listener2.last_args = arguments;
    }
  });
  afterEach(function() {
    ep = null;
    listener1 = null;
    listener2 = null;
  });

  it('publishes with no subscribers', function() {
    expect(ep.publish(['*'])).toEqual(0);
  });
  it('covers internal sanity case of no subscribers', function() {
    expect(ep.pub_(null, 0, ['no'], [])).toEqual(0);
  });
  it('publishes broadcast messages', function() {
    ep.subscribe([], listener1);
    ep.subscribe(['something','else'], listener2);
    expect(ep.publish(['*'])).toEqual(2);
    expect(listener1.last_topic).toEqual(['*']);
    expect(listener2.last_topic).toEqual(['*']);
  });
  it('publishes a specific nested topic', function() {
    ep.subscribe([], listener1);
    ep.subscribe(['something','else'], listener2);
    expect(ep.publish(['something','else'], 'arg')).toEqual(2);
    expect(listener1.last_topic).toEqual(['something','else']);
    expect(listener1.last_args[3]).toEqual('arg');
    expect(listener2.last_topic).toEqual(['something','else']);
  });
  it('publishes a specific nested wildcard', function() {
    ep.subscribe(['something'], listener1);
    ep.subscribe(['something','else'], listener2);
    expect(ep.publish(['something','*'], 'arg')).toEqual(2);
    expect(listener1.last_topic).toEqual(['something','*']);
    expect(listener1.last_args[3]).toEqual('arg');
    expect(listener2.last_topic).toEqual(['something','*']);
  });
  it('publishes a specific nested topic ending in empty string', function() {
    ep.subscribe(['something'], listener1);
    ep.subscribe(['something','else'], listener2);
    expect(ep.publish(['something',''], 'arg')).toEqual(1);
    expect(listener1.last_topic).toEqual(['something','']);
    expect(listener1.last_args[3]).toEqual('arg');
    expect(listener2.last_topic).not.toEqual(['something','']);
  });

  it('coverage for deepPublish(), which passes though to publish', function() {
    expect(ep.deepPublish(['*'])).toEqual(0);
  });

});

describe('EventPublisher.lazyPublish()', function() {
  var ep;
  var listener1;
  var argFn;

  beforeEachTest(function() {
    ep = GLOBAL.EventPublisher.create({});
    listener1 = function(publisher, topic, unsub) {
      listener1.last_publisher = publisher;
      listener1.last_topic = topic;
      listener1.last_unsub = unsub;
      listener1.last_args = arguments;
    }
    argFn = function() {
      argFn.wasHit = true;
      return [['something'], 'arg'];
    }
    argFn.wasHit = false;
  });
  afterEach(function() {
    ep = null;
    listener1 = null;
    argFn = null;
  });

  it('triggers the argument function when a listener is present', function() {
    ep.subscribe(['something'], listener1);
    ep.lazyPublish(['something'], argFn);
    expect(argFn.wasHit).toBe(true);
    expect(listener1.last_args[3]).toEqual('arg');
  });
  it('does not trigger the argument function when no listener is present', function() {
    ep.subscribe(['nothing'], listener1);
    ep.lazyPublish(['something'], argFn);
    expect(argFn.wasHit).toBe(false);
  });
});

describe('EventPublisher.unsubscribe()/unsub_()', function() {
  var ep;
  var listener1;
  var listener2;

  beforeEachTest(function() {
    ep = GLOBAL.EventPublisher.create({});
    listener1 = function(publisher, topic, unsub) {
      listener1.last_publisher = publisher;
      listener1.last_topic = topic;
      listener1.last_unsub = unsub;
      listener1.last_args = arguments;
    }
    listener2 = function(publisher, topic, unsub) {
      listener2.last_publisher = publisher;
      listener2.last_topic = topic;
      listener2.last_unsub = unsub;
      listener2.last_args = arguments;
    }
  });
  afterEach(function() {
    ep = null;
    listener1 = null;
    listener2 = null;
  });


  it('unsubs broadcast messages', function() {
    ep.subscribe([], listener1);
    ep.subscribe(['something','else'], listener2);
    expect(ep.publish(['*'], 'phase1')).toEqual(2);
    expect(listener1.last_args[3]).toEqual('phase1');
    expect(listener2.last_args[3]).toEqual('phase1');

    ep.unsubscribe([], listener1);
    expect(ep.publish(['*'], 'phase2')).toEqual(1);
    expect(listener1.last_args[3]).toEqual('phase1');
    expect(listener2.last_args[3]).toEqual('phase2');
  });
  it('unsubs nothing', function() {
    ep.unsubscribe(['hello'], listener1);
  });
  it('unsubs a phantom (double)unsubscribe', function() {
    ep.subscribe(['something','else'], listener2);
    ep.subscribe(['something','else'], listener1);
    ep.unsubscribe(['something','else'], listener2);
    ep.unsubscribe(['something','else'], listener2);

    ep.publish(['something','else'], 'arg');
  });
  it('cleans up after complete unsub', function() {
    ep.subscribe(['something','else'], listener2);
    ep.subscribe(['something','else'], listener1);

    ep.unsubscribe(['something','else'], listener1);
    ep.unsubscribe(['something','else'], listener2);

    expect(ep.subs_).toEqual({});
  });
  it('unsubs with a key with no listeners', function() {
    ep.subscribe(['something','else'], listener1);
    ep.unsubscribe(['something'], listener2);
  });
  it('unsubs with a key that does not exist', function() {
    ep.subscribe(['something','else'], listener1);
    ep.unsubscribe(['what'], listener2);
  });
  it('cleans up after unsubscribe all', function() {
    ep.subscribe(['something','else'], listener2);
    ep.subscribe(['something','else'], listener1);

    ep.unsubscribeAll();

    expect(ep.subs_).toEqual({});
  });

});


describe('EventPublisher listener-unsubscribe', function() {
  var ep;
  var listener1;
  var listener2;

  beforeEachTest(function() {
    ep = GLOBAL.EventPublisher.create({});
    listener1 = function(publisher, topic, unsub) {
      listener1.last_publisher = publisher;
      listener1.last_topic = topic;
      listener1.last_unsub = unsub;
      listener1.last_args = arguments;
    }
    listener2 = function(publisher, topic, unsub) {
      listener2.last_publisher = publisher;
      listener2.last_topic = topic;
      listener2.last_unsub = unsub;
      listener2.last_args = arguments;
      // unsubscribe
      unsub();
    }
  });
  afterEach(function() {
    ep = null;
    listener1 = null;
    listener2 = null;
  });


  it('unsubs listener', function() {
    // listener2 is set up to unsubscribe itself
    ep.subscribe([], listener1);
    ep.subscribe(['something','else'], listener2);
    expect(ep.publish(['something','else'], 'phase1')).toEqual(2); // both listeners fired
    expect(listener1.last_args[3]).toEqual('phase1');
    expect(listener2.last_args[3]).toEqual('phase1');

    expect(ep.publish(['something','else'], 'phase2')).toEqual(1); // only one left after unsub
    expect(listener1.last_args[3]).toEqual('phase2');
    expect(listener2.last_args[3]).toEqual('phase1');
  });

  it('unsubs listener published with wildcard', function() {
    ep.subscribe([], listener1);
    ep.subscribe(['something','else'], listener2);

    expect(ep.publish(['*'], 'phase1')).toEqual(2); // wildcard hits a different code path
    expect(listener1.last_args[3]).toEqual('phase1');
    expect(listener2.last_args[3]).toEqual('phase1');

    expect(ep.publish(['*'], 'phase2')).toEqual(1);
    expect(listener1.last_args[3]).toEqual('phase2');
    expect(listener2.last_args[3]).toEqual('phase1');
  });


});

describe('EventPublisher async-publish', function() {
  var ep;
  var listener1;

  beforeEachTest(function() {
    ep = GLOBAL.EventPublisher.create({});
    listener1 = function(publisher, topic, unsub) {
      listener1.last_publisher = publisher;
      listener1.last_topic = topic;
      listener1.last_unsub = unsub;
      listener1.last_args = arguments;
    }
    jasmine.clock().install();
  });
  afterEach(function() {
    ep = null;
    listener1 = null;
    jasmine.clock().uninstall();
  });

  it("calls publish only after a tick", function() {

    ep.subscribe(['later'], listener1);
    ep.publishAsync(['later']);

    expect(listener1.last_topic).toBeUndefined();

    jasmine.clock().tick(1);

    expect(listener1.last_topic).toEqual(['later']);

  });
});


describe('PropertyChangePublisher.add/removePropertyListener()', function() {
  var listener;
  var pcp;

  beforeEachTest(function() {
    pcp = GLOBAL.PropertyChangePublisher.create({});
    listener = function(publisher, topic, unsub) {
      listener.last_topic = topic;
      listener.last_unsub = unsub;
      listener.last_args = arguments;
    }
  });
  afterEach(function() {
    pcp = null;
    listener = null;
  });

  it('adds/removes a listener for a property', function() {
    pcp.addPropertyListener('myProp', listener);
    expect(pcp.hasListeners([GLOBAL.PropertyChangePublisher.PROPERTY_TOPIC, 'myProp'])).toBe(true);

    pcp.removePropertyListener('myProp', listener);
    expect(pcp.hasListeners([GLOBAL.PropertyChangePublisher.PROPERTY_TOPIC, 'myProp'])).toBe(false);
  });
  it('adds/removes a listener for all property changes', function() {
    pcp.addPropertyListener(null, listener);
    expect(pcp.hasListeners([GLOBAL.PropertyChangePublisher.PROPERTY_TOPIC])).toBe(true);

    pcp.removePropertyListener(null, listener);
    expect(pcp.hasListeners([GLOBAL.PropertyChangePublisher.PROPERTY_TOPIC])).toBe(false);
  });
  it('adds/removes a listener for all property changes with addListener/removeListener shortcuts', function() {
    pcp.addListener(listener);
    expect(pcp.hasListeners([GLOBAL.PropertyChangePublisher.PROPERTY_TOPIC])).toBe(true);

    pcp.removeListener(listener);
    expect(pcp.hasListeners([GLOBAL.PropertyChangePublisher.PROPERTY_TOPIC])).toBe(false);
  });


});

describe('PropertyChangePublisher.globalChange()', function() {
  var listener;
  var pcp;

  beforeEachTest(function() {
    pcp = GLOBAL.PropertyChangePublisher.create({});
    listener = function(publisher, topic, unsub) {
      listener.count += 1;
    }
    listener.count = 0;
  });
  afterEach(function() {
    pcp = null;
    listener = null;
  });

  it('triggers all property listeners', function() {
    pcp.addPropertyListener('myProp', listener);
    pcp.addListener(listener);
    pcp.addPropertyListener('anotherprop', listener);

    pcp.globalChange();
    expect(listener.count).toEqual(3);
  });


});



describe('PropertyChangePublisher.propertyChange()', function() {
  var listener;
  var pcp;

  beforeEachTest(function() {
    pcp = GLOBAL.PropertyChangePublisher.create({});
    listener = function(publisher, topic, unsub, old, nu) {
      listener.last_topic = topic;
      listener.last_unsub = unsub;
      listener.last_args = arguments;
      listener.last_old = old;
      listener.last_nu = nu;
    }
  });
  afterEach(function() {
    pcp = null;
    listener = null;
  });

  it('covers no listeners', function() {
    pcp.propertyChange('myProp', 1, 3);
  });

  it('triggers listeners when old/nu value differs', function() {
    pcp.addPropertyListener('myProp', listener);

    pcp.propertyChange('myProp', 1, 3);
    expect(listener.last_old).toEqual(1);
    expect(listener.last_nu).toEqual(3);

    pcp.propertyChange('myProp', 3, 7);
    expect(listener.last_old).toEqual(3);
    expect(listener.last_nu).toEqual(7);

    pcp.propertyChange('myProp', 3, 3);
    expect(listener.last_old).toEqual(3);
    expect(listener.last_nu).toEqual(7);

    pcp.propertyChange('myProp', NaN, NaN); // special equality check case
    expect(listener.last_old).toEqual(3);
    expect(listener.last_nu).toEqual(7);
  });


});
