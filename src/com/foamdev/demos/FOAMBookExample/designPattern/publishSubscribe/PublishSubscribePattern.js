/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// Publish subscribe Pattern
// Pub Sub
// Objects can publish events and subscribe to other objects

foam.CLASS({
  name: 'PubSubTest'
});
var o = PubSubTest.create();

// Subscribing: Objects can publish events and subscribe to other objects
// Objects support pub() for publishing events,
// and sub() for subscribing to published events.
var globalCalls = 0;
var alarmCalls = 0;
var globalResult = '';
// Install a listener that listens to all events
// Listeners are called with a subscription object and the given
// arguments from pub().
o.sub(function() {
  console.log('  global listener: ', [].join.call(arguments, ' '));
  globalCalls += 1;
  globalResult += ' a' + arguments.length;
});
// This listener will only fire if the first argument matches 'alarm'
o.sub('alarm', function() {
  console.log('  alarm: ', [].join.call(arguments, ' '));
  alarmCalls += 1;
});
console.log("Pub alarm:");
o.pub('alarm', 'on');
console.log("Pub lifecycle:");
o.pub('lifecycle', 'loaded');
// toBeAssertedThat(globalCalls).toEqual(2);
// toBeAssertedThat(alarmCalls).toEqual(1);


// Publish arguments: Any number of arguments can be published

// Test publishing with many args
console.log("Pub many arguments:");
o.pub(1);
o.pub(1, 2);
o.pub(1, 2, 3);
o.pub(1, 2, 3, 4);
o.pub(1, 2, 3, 4, 5);
o.pub(1, 2, 3, 4, 5, 6);
o.pub(1, 2, 3, 4, 5, 6, 7);
o.pub(1, 2, 3, 4, 5, 6, 7, 8);
o.pub(1, 2, 3, 4, 5, 6, 7, 8, 9);
o.pub(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
o.pub(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11);
console.log(globalResult); // a3 a3 a2 a3 a4 a5 a6 a7 a8 a9 a10 a11 a12


// Topics: A Class can declare Topics that it publishes events for
foam.CLASS({
  name: 'TopicTest',
  topics: [ 'alarm' ]
});
var o = TopicTest.create();
var normalCalls = 0;
var topicCalls = 0;
// TODO what is the difference between???
o.sub('alarm', function(_, __, state) {
  console.log('alarm: ', state);
  normalCalls += 1;
});
// The next line uses the Topic and is slightly shorter than the equivalent above.
o.alarm.sub(function(_, __, state) {
  console.log('alarm (topic): ', state);
  topicCalls += 1;
});
o.alarm.pub('on');
o.pub('alarm', 'off');
// toBeAssertedThat(normalCalls).toEqual(2);
// toBeAssertedThat(topicCalls).toEqual(2);

// propertyChange: Objects implicitly pub events on the propertyChange topic
// when property values change
foam.CLASS({
  name: 'PropertyChangeTest',
  properties: [ 'a', 'b' ]
});
o = PropertyChangeTest.create();
// propertyChange event listeners are called with:
//   sub  - the subscription object, which can be detach()ed to end
//            the subscription
//   p    - the string 'propertyChange'
//   name - the name of the changed property
//   dyn  - a dynamic access object to .get() the current value and
//            getPrev() the pre-change value

var anyChangeCalls = 0;
var propAChangeCalls = 0;
// Listen for all propertyChange events:
o.propertyChange.sub(function(sub, p, name, dyn) {
  console.log('propertyChange: ', p, name, dyn.getPrev(), dyn.get());
  anyChangeCalls += 1;
});

// Listen for only changes to the 'a' Property:
o.propertyChange.sub('a', function(sub, p, name, dyn) {
  console.log('propertyChange.a: ', p, name, dyn.getPrev(), dyn.get());
  propAChangeCalls += 1;
});

o.a = 42;
o.b = 'bar';
o.a++;
// toBeAssertedThat(anyChangeCalls).toEqual(3);
// toBeAssertedThat(propAChangeCalls).toEqual(1);


// Unsubscribe from subscriber: 1. Call .detach() on the Detachable that sub() returns
var calls = 0;
var l = function(sub, name) {
  console.log('Event:', name);
  calls += 1;
};

var sub = o.sub(l);
o.pub('fire');
sub.detach();
o.pub("fire again, but nobody's listenering");


// Unsubscribe from listener: 2. Detach the subscription, which is supplied to
// the listener

var calls = 0;
var once = function(sub, name) {
  console.log('Event:', name);
  calls += 1;
  // stop listening
  sub.detach();
};

o.sub(once);
o.pub('fire');
o.pub("fire again, but nobody's listening");

// Unsubscribe with oneTime helper: 
// 3. If you only want to receive the first event, use foam.events.oneTime()
// If you only want to receive the first event, decorate your
// listener with foam.events.oneTime() and it will cancel the subscription
// when it receives the first event.
o.sub(foam.events.oneTime(function() {
  console.log.apply(console.log, arguments);
}));

o.pub('fire');
o.pub("fire again, but nobody's listenering");