/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function createTestListener(doUnsub) {
  // also handles property change, split into separate listener if necessary
  var listener = function(subscription, topic, topic2, dyn) {
    listener.last_topic = topic+"."+topic2;
    listener.last_args = arguments;
    listener.last_old = dyn && dyn.getPrev();
    listener.last_nu = dyn && dyn.get();
    if (doUnsub) subscription.detach();
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
  return test.TopicModel.create(undefined, foam.__context__);
}
function modelWithProperty() {
  foam.CLASS({
    name: 'PropModel',
    package: 'test',
    properties: [
      { name: 'propA' },
      { name: 'propB', value: 4 }
    ],
  });
  return test.PropModel.create(undefined, foam.__context__);
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

    ep.change.sub('simple', one);

    ep.change.pub('simple');
    expect(listener.count).toEqual(1);

    // listener should be gone now
    ep.change.pub('simple');
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

    ep.change.sub(logger);

    ep.change.pub();
    expect(listener.count).toEqual(1);

  });

});



describe('foam.__context__.merged', function() {
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
    var merged = foam.__context__.merged(listener);

    ep.change.sub('simple', merged);

    ep.change.pub('simple');
    expect(listener.count).toEqual(0);

    ep.change.pub('simple');
    expect(listener.count).toEqual(0);

    jasmine.clock().tick(17);

    expect(listener.count).toEqual(1);

  });

  it('merges with delay specified', function() {
    var merged = foam.__context__.merged(listener, 1300);

    ep.change.sub('simple', merged);

    ep.change.pub('simple');
    expect(listener.count).toEqual(0);

    ep.change.pub('simple');
    expect(listener.count).toEqual(0);

    jasmine.clock().tick(17);
    expect(listener.count).toEqual(0);

    jasmine.clock().tick(1300);
    expect(listener.count).toEqual(1);
  });


  it('unsubs when requested', function() {
    var merged = foam.__context__.merged(foam.events.oneTime(listener));

    ep.change.sub('simple', merged);

    ep.change.pub('simple');
    expect(listener.count).toEqual(0);

    ep.change.pub('simple');
    expect(listener.count).toEqual(0);

    jasmine.clock().tick(17);
    expect(listener.count).toEqual(1);
    // and unsub happens due to the oneTime

    ep.change.pub('simple');
    expect(listener.count).toEqual(1);

    ep.change.pub('simple');
    expect(listener.count).toEqual(1);

    jasmine.clock().tick(17); // should be unsubbed,
    expect(listener.count).toEqual(1); // so no change

  });
});


describe('foam.__context__.async', function() {
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
    var delayed = foam.__context__.async(listener);

    ep.change.sub('simple', delayed);

    ep.change.pub('simple');
    expect(listener.count).toEqual(0);

    ep.change.pub('simple');
    expect(listener.count).toEqual(0);

    jasmine.clock().tick(1);

    expect(listener.count).toEqual(2);
  });

  it('async with opt_ctx specified', function() {
    var X = { setTimeout: setTimeout };
    var delayed = foam.__context__.async(listener, X);

    ep.change.sub('simple', delayed);

    ep.change.pub('simple');
    expect(listener.count).toEqual(0);

    ep.change.pub('simple');
    expect(listener.count).toEqual(0);

    jasmine.clock().tick(1);
    expect(listener.count).toEqual(2);
  });


});


describe('foam.__context__.framed', function() {
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
    var delayed1 = foam.__context__.framed(listener1);
    var delayed2 = foam.__context__.framed(listener2);
    ep.change.sub('simple', delayed1);
    ep.change.sub('simple', delayed2);

    ep.change.pub('simple');
    expect(listener1.count).toEqual(0);
    expect(listener2.count).toEqual(0);

    ep.change.pub('simple');
    expect(listener1.count).toEqual(0);
    expect(listener2.count).toEqual(0);

    jasmine.clock().tick(17);
    setTimeout(function() { // triggers requestAnimationFrame() in browser
      expect(listener1.count).toEqual(1);
      expect(listener2.count).toEqual(1);
    }, 0);
  });

});



describe('foam.__context__.Observable.sub()/.pub()', function() {
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

  it('pubes correctly after removing first of three', function() {
    var s1 = ep.change.sub(listener);
    ep.change.sub(listener2);
    ep.change.sub(listener3);

    s1.detach();
    ep.change.pub();
    expect(listener.count).toEqual(0);
    expect(listener2.count).toEqual(1);
    expect(listener3.count).toEqual(1);
  });
   it('pubes correctly after removing middle of three', function() {
    ep.change.sub(listener);
    var s2 = ep.change.sub(listener2);
    ep.change.sub(listener3);

    s2.detach();
    ep.change.pub();
    expect(listener.count).toEqual(1);
    expect(listener2.count).toEqual(0);
    expect(listener3.count).toEqual(1);
  });
  it('pubes correctly after removing last of three', function() {
    ep.change.sub(listener);
    ep.change.sub(listener2);
    var s3 = ep.change.sub(listener3);

    s3.detach();
    ep.change.pub();
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
    pcp.propertyChange.sub(listener);

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
