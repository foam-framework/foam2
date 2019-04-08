/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.util',
  name: 'Timer',
  swiftName: 'FoamTimer',

  documentation: 'Timer object. Useful for creating animations.',

  properties: [
    {
      class: 'Int',
      name: 'interval',
      help: 'Interval of time between updating time.',
      // units: 'ms',
      value: 10
    },
    {
      class: 'Int',
      name: 'i',
      value: 0
    },
    {
      class: 'Float',
      name: 'timeWarp',
      value: 1.0
    },
    {
      class: 'Int',
      name:  'duration',
      units: 'ms',
      value: -1
    },
    {
      class: 'Float',
      name: 'percent',
      value: 0
    },
    {
      class: 'Long',
      name:  'startTime',
      value: 0
    },
    {
      class: 'Long',
      name:  'time',
      help:  'The current time in milliseconds since epoch.',
      adapt: function(_, t) { return Math.ceil(t); },
      swiftAdapt: function() {/*
if let newValue = newValue as? Double {
  return Int(ceil(newValue))
}
return newValue as! Int
      */},
      value: 0
    },
    {
      class: 'Int',
      name:  'second',
      help:  'The second of the current minute.',
      value: 0
    },
    {
      class: 'Int',
      name:  'minute',
      help:  'The minute of the current hour.',
      value: 0
    },
    {
      class: 'Int',
      name:  'hour',
      help:  'The hour of the current day.',
      value: 0
    },
    {
      class: 'Boolean',
      name: 'isStarted',
      hidden: true
    },
    {
      class: 'Long',
      name: 'startTime_',
      hidden: true
    }
  ],

  methods: [
    {
      /**
         cycle(frequency)             - cycle between -1 and 1 frequency times a second
         cycle(frequency, amplitude)  - cycle between -amplitude and amplitude frequency times a second
         cycle(frequency, start, end) - cycle between start and end frequency times a second
      */
      name: 'cycle',
      swiftType: 'Float',
      args: [
        {
          name: 'frequency',
          swiftType: 'Float',
        },
        {
          name: 'a',
          swiftType: 'Float?',
        },
        {
          name: 'b',
          swiftType: 'Float?',
        },
      ],
      code: function(frequency, a, b) {
        var s = Math.sin(this.time/1000*frequency*Math.PI*2);
        if ( arguments.length === 1 ) return s;
        if ( arguments.length === 2 ) return s * a;
        return a + (1 + s) * (b-a)/2;
      },
      swiftCode: function() {/*
let s = sin(Float(time)/1000*frequency*Float.pi*2)
if a == nil { return s }
if b == nil { return s * a! }
return a! + (1 + s) * (b!-a!)/2;
      */},
    },
  ],

  actions: [
    {
      name:  'start',
      help:  'Start the timer.',
      isEnabled: function(isStarted) { return ! isStarted; },
      code:      function() { this.startTime_ = Date.now(); this.isStarted = true; this.tick(); },
      swiftCode: `
        startTime_ = Int(Date().timeIntervalSince1970 * Double(1000))
        isStarted = true
        tick()
      `,
    },
    {
      name:  'step',
      help:  'Step the timer.',
      code: function() {
        this.i++;
        this.time  += this.interval * this.timeWarp;
        this.second = this.time /    1000 % 60 << 0;
        this.minute = this.time /   60000 % 60 << 0;
        this.hour   = this.time / 3600000 % 24 << 0;
      },
      swiftCode: function() {/*
i+=1
time  += Int(Float(interval) * timeWarp)
second = time /    1000 % 60 << 0;
minute = time /   60000 % 60 << 0;
hour   = time / 3600000 % 24 << 0;
      */}
    },
    {
      name:  'stop',
      help:  'Stop the timer.',
      isEnabled: function(isStarted) { return isStarted; },
      code:      function() { this.isStarted = false; },
      swiftCode: 'isStarted = false'
    }
  ],

  listeners: [
    {
      name: 'tick',
      isFramed: true,
      code: function() {
        if ( ! this.isStarted ) return;

        var prevTime = this.startTime_;
        this.startTime_ = Date.now();
        this.interval = this.startTime_ - prevTime;
        this.step();
        this.tick();
      },
      swiftCode: function() {/*
if !isStarted { return }

let prevTime = startTime_
startTime_ = Int(Date().timeIntervalSince1970 * Double(1000))
interval = startTime_ - prevTime
step()
tick()
      */}
    }
  ]
});
