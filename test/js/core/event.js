function createTestListener(doUnsub) {
  // also handles property change, split into separate listener if necessary
  var listener = function(subscription, topic, topic2, dyn) {
    listener.last_topic = topic+"."+topic2;
    listener.last_args = arguments;
    listener.last_old = dyn && dyn.getPrev();
    listener.last_nu = dyn && dyn.get();
    if (doUnsub) subscription.destroy();
    listener.count += 1;
  };
  listener.count = 0;
  return listener;
}

function modelWithTopic() {
  foam.CLASS({
    name: 'TopicModel',
    package: 'test',
    topics: [
      'change',
      { name: 'other' },
    ],
  });
  return test.TopicModel.create();
}
function modelWithProperty() {
  foam.CLASS({
    name: 'PropModel',
    package: 'test',
    properties: [
      { name: 'propA' },
      { name: 'propB', defaultValue: 4 }
    ],
  });
  return test.PropModel.create();
}

describe('foam.events.oneTime', function() {
  var ep;
  var listener;

  beforeEach(function() {
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
    ep.change.publish('simple');
    expect(listener.count).toEqual(1); // no change
  });

});

describe('foam.events.consoleLog', function() {
  var ep;
  var listener;

  beforeEach(function() {
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



describe('foam.X.merged', function() {
  var ep;
  var listener;

  beforeEach(function() {
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
    var merged = foam.X.merged(listener);

    ep.change.subscribe('simple', merged);

    ep.change.publish('simple');
    expect(listener.count).toEqual(0);

    ep.change.publish('simple');
    expect(listener.count).toEqual(0);

    jasmine.clock().tick(17);

    expect(listener.count).toEqual(1);

  });

  it('merges with delay specified', function() {
    var merged = foam.X.merged(listener, 1300);

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


  it('unsubscribes when requested', function() {
    var merged = foam.X.merged(foam.events.oneTime(listener));

    ep.change.subscribe('simple', merged);

    ep.change.publish('simple');
    expect(listener.count).toEqual(0);

    ep.change.publish('simple');
    expect(listener.count).toEqual(0);

    jasmine.clock().tick(17);
    expect(listener.count).toEqual(1);
    // and unsub happens due to the oneTime

    ep.change.publish('simple');
    expect(listener.count).toEqual(1);

    ep.change.publish('simple');
    expect(listener.count).toEqual(1);

    jasmine.clock().tick(17); // should be unsubbed,
    expect(listener.count).toEqual(1); // so no change

  });
});


describe('foam.X.async', function() {
  var ep;
  var listener;

  beforeEach(function() {
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
    var delayed = foam.X.async(listener);

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
    var delayed = foam.X.async(listener, X);

    ep.change.subscribe('simple', delayed);

    ep.change.publish('simple');
    expect(listener.count).toEqual(0);

    ep.change.publish('simple');
    expect(listener.count).toEqual(0);

    jasmine.clock().tick(1);
    expect(listener.count).toEqual(2);
  });


});


describe('foam.X.framed', function() {
  var ep;
  var listener;

  beforeEach(function() {
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
    var delayed1 = foam.X.framed(listener1);
    var delayed2 = foam.X.framed(listener2);
    ep.change.subscribe('simple', delayed1);
    ep.change.subscribe('simple', delayed2);

    ep.change.publish('simple');
    expect(listener1.count).toEqual(0);
    expect(listener2.count).toEqual(0);

    ep.change.publish('simple');
    expect(listener1.count).toEqual(0);
    expect(listener2.count).toEqual(0);

    jasmine.clock().tick(17);
    setTimeout(function() { // triggers requestAnimationFrame() in browser
      expect(listener1.count).toEqual(1);
      expect(listener2.count).toEqual(1);
    }, 0);
  });

});



describe('foam.X.Observable.sub()/.pub()', function() {
  var ep;
  var listener;
  var listener2;
  var listener3;

  beforeEach(function() {
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

  beforeEach(function() {
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
