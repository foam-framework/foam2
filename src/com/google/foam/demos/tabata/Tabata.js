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

foam.CLASS({
  name: 'Tabata',

  requires: [
    'TabataState',
    'foam.util.Timer'
  ],

  properties: [
    {
      class: 'Int',
      name: 'rounds',
      label: 'Number of rounds',
      value: 8
    },
    {
      class: 'Int',
      name: 'workTime',
      value: 20,
      units: 'seconds'
    },
    {
      class: 'Int',
      name: 'restTime',
      value: 10,
      units: 'seconds'
    },
    {
      class: 'Int',
      value: 5,
      name: 'setupTime'
    },
    {
      class: 'Int',
      name: 'currentRound',
      value: 1
    },
    {
      class: 'Int',
      name: 'seconds',
      label: 'Total time'
    },
    {
      class: 'Int',
      name: 'elapsed',
      units: 'seconds',
      hidden: true,
      value: 0
    },
    {
      class: 'Int',
      name: 'remaining',
      units: 'seconds',
      value: 0,
      preSet: function(_, n) { return Math.max(0, n) },
      swiftPreSet: 'return max(0, newValue)',
      postSet: function(_, s) {
        if ( s == 0 ) {
          this.state.next(this);
        }
      },
      swiftPostSet: function() {/*
if newValue == 0 {
  state.next(self);
}
      */}
    },
    {
      class: 'String',
      name: 'action'
    },
    {
      class: 'Int',
      name: 'roundLength',
      hidden: true,
      units: 'seconds'
    },
    {
      class: 'Int',
      name: 'roundStart',
      hidden: true,
      units: 'seconds'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.util.Timer',
      name: 'timer',
      required: true,
      hidden: true,
      factory: function() {
        var t = this.Timer.create();
        this.seconds$ = t.time$.map(function(t) { return Math.floor(t / 1000); });
        return t;
      },
      swiftFactory: function() {/*
let t = Timer_create()
self.seconds$ = t.time$.map({ t in
  let t = t as! Int
  return t/1000
})
return t
      */},
    },
    {
      class: 'FObjectProperty',
      of: 'TabataState',
      name: 'state',
      required: true,
      factory: function() { return this.Warmup.create(); },
      swiftFactory: 'return Warmup_create()',
      hidden: true
    }
  ],

  methods: [
    {
      name: 'init',
      code: function() {
        this.elapsed$ = this.slot(function(seconds, roundStart) {
          return seconds - roundStart;
        });
        this.remaining$ = this.slot(function(elapsed, roundLength) {
          return roundLength - elapsed;
        });
      },
      swiftCode: function() {/*
elapsed$ = ExpressionSlot([
  "args": [seconds$, roundStart$],
  "code": { (args: [Any?]) -> Any? in
    return (args[0] as! Int) - (args[1] as! Int)
  },
])
remaining$ = ExpressionSlot([
  "args": [elapsed$, roundLength$],
  "code": { (args: [Any?]) -> Any? in
    return (args[1] as! Int) - (args[0] as! Int)
  },
])
      */},
    }
  ],

  classes: [
    {
      name: 'Warmup',
      implements: ['TabataState'],
      methods: [
        {
          name: 'start',
          code: function(t) {
            t.roundLength = t.setupTime;
            t.roundStart = t.seconds;
            t.action = 'Warmup';
          },
          swiftCode: function() {/*
t.roundLength = t.setupTime
t.roundStart = t.seconds
t.action = "Warmup"
          */},
        },
        {
          name: 'next',
          code: function(t) {
            t.state = t.Work.create();
            t.state.start(t);
          },
          swiftCode: function() {/*
t.state = t.Work_create();
t.state.start(t);
          */},
        },
      ]
    },
    {
      name: 'Work',
      messages: [
        {
          name: 'action_string',
          message: 'WORK!',
        },
      ],
      implements: ['TabataState'],
      methods: [
        {
          name: 'start',
          code: function(t) {
            t.roundLength = t.workTime;
            t.roundStart = t.seconds;
            t.action = this.action_string;
          },
          swiftCode: function() {/*
t.roundLength = t.workTime
t.roundStart = t.seconds
t.action = type(of: self).action_string
          */},
        },
        {
          name: 'next',
          code: function(t) {
            t.currentRound++;
            if ( t.currentRound >= t.rounds + 1 ) {
              t.state = t.Finish.create();
              t.currentRound = t.rounds;
            } else {
              t.state = t.Rest.create();
            }

            t.state.start(t);
          },
          swiftCode: function() {/*
t.currentRound += 1
if t.currentRound >= t.rounds + 1 {
  t.state = t.Finish_create()
  t.currentRound = t.rounds
} else {
  t.state = t.Rest_create()
}
t.state.start(t);
          */},
        },
      ]
    },
    {
      name: 'Rest',
      implements: ['TabataState'],
      messages: [
        {
          name: 'action_string',
          message: 'Rest',
        },
      ],
      methods: [
        {
          name: 'start',
          code: function(t) {
            t.roundLength = t.restTime;
            t.roundStart = t.seconds;
            t.action = this.action_string;
          },
          swiftCode: function() {/*
t.roundLength = t.restTime
t.roundStart = t.seconds
t.action = type(of: self).action_string
          */},
        },
        {
          name: 'next',
          code: function(t) {
            t.state = t.Work.create();
            t.state.start(t);
          },
          swiftCode: function() {/*
t.state = t.Work_create();
t.state.start(t);
          */},
        },
      ]
    },
    {
      name: 'Finish',
      implements: ['TabataState'],
      messages: [
        {
          name: 'action_string',
          message: 'Finished',
        },
      ],
      methods: [
        {
          name: 'start',
          code: function(t) {
            t.action = this.action_string;
            t.roundLength = 0;
            t.roundStart = t.seconds;
            t.stop();
          },
          swiftCode: function() {/*
t.action = type(of: self).action_string
t.roundLength = 0;
t.roundStart = t.seconds;
t.stop()
          */},
        },
        {
          name: 'next',
          code: function(t) {},
          swiftCode: '// Finished!',
        },
      ]
    }
  ],

  actions: [
    {
      name: 'start',
      code: function() {
        this.timer.start();
        this.state.start(this);
      },
      swiftCode: function() {/*
timer.start()
state.start(self)
      */}
    },
    {
      name: 'stop',
      code: function() { this.timer.stop(); },
      swiftCode: 'timer.stop()',
    },
    {
      name: 'reset',
      code: function() {
        this.timer.stop();
        this.timer = undefined;
        this.currentRound = undefined;
        this.state = undefined;
        this.action = undefined;
      },
      swiftCode: function() {/*
stop();
clearProperty("timer")
clearProperty("currentRound")
clearProperty("state")
clearProperty("action")
      */}
    }
  ]
});
