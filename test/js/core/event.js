
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
  var listener = function(subscription, topic, old, nu) {
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
  return TopicModel.create();
}
function modelWithProperty() {
  CLASS({
    name: 'PropModel',
    properties: [
      { name: 'propA' },
      { name: 'propB', defaultValue: 4 }
    ],
  });
  return PropModel.create();
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

    ep.change.topic('simple').sub(one);

    ep.change.topic('simple').pub()
    expect(listener.count).toEqual(1);

    // listener should be gone now
    expect(ep.change.hasListeners_('simple')).toBe(false);
    ep.change.topic('simple').pub()
    expect(listener.count).toEqual(1);
  });

});

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

    ep.change.topic('simple').sub(logger);

    ep.change.topic('simple').pub()
    expect(listener.count).toEqual(1);

  });

});


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

    ep.change.topic('simple').sub(merged);

    ep.change.topic('simple').pub()
    expect(listener.count).toEqual(0);

    ep.change.topic('simple').pub()
    expect(listener.count).toEqual(0);

    jasmine.clock().tick(17);

    expect(listener.count).toEqual(1);

  });

  it('merges with delay specified', function() {
    var merged = foam.events.merged(listener, 1300);

    ep.change.topic('simple').sub(merged);

    ep.change.topic('simple').pub()
    expect(listener.count).toEqual(0);

    ep.change.topic('simple').pub()
    expect(listener.count).toEqual(0);

    jasmine.clock().tick(17);
    expect(listener.count).toEqual(0);

    jasmine.clock().tick(1300);
    expect(listener.count).toEqual(1);
  });

  it('merges with opt_X specified', function() {
    var merged = foam.events.merged(listener, 1300, GLOBAL);

    ep.change.topic('simple').sub(merged);

    ep.change.topic('simple').pub()
    expect(listener.count).toEqual(0);

    ep.change.topic('simple').pub()
    expect(listener.count).toEqual(0);

    jasmine.clock().tick(1300);
    expect(listener.count).toEqual(1);
  });


  it('unsubscribes when requested', function() {
    var merged = foam.events.merged(foam.events.oneTime(listener));

    ep.change.topic('simple').sub(merged);

    ep.change.topic('simple').pub()
    expect(listener.count).toEqual(0);

    ep.change.topic('simple').pub()
    expect(listener.count).toEqual(0);

    jasmine.clock().tick(17);
    expect(listener.count).toEqual(1);
    expect(ep.change.hasListeners_(['simple'])).toBe(false);
    // and unsub happens due to the oneTime

    ep.change.topic('simple').pub()
    expect(listener.count).toEqual(1);

    ep.change.topic('simple').pub()
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

    ep.change.topic('simple').sub(delayed);

    ep.change.topic('simple').pub()
    expect(listener.count).toEqual(0);

    ep.change.topic('simple').pub()
    expect(listener.count).toEqual(0);

    jasmine.clock().tick(1);

    expect(listener.count).toEqual(2);
  });

  it('async with opt_X specified', function() {
    var X = { setTimeout: setTimeout };
    var delayed = foam.events.async(listener, X);

    ep.change.topic('simple').sub(delayed);

    ep.change.topic('simple').pub()
    expect(listener.count).toEqual(0);

    ep.change.topic('simple').pub()
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
    ep.change.topic('simple').sub(delayed1);
    ep.change.topic('simple').sub(delayed2);

    ep.change.topic('simple').pub()
    expect(listener1.count).toEqual(0);
    expect(listener2.count).toEqual(0);

    ep.change.topic('simple').pub()
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



describe('foam.events.Observable.hasListeners()', function() {
  var ep;
  var listener;
  var listener2;
  var listener3;

  beforeEachTest(function() {
    ep = modelWithTopic();
    listener = createTestListener();
    listener2 = createTestListener();
    listener3 = createTestListener();    
  });
  afterEach(function() {
    ep = null;
    listener = null;
    listener2 = null;
    listener3 = null;
  });

  it('reports correctly for no listeners, ever', function() {
    expect(ep.change.hasListeners_()).toBe(false);
    expect(ep.change.hasListeners_('')).toBe(false);
  });
  it('reports correctly for no listeners after removing one', function() {
    ep.change.sub(listener);
    expect(ep.change.hasListeners_()).toBe(true);

    ep.change.unsub(listener);
    expect(ep.change.hasListeners_()).toBe(false);
  });
  it('reports correctly for no listeners after removing one with topic', function() {
    ep.change.topic('flange').sub(listener);
    expect(ep.change.hasListeners_('flange')).toBe(true);
    expect(ep.change.hasListeners_()).toBe(false);

    ep.change.topic('flange').unsub(listener);
    expect(ep.change.hasListeners_('flange')).toBe(false);
  });

  it('reports correctly for no listeners after removing three', function() {
    ep.change.sub(listener);
    ep.change.sub(listener2);
    ep.change.sub(listener3);
    expect(ep.change.hasListeners_()).toBe(true);

    ep.change.unsub(listener2);
    ep.change.unsub(listener);
    ep.change.unsub(listener3);
    expect(ep.change.hasListeners_()).toBe(false);
  });
  it('reports correctly for no listeners after removing three with topic', function() {
    ep.change.topic('arch').sub(listener);
    ep.change.topic('arch').sub(listener2);
    ep.change.topic('arch').sub(listener3);
    expect(ep.change.hasListeners_('arch')).toBe(true);

    ep.change.topic('arch').unsub(listener2);
    ep.change.topic('arch').unsub(listener);
    ep.change.topic('arch').unsub(listener3);
    expect(ep.change.hasListeners_('arch')).toBe(false);
  });
  it('reports correctly for no listeners after destroying', function() {
    ep.change.sub(listener);
    ep.change.sub(listener2);
    ep.change.topic('arch').sub(listener3);
    expect(ep.change.hasListeners_()).toBe(true);
    expect(ep.change.hasListeners_('arch')).toBe(true);

    ep.change.destroy();
    expect(ep.change.hasListeners_()).toBe(false);
    expect(ep.change.hasListeners_('arch')).toBe(false);
  });


});


describe('foam.events.Observable.sub()/.pub()', function() {
  var ep;
  var listener;
  var listener2;
  var listener3;

  beforeEachTest(function() {
    ep = modelWithTopic();
    listener = createTestListener();
    listener2 = createTestListener();
    listener3 = createTestListener();    
  });
  afterEach(function() {
    ep = null;
    listener = null;
    listener2 = null;
    listener3 = null;
  });

  it('publishes correctly after removing first of three', function() {
    ep.change.sub(listener);
    ep.change.sub(listener2);
    ep.change.sub(listener3);
    expect(ep.change.hasListeners_()).toBe(true);
    
    ep.change.unsub(listener);
    ep.change.pub(null);
    expect(listener.count).toEqual(0);
    expect(listener2.count).toEqual(1);
    expect(listener3.count).toEqual(1);
  });
  it('publishes correctly after removing middle of three', function() {
    ep.change.sub(listener);
    ep.change.sub(listener2);
    ep.change.sub(listener3);
    expect(ep.change.hasListeners_()).toBe(true);
    
    ep.change.unsub(listener2);
    ep.change.pub();
    expect(listener.count).toEqual(1);
    expect(listener2.count).toEqual(0);
    expect(listener3.count).toEqual(1);
  });
  it('publishes correctly after removing last of three', function() {
    ep.change.sub(listener);
    ep.change.sub(listener2);
    ep.change.sub(listener3);
    expect(ep.change.hasListeners_()).toBe(true);
    
    ep.change.unsub(listener3);
    ep.change.pub();
    expect(listener.count).toEqual(1);
    expect(listener2.count).toEqual(1);
    expect(listener3.count).toEqual(0);
  });


});

/*
describe('foam.events.Observable listener-unsubscribe', function() {
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
    ep.change.topic('else').sub(listener2);
    expect(ep.publish(['something','else'], 'phase1')).toEqual(2); // both listeners fired
    expect(listener1.last_args[3]).toEqual('phase1');
    expect(listener2.last_args[3]).toEqual('phase1');

    expect(ep.publish(['something','else'], 'phase2')).toEqual(1); // only one left after unsub
    expect(listener1.last_args[3]).toEqual('phase2');
    expect(listener2.last_args[3]).toEqual('phase1');
  });

  it('unsubs listener published with wildcard', function() {
    ep.subscribe([], listener1);
    ep.change.topic('else').sub(listener2);

    expect(ep.publish(['*'], 'phase1')).toEqual(2); // wildcard hits a different code path
    expect(listener1.last_args[3]).toEqual('phase1');
    expect(listener2.last_args[3]).toEqual('phase1');

    expect(ep.publish(['*'], 'phase2')).toEqual(1);
    expect(listener1.last_args[3]).toEqual('phase2');
    expect(listener2.last_args[3]).toEqual('phase1');
  });
});
*/


describe('PropertyChangePublisher.propertyChange()', function() {
  var listener;
  var pcp;

  beforeEachTest(function() {
    pcp = modelWithProperty();
    listener = createTestListener();
  });
  afterEach(function() {
    pcp = null;
    listener = null;
  });

  it('triggers listeners when old/nu value differs', function() {
    pcp.onPropertyChange.topic('propA').sub(listener);

    pcp.propA = 1;
    pcp.propA = 3;
    expect(listener.last_old).toEqual(1);
    expect(listener.last_nu).toEqual(3);

    // pcp.propertyChange('myProp', 3, 7);
    // expect(listener.last_old).toEqual(3);
    // expect(listener.last_nu).toEqual(7);
    //
    // pcp.propertyChange('myProp', 3, 3);
    // expect(listener.last_old).toEqual(3);
    // expect(listener.last_nu).toEqual(7);
    //
    // pcp.propertyChange('myProp', NaN, NaN); // special equality check case
    // expect(listener.last_old).toEqual(3);
    // expect(listener.last_nu).toEqual(7);
  });
});

