var GLOBAL = global || this;
var _events = require('../../src/core/event.js');
var EventPublisher = _events.EventPublisher;
var EventService = _events.EventService;

describe('EventPublisher.hasListeners()', function() {
  var ep;

  beforeEach(function() {
    ep = Object.create(EventPublisher);
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
    ep.subs_ = { 'the' : { 'cake': { 'is' : { null: [] },  } }, null: ['myFakeListener'] };
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
    expect(ep.hasListeners(['the', EventService.WILDCARD])).toBe(true);
  });

  it('reports correctly for a root level wildcard', function() {
    ep.subs_ = { 'the' : { 'cake': { 'is' : { null: ['myFakeListener'] } } } };
    expect(ep.hasListeners([EventService.WILDCARD])).toBe(true);
  });

  it('reports correctly for a given topic but no listeners', function() {
    expect(ep.hasListeners([EventService.WILDCARD])).toBe(false);
  });

});

describe('EventPublisher.subscribe()/.sub_()', function() {
  var ep;
  var listener;

  beforeEach(function() {
    ep = Object.create(EventPublisher);
    listener = function(topic, unsub) {
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

  beforeEach(function() {
    ep = Object.create(EventPublisher);
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
    ep.subscribe(['something'], listener1);
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


});






