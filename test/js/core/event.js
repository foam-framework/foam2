
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
  var listener = function(subscription, topic, topic2, old, nu) {
    listener.last_topic = topic+"."+topic2;
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
  foam.CLASS({
    name: 'TopicModel',
    topics: [
      'change',
      'other'
    ],
  });
  return TopicModel.create();
}
function modelWithProperty() {
  foam.CLASS({
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

    ep.change.subscribe('simple', one);

    ep.change.publish('simple');
    expect(listener.count).toEqual(1);

    // listener should be gone now
    //expect(ep.change.hasListeners_('simple')).toBe(false);
    ep.change.publish('simple');
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

    ep.change.subscribe(logger);

    ep.change.publish();
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

    ep.change.subscribe('simple', merged);

    ep.change.publish('simple');
    expect(listener.count).toEqual(0);

    ep.change.publish('simple');
    expect(listener.count).toEqual(0);

    jasmine.clock().tick(17);

    expect(listener.count).toEqual(1);

  });

  it('merges with delay specified', function() {
    var merged = foam.events.merged(listener, 1300);

    ep.change.subscribe('simple', merged);

    ep.change.publish('simple');
    expect(listener.count).toEqual(0);

    ep.change.publish('simple');
    expect(listener.count).toEqual(0);

    jasmine.clock().tick(17);
    expect(listener.count).toEqual(0);

    jasmine.clock().tick(1300);
    expect(listener.count).toEqual(1);
  });

  it('merges with opt_X specified', function() {
    var merged = foam.events.merged(listener, 1300, GLOBAL);

    ep.change.subscribe('simple', merged);

    ep.change.publish('simple');
    expect(listener.count).toEqual(0);

    ep.change.publish('simple');
    expect(listener.count).toEqual(0);

    jasmine.clock().tick(1300);
    expect(listener.count).toEqual(1);
  });


  it('unsubscribes when requested', function() {
    var merged = foam.events.merged(foam.events.oneTime(listener));

    ep.change.subscribe('simple', merged);

    ep.change.publish('simple');
    expect(listener.count).toEqual(0);

    ep.change.publish('simple');
    expect(listener.count).toEqual(0);

    jasmine.clock().tick(17);
    expect(listener.count).toEqual(1);
    expect(ep.change.hasListeners_(['simple'])).toBe(false);
    // and unsub happens due to the oneTime

    ep.change.publish('simple');
    expect(listener.count).toEqual(1);

    ep.change.publish('simple');
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

    ep.change.subscribe('simple', delayed);

    ep.change.publish('simple');
    expect(listener.count).toEqual(0);

    ep.change.publish('simple');
    expect(listener.count).toEqual(0);

    jasmine.clock().tick(1);

    expect(listener.count).toEqual(2);
  });

  it('async with opt_X specified', function() {
    var X = { setTimeout: setTimeout };
    var delayed = foam.events.async(listener, X);

    ep.change.subscribe('simple', delayed);

    ep.change.publish('simple');
    expect(listener.count).toEqual(0);

    ep.change.publish('simple');
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
    ep.change.subscribe('simple', delayed1);
    ep.change.subscribe('simple', delayed2);

    ep.change.publish('simple');
    expect(listener1.count).toEqual(0);
    expect(listener2.count).toEqual(0);

    ep.change.publish('simple');
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



// describe('foam.events.Observable.hasListeners()', function() {
//   var ep;
//   var listener;
//   var listener2;
//   var listener3;

//   beforeEachTest(function() {
//     ep = modelWithTopic();
//     listener = createTestListener();
//     listener2 = createTestListener();
//     listener3 = createTestListener();
//   });
//   afterEach(function() {
//     ep = null;
//     listener = null;
//     listener2 = null;
//     listener3 = null;
//   });

//   it('reports correctly for no listeners, ever', function() {
//     expect(ep.change.hasListeners_()).toBe(false);
//     expect(ep.change.hasListeners_('')).toBe(false);
//   });
//   it('reports correctly for no listeners after removing one', function() {
//     ep.change.subscribe(listener);
//     expect(ep.change.hasListeners_()).toBe(true);

//     ep.change.unsubscribe(listener);
//     expect(ep.change.hasListeners_()).toBe(false);
//   });
//   it('reports correctly for no listeners after removing one with topic', function() {
//     ep.change.subscribe('flange', listener);
//     expect(ep.change.hasListeners_('flange')).toBe(true);
//     expect(ep.change.hasListeners_()).toBe(false);

//     ep.change.unsubscribe('flange', listener);
//     expect(ep.change.hasListeners_('flange')).toBe(false);
//   });

//   it('reports correctly for no listeners after removing three', function() {
//     ep.change.subscribe(listener);
//     ep.change.subscribe(listener2);
//     ep.change.subscribe(listener3);
//     expect(ep.change.hasListeners_()).toBe(true);

//     ep.change.unsubscribe(listener2);
//     ep.change.unsubscribe(listener);
//     ep.change.unsubscribe(listener3);
//     expect(ep.change.hasListeners_()).toBe(false);
//   });
//   it('reports correctly for no listeners after removing three with topic', function() {
//     ep.change.subscribe('arch', listener);
//     ep.change.subscribe('arch', listener2);
//     ep.change.subscribe('arch', listener3);
//     expect(ep.change.hasListeners_('arch')).toBe(true);

//     ep.change.unsubscribe('arch', listener2);
//     ep.change.unsubscribe('arch', listener);
//     ep.change.unsubscribe('arch', listener3);
//     expect(ep.change.hasListeners_('arch')).toBe(false);
//   });
//   it('reports correctly for no listeners after destroying', function() {
//     ep.change.subscribe(listener);
//     ep.change.subscribe(listener2);
//     ep.change.subscribe('arch', listener3);
//     expect(ep.change.hasListeners_()).toBe(true);
//     expect(ep.change.hasListeners_('arch')).toBe(true);

//     ep.change.destroy();
//     expect(ep.change.hasListeners_()).toBe(false);
//     expect(ep.change.hasListeners_('arch')).toBe(false);
//   });


// });


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
    ep.change.subscribe(listener);
    ep.change.subscribe(listener2);
    ep.change.subscribe(listener3);
//    expect(ep.change.hasListeners_()).toBe(true);

    ep.change.unsubscribe(listener);
    ep.change.publish();
    expect(listener.count).toEqual(0);
    expect(listener2.count).toEqual(1);
    expect(listener3.count).toEqual(1);
  });
   it('publishes correctly after removing middle of three', function() {
    ep.change.subscribe(listener);
    ep.change.subscribe(listener2);
    ep.change.subscribe(listener3);
//    expect(ep.change.hasListeners_()).toBe(true);

    ep.change.unsubscribe(listener2);
    ep.change.publish();
    expect(listener.count).toEqual(1);
    expect(listener2.count).toEqual(0);
    expect(listener3.count).toEqual(1);
  });
  it('publishes correctly after removing last of three', function() {
    ep.change.subscribe(listener);
    ep.change.subscribe(listener2);
    ep.change.subscribe(listener3);
//    expect(ep.change.hasListeners_()).toBe(true);

    ep.change.unsubscribe(listener3);
    ep.change.publish();
    expect(listener.count).toEqual(1);
    expect(listener2.count).toEqual(1);
    expect(listener3.count).toEqual(0);
  });

});




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
    pcp.propertyChange.subscribe(listener);

    pcp.propA = 1;
    pcp.propA = 3;
    expect(listener.last_old).toEqual(1);
    expect(listener.last_nu).toEqual(3);

    pcp.propA = 7;
    expect(listener.last_old).toEqual(3);
    expect(listener.last_nu).toEqual(7);

    pcp.propA = 7;
    expect(listener.last_old).toEqual(3);
    expect(listener.last_nu).toEqual(7);

    pcp.propA = NaN;
    pcp.propA = NaN;
    expect(listener.last_old).toEqual(7);
    expect(listener.last_nu).toEqual(NaN);
  });
});

