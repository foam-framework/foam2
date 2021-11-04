/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// Listeners

// Listeners are pre-bound Methods, suitable for use as callbacks (DOM, or otherwise).
// Create Listeners
foam.CLASS({
  name: 'ListenerTest',
  properties: [ 'name' ],
  methods: [ function m1() {
    console.log('m1', this.name);
    return 'M1' + this.name;
  } ],
  listeners: [ function l1() {
    console.log('l1', this.name);
    return 'L1' + this.name; // listener return value is ignored by most callers
  } ]
});
var o = ListenerTest.create({
  name: 'Steve'
});

// Test Listeners as methods

// When called as methods, the same as Methods.
o.m1(); // m1 Steve
o.l1(); // l1 Steve

// Listeners remember their self, binding "this" automatically
// When called as functions, the method forgets its 'self' and doesn't work,
// but the listener works.
var m = o.m1;
var l = o.l1;
m(); // m1 
l(); // l1 Steve


// isMerged will merge multiple events
// If a listener has isMerged: true, it will merge multiple
// events received withing 'mergeDelay' milliseconds into
// a single event. 'mergeDelay' is optional and defaults to
// 16ms.
// Code: function async() {
// TODO error   __context__
async function doCode() {
  var mergedCalls = 0;

  foam.CLASS({
    name: 'MergedListenerTest',
    listeners: [
      {
        name: 'notMerged',
        isMerged: false, // the default
        code: function() {
          console.log('not merged listener');
        }
      },
      {
        name: 'merged',
        isMerged: true,
        mergeDelay: 1, // 1ms
        code: function() {
          console.log('merged listener ' + mergedCalls);
          mergedCalls += 1;
        }
      }
    ]
  });

  var o = MergedListenerTest.create();
  o.merged(); o.notMerged();
  o.merged(); o.notMerged();
  o.merged(); o.notMerged();
  o.merged(); o.notMerged();
  o.merged(); o.notMerged();
  o.merged(); o.notMerged();
  o.merged(); o.notMerged();

  // stop this test after one frame
  return new Promise(function(res) {
    setTimeout(res, 16);
  });
}

doCode();


// isFramed will merge multiple events within an animation frame
// If a listener has isFramed: true, it will merge multiple
// events received withing one animation frame to a single
// event delivered at the next animationFrame.
async function doCode1() {
  var framedCalls = 0;
  foam.CLASS({
    name: 'FramedListenerTest',
    listeners: [
      {
        name: 'framed',
        isFramed: true,
        code: function() {
          console.log('framed listener ' + framedCalls);
          framedCalls += 1;
        }
      }
    ]
  });
  var o = FramedListenerTest.create();
  o.framed();
  o.framed();
  o.framed();
  o.framed();

  // delay for more than one frame to ensure the listener runs
  return new Promise(function(res) {
    setTimeout(res, 32);
  });
}

doCode1();

// Test Merged and Framed validation
// It's an error to make a listener both isMerged and isFramed//TODO more details
foam.CLASS({
  name: 'MergedAndFramedTest',
  listeners: [
    {
      name: 'l',
      isMerged: true,
      isFramed: true,
      code: function() {
        console.log('listener');
      }
    }
  ]
});
MergedAndFramedTest.create();
// toBeAssertedThat(function() {
//  MergedAndFramedTest.create();
// }).toThrow();


// Decorate a listener with delayed() to delay the execution without merging

// You can decorate a listener with delayed() to delay the
// execution of the listener. Unlike merged(), which also delays
// results, delayed() does not merge results.
async function doCode2() {
  var callOrder = '';
  var l1 = foam.__context__.delayed(function() {
    console.log('l1');
    callOrder += 'l1';
  }, 10);
  var l2 = foam.__context__.delayed(function() {
    console.log('l2');
    callOrder += 'l2';
  }, 5);
  l1();
  l2();
  l1();
  l2();

  // delay to ensure the listener runs
  return new Promise(function(res) {
    setTimeout(res, 16);
  });
}

doCode2();// l2l2l1l1


//async(l) is the same as delayed(l, 0)
/*
console.log('-------------------');
var callOrder = '';
      var d1 = foam.__context__.async(function() {
        console.log('d1');
        callOrder += 'd1';
      });
      var d2 = function() {
        console.log('d2');
        callOrder += 'd2';
      };
      d1();
      d2();
      d1();
      d2();

      // delay to ensure the listener runs
      return new Promise(function(res) {
        setTimeout(res, 16);
      });*/

// d2d2d1d1

// Listeners, like Methods, have SUPER support.
var alarms = '';
foam.CLASS({
  name: 'Alarm',
  listeners: [
    function alarm() {
      alarms += 'alarm!';
    }
  ]
});
foam.CLASS({
  name: 'LongAlarm',
  extends: 'Alarm',
  listeners: [
    function alarm() {
      alarms += 'LongAlarm: ';
      this.SUPER(); this.SUPER(); this.SUPER();
    }
  ]
});
LongAlarm.create().alarm();
console.log(alarms); // LongAlarm: alarm!alarm!alarm!

// Console log listener: foam.events.consoleLog() returns a convenient listener
// that logs
// foam.events.consoleLog
foam.CLASS({
  name: 'ConsoleLogTest'
});
var o = ConsoleLogTest.create();
o.sub(foam.events.consoleLog());
o.pub(); //TODO the results
o.pub('foo');
o.pub('foo', 'bar');