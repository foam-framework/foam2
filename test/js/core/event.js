
var corePromise = global.loadCoreTo('core/mm.js');
var beforeEachTest = function(callback) {
  return beforeEach(function(done) {
    corePromise.then(function() {
      callback();
      done();
    });
  });
};

function createTestListener(doUnsub) {
  // also handles property change, split into separate listener if necessary
  var listener = function(subscription, old, nu) {
    listener.last_topic = subscription.topic;
    listener.last_args = arguments;
    listener.last_old = old;
    listener.last_nu = nu;
    if (doUnsub) subscription.destroy();
    listener.count += 1;
  };
  listener.count = 0;
  return listener;
}

function modelWithTopic() {
  CLASS({
    name: 'TopicModel',
    topics: [
      'change',
      'other'
    ],
  });
  return TopicModel.create({});
}

describe('foam.events.oneTime', function() {
  var ep;
  var listener;

  beforeEachTest(function() {
    ep = modelWithTopic();
    listener = createTestListener();
  });
  afterEach(function() {
    ep = null;
    listener = null;
  });

  it('removes itself after one invokation', function() {
    var one = foam.events.oneTime(listener);

    ep.change.sub(one, 'simple');

    ep.change.pub('simple')
    expect(listener.count).toEqual(1);

    // listener should be gone now
    expect(ep.change.hasListeners_('simple')).toBe(false);
    ep.change.pub('simple')
    expect(listener.count).toEqual(1);
  });

});
/*
describe('foam.events.consoleLog', function() {
  var ep;
  var listener;

  beforeEachTest(function() {
    ep = modelWithTopic();
    listener = createTestListener();
  });
  afterEach(function() {
    ep = null;
    listener = null;
  });

  it('logs ok', function() {
    var logger = foam.events.consoleLog(listener);

    ep.change.sub(logger, 'simple');

    ep.change.pub('simple')
    expect(listener.count).toEqual(1);

  });

});
*/

/*
describe('foam.events.merged', function() {
  var ep;
  var listener;

  beforeEachTest(function() {
    ep = modelWithTopic();
    listener = createTestListener();
    jasmine.clock().install();
  });
  afterEach(function() {
    ep = null;
    listener = null;
    jasmine.clock().uninstall();
  });

  it('merges with default parameters', function() {
    var merged = foam.events.merged(listener);

    ep.change.sub(merged, 'simple');

    ep.change.pub('simple')
    expect(listener.count).toEqual(0);

    ep.change.pub('simple')
    expect(listener.count).toEqual(0);

    jasmine.clock().tick(17);

    expect(listener.count).toEqual(1);

  });

  it('merges with delay specified', function() {
    var merged = foam.events.merged(listener, 1300);

    ep.change.sub(merged, 'simple');

    ep.change.pub('simple')
    expect(listener.count).toEqual(0);

    ep.change.pub('simple')
    expect(listener.count).toEqual(0);

    jasmine.clock().tick(17);
    expect(listener.count).toEqual(0);

    jasmine.clock().tick(1300);
    expect(listener.count).toEqual(1);
  });

  it('merges with opt_X specified', function() {
    var merged = foam.events.merged(listener, 1300, GLOBAL);

    ep.change.sub(merged, 'simple');

    ep.change.pub('simple')
    expect(listener.count).toEqual(0);

    ep.change.pub('simple')
    expect(listener.count).toEqual(0);

    jasmine.clock().tick(1300);
    expect(listener.count).toEqual(1);
  });


  it('unsubscribes when requested', function() {
    var merged = foam.events.merged(foam.events.oneTime(listener));

    ep.change.sub(merged, 'simple');

    ep.change.pub('simple')
    expect(listener.count).toEqual(0);

    ep.change.pub('simple')
    expect(listener.count).toEqual(0);

    jasmine.clock().tick(17);
    expect(listener.count).toEqual(1);
    expect(ep.hasListeners(['simple'])).toBe(false);
    // and unsub happens due to the oneTime

    ep.change.pub('simple')
    expect(listener.count).toEqual(1);

    ep.change.pub('simple')
    expect(listener.count).toEqual(1);

    jasmine.clock().tick(17); // should be unsubbed,
    expect(listener.count).toEqual(1); // so no change

  });
});

describe('foam.events.async', function() {
  var ep;
  var listener;

  beforeEachTest(function() {
    ep = modelWithTopic();
    listener = createTestListener();
    jasmine.clock().install();
  });
  afterEach(function() {
    ep = null;
    listener = null;
    jasmine.clock().uninstall();
  });

  it('async invokes each listener', function() {
    var delayed = foam.events.async(listener);

    ep.change.sub(delayed, 'simple');

    ep.change.pub('simple')
    expect(listener.count).toEqual(0);

    ep.change.pub('simple')
    expect(listener.count).toEqual(0);

    jasmine.clock().tick(1);

    expect(listener.count).toEqual(2);
  });

  it('async with opt_X specified', function() {
    var X = { setTimeout: setTimeout };
    var delayed = foam.events.async(listener, X);

    ep.change.sub(delayed, 'simple');

    ep.change.pub('simple')
    expect(listener.count).toEqual(0);

    ep.change.pub('simple')
    expect(listener.count).toEqual(0);

    jasmine.clock().tick(1);
    expect(listener.count).toEqual(2);
  });


});


describe('foam.events.framed', function() {
  var ep;
  var listener;

  beforeEachTest(function() {
    ep = modelWithTopic();
    listener1 = createTestListener();
    listener2 = createTestListener();
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
    var delayed1 = foam.events.framed(listener1, X);
    var delayed2 = foam.events.framed(listener2, X);
    ep.change.sub(delayed1, 'simple');
    ep.change.sub(delayed2, 'simple');

    ep.change.pub('simple')
    expect(listener1.count).toEqual(0);
    expect(listener2.count).toEqual(0);

    ep.change.pub('simple')
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
    foam.events.framed(listener1);
  });

});
*/






/*

describe('EventPublisher.hasListeners()', function() {
  var ep;

  beforeEachTest(function() {
    ep = modelWithTopic();
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
    expect(ep.hasListeners(['the', foam.events.WILDCARD])).toBe(true);
  });

  it('reports correctly for a root level wildcard', function() {
    ep.subs_ = { 'the' : { 'cake': { 'is' : { null: ['myFakeListener'] } } } };
    expect(ep.hasListeners([foam.events.WILDCARD])).toBe(true);
  });

  it('reports correctly for a given topic but no listeners', function() {
    expect(ep.hasListeners([foam.events.WILDCARD])).toBe(false);
  });

});
*/

/*
describe('EventPublisher.subscribe()/.sub_()', function() {
  var ep;
  var listener;

  beforeEachTest(function() {
    ep = modelWithTopic();
    listener = createTestListener();
  });
  afterEach(function() {
    ep = null;
    listener = null;
  });

  it('subscribes for a single topic', function() {
    ep.change.sub(listener, 'simple');
    expect(ep.hasListeners(['simple'])).toBe(true);
  });
  it('subscribes for a nested topics', function() {
    ep.change.sub(listener, 'topics');
    expect(ep.hasListeners(['nested'])).toBe(false);
    expect(ep.hasListeners(['nested', 'topics'])).toBe(true);
  });
  it('subscribes to two different topics', function() {
    ep.change.sub(listener, 'one');
    ep.change.sub(listener, 'two');
    expect(ep.hasListeners(['one'])).toBe(true);
    expect(ep.hasListeners(['two'])).toBe(true);
  });
  it('subscribes to two different topics with multiple listeners', function() {
    ep.change.sub(listener, 'one');
    ep.change.sub(listener, 'two');
    ep.subscribe(['one'], 'fake-o-listener1');
    ep.subscribe(['two'], 'fake-o-listener2');
    expect(ep.hasListeners(['one'])).toBe(true);
    expect(ep.hasListeners(['two'])).toBe(true);
  });

  //   it('subscribes with a wildcard', function() {  // not valid case TODO
  //     ep.subscribe([foam.events.WILDCARD], listener);
  //     expect(ep.hasListeners()).toBe(true);
  //   });
});
*/

/*
describe('EventPublisher.publish()/.pub_()', function() {
  var ep;
  var listener1;
  var listener2;

  beforeEachTest(function() {
    ep = modelWithTopic();
    listener1 = createTestListener();
    listener2 = createTestListener();
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
    ep.change.sub(listener2, 'else');
    expect(ep.publish(['*'])).toEqual(2);
    expect(listener1.last_topic).toEqual(['*']);
    expect(listener2.last_topic).toEqual(['*']);
  });
  it('publishes a specific nested topic', function() {
    ep.subscribe([], listener1);
    ep.change.sub(listener2, 'else');
    expect(ep.publish(['something','else'], 'arg')).toEqual(2);
    expect(listener1.last_topic).toEqual(['something','else']);
    expect(listener1.last_args[3]).toEqual('arg');
    expect(listener2.last_topic).toEqual(['something','else']);
  });
  it('publishes a specific nested wildcard', function() {
    ep.change.sub(listener1, 'something');
    ep.change.sub(listener2, 'else');
    expect(ep.publish(['something','*'], 'arg')).toEqual(2);
    expect(listener1.last_topic).toEqual(['something','*']);
    expect(listener1.last_args[3]).toEqual('arg');
    expect(listener2.last_topic).toEqual(['something','*']);
  });
  it('publishes a specific nested topic ending in empty string', function() {
    ep.change.sub(listener1, 'something');
    ep.change.sub(listener2, 'else');
    expect(ep.publish(['something',''], 'arg')).toEqual(1);
    expect(listener1.last_topic).toEqual(['something','']);
    expect(listener1.last_args[3]).toEqual('arg');
    expect(listener2.last_topic).not.toEqual(['something','']);
  });

  it('coverage for deepPublish(), which passes though to publish', function() {
    expect(ep.deepPublish(['*'])).toEqual(0);
  });

});
*/
/*
describe('EventPublisher.lazyPublish()', function() {
  var ep;
  var listener1;
  var argFn;

  beforeEachTest(function() {
    ep = modelWithTopic();
    listener1 = createTestListener();
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
    ep.change.sub(listener1, 'something');
    ep.lazyPublish(['something'], argFn);
    expect(argFn.wasHit).toBe(true);
    expect(listener1.last_args[3]).toEqual('arg');
  });
  it('does not trigger the argument function when no listener is present', function() {
    ep.change.sub(listener1, 'nothing');
    ep.lazyPublish(['something'], argFn);
    expect(argFn.wasHit).toBe(false);
  });
});
*/

/*
describe('EventPublisher.unsubscribe()/unsub_()', function() {
  var ep;
  var listener1;
  var listener2;

  beforeEachTest(function() {
    ep = modelWithTopic();
    listener1 = createTestListener();
    listener2 = createTestListener();
  });
  afterEach(function() {
    ep = null;
    listener1 = null;
    listener2 = null;
  });


  it('unsubs broadcast messages', function() {
    ep.subscribe([], listener1);
    ep.change.sub(listener2, 'else');
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
    ep.change.sub(listener2, 'else');
    ep.change.sub(listener1, 'else');
    ep.unsubscribe(['something','else'], listener2);
    ep.unsubscribe(['something','else'], listener2);

    ep.publish(['something','else'], 'arg');
  });
  it('cleans up after complete unsub', function() {
    ep.change.sub(listener2, 'else');
    ep.change.sub(listener1, 'else');

    ep.unsubscribe(['something','else'], listener1);
    ep.unsubscribe(['something','else'], listener2);

    expect(ep.subs_).toEqual({});
  });
  it('unsubs with a key with no listeners', function() {
    ep.change.sub(listener1, 'else');
    ep.unsubscribe(['something'], listener2);
  });
  it('unsubs with a key that does not exist', function() {
    ep.change.sub(listener1, 'else');
    ep.unsubscribe(['what'], listener2);
  });
  it('cleans up after unsubscribe all', function() {
    ep.change.sub(listener2, 'else');
    ep.change.sub(listener1, 'else');

    ep.unsubscribeAll();

    expect(ep.subs_).toEqual({});
  });

});
*/

/*
describe('EventPublisher listener-unsubscribe', function() {
  var ep;
  var listener1;
  var listener2;

  beforeEachTest(function() {
    ep = modelWithTopic();
    listener1 = createTestListener();
    listener2 = createTestListener(true);
  });
  afterEach(function() {
    ep = null;
    listener1 = null;
    listener2 = null;
  });


  it('unsubs listener', function() {
    // listener2 is set up to unsubscribe itself
    ep.subscribe([], listener1);
    ep.change.sub(listener2, 'else');
    expect(ep.publish(['something','else'], 'phase1')).toEqual(2); // both listeners fired
    expect(listener1.last_args[3]).toEqual('phase1');
    expect(listener2.last_args[3]).toEqual('phase1');

    expect(ep.publish(['something','else'], 'phase2')).toEqual(1); // only one left after unsub
    expect(listener1.last_args[3]).toEqual('phase2');
    expect(listener2.last_args[3]).toEqual('phase1');
  });

  it('unsubs listener published with wildcard', function() {
    ep.subscribe([], listener1);
    ep.change.sub(listener2, 'else');

    expect(ep.publish(['*'], 'phase1')).toEqual(2); // wildcard hits a different code path
    expect(listener1.last_args[3]).toEqual('phase1');
    expect(listener2.last_args[3]).toEqual('phase1');

    expect(ep.publish(['*'], 'phase2')).toEqual(1);
    expect(listener1.last_args[3]).toEqual('phase2');
    expect(listener2.last_args[3]).toEqual('phase1');
  });
});
*/

/*
describe('EventPublisher async-publish', function() {
  var ep;
  var listener1;

  beforeEachTest(function() {
    ep = modelWithTopic();
    listener1 = createTestListener();
    jasmine.clock().install();
  });
  afterEach(function() {
    ep = null;
    listener1 = null;
    jasmine.clock().uninstall();
  });

  it("calls publish only after a tick", function() {

    ep.change.sub(listener1, 'later');
    ep.publishAsync(['later']);

    expect(listener1.last_topic).toBeUndefined();

    jasmine.clock().tick(1);

    expect(listener1.last_topic).toEqual(['later']);

  });
});
*/

/*
describe('PropertyChangePublisher.add/removePropertyListener()', function() {
  var listener;
  var pcp;

  beforeEachTest(function() {
    pcp = PropertyChangePublisher.create({});
    listener = createTestListener();
  });
  afterEach(function() {
    pcp = null;
    listener = null;
  });

  it('adds/removes a listener for a property', function() {
    pcp.addPropertyListener('myProp', listener);
    expect(pcp.hasListeners([PropertyChangePublisher.PROPERTY_TOPIC, 'myProp'])).toBe(true);

    pcp.removePropertyListener('myProp', listener);
    expect(pcp.hasListeners([PropertyChangePublisher.PROPERTY_TOPIC, 'myProp'])).toBe(false);
  });
  it('adds/removes a listener for all property changes', function() {
    pcp.addPropertyListener(null, listener);
    expect(pcp.hasListeners([PropertyChangePublisher.PROPERTY_TOPIC])).toBe(true);

    pcp.removePropertyListener(null, listener);
    expect(pcp.hasListeners([PropertyChangePublisher.PROPERTY_TOPIC])).toBe(false);
  });
  it('adds/removes a listener for all property changes with addListener/removeListener shortcuts', function() {
    pcp.addListener(listener);
    expect(pcp.hasListeners([PropertyChangePublisher.PROPERTY_TOPIC])).toBe(true);

    pcp.removeListener(listener);
    expect(pcp.hasListeners([PropertyChangePublisher.PROPERTY_TOPIC])).toBe(false);
  });
});
*/

/*
describe('PropertyChangePublisher.globalChange()', function() {
  var listener;
  var pcp;

  beforeEachTest(function() {
    pcp = PropertyChangePublisher.create({});
    listener = createTestListener();
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
*/

/*
describe('PropertyChangePublisher.propertyChange()', function() {
  var listener;
  var pcp;

  beforeEachTest(function() {
    pcp = PropertyChangePublisher.create({});
    listener = createTestListener();
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
*/
