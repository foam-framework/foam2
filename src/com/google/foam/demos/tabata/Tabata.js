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
      value: 15,
      name: 'warmupTime'
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
      postSet: function(_, s) {
        if ( s == 0 ) {
          this.state.next(this);
        }
      }
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
      name: 'timer',
      hidden: true,
      factory: function() {
        var t = this.Timer.create();
        this.seconds$ = t.time$.map(function(t) { return Math.floor(t / 1000); });
        return t;
      }
    },
    {
      name: 'state',
      factory: function() {
        return this.Warmup.create();
      },
      hidden: true
    }
  ],
  methods: [
    function init() {
      this.elapsed$ = this.slot(function(seconds, roundStart) {
        return seconds - roundStart;
      });
      this.remaining$ = this.slot(function(elapsed, roundLength) {
        return roundLength - elapsed;
      });
    }
  ],
  classes: [
    {
      name: 'Warmup',
      methods: [
        function start(t) {
          t.roundLength = t.warmupTime;
          t.roundStart = t.seconds;
          t.action = 'Warmup';
        },
        function next(t) {
          t.state = t.Work.create();
          t.state.start(t);
        }
      ]
    },
    {
      name: 'Work',
      methods: [
        function start(t) {
          t.roundLength = t.workTime;
          t.roundStart = t.seconds;
          t.action = 'WORK!';
        },
        function next(t) {
          t.currentRound++;
          if ( t.currentRound >= t.rounds + 1 ) {
            t.state = t.Finish.create();
          } else {
            t.state = t.Rest.create();
          }

          t.state.start(t);
        }
      ]
    },
    {
      name: 'Rest',
      methods: [
        function start(t) {
          t.roundLength = t.restTime;
          t.roundStart = t.seconds;
          t.action = 'Rest';
        },
        function next(t) {
          t.state = t.Work.create();
          t.state.start(t);
        }
      ]
    },
    {
      name: 'Finish',
      methods: [
        function start(t) {
          t.action = 'Finished.';
          t.roundLength = 0;
          t.roundStart = t.seconds;
          t.stop();
        },
        function next(t) {
        }
      ]
    }
  ],
  actions: [
    {
      name: 'start',
      code: function() {
        this.timer.start();
        this.state.start(this);
      }
    },
    {
      name: 'stop',
      code: function() {
        this.timer.stop();
      }
    },
    {
      name: 'reset',
      code: function() {
        this.timer.stop();
        this.timer = undefined;
        this.currentRound = undefined;
        this.state = undefined;
        this.action = undefined;
      }
    }
  ]
});
