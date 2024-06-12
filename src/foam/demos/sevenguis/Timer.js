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
  package: 'foam.demos.sevenguis',
  name: 'Timer',
  extends: 'foam.u2.Element',

  exports: [ 'as data' ],

  requires: [
    'foam.u2.ProgressView',
    'foam.u2.RangeView'
  ],

  css: `
    ^ { padding: 10px !important; font-size: 18px; }
    ^ .elapsed { margin-top: 10px; }
    ^ .label { display: inline-block; width: 130px; }
    ^ .foam-u2-ActionView { width: 332px !important; margin-top: 16px !important; }
    ^ .foam-u2-RangeView { width: 182px; }
    ^ row { display: block; min-height: 30px; }
  `,

  properties: [
    {
      name: 'progress',
      label: 'Elapsed Time',
      expression: function(duration, elapsedTime) {
        return this.duration ? 100 * Math.min(1, 1000 * this.elapsedTime / this.duration) : 100;
      },
      view: 'foam.u2.ProgressView'
    },
    {
      name: 'elapsedTime',
      units: 's',
      label: '',
      value: 0
    },
    {
      class: 'Int',
      name: 'duration',
      units: 'ms',
      view: { class: 'foam.u2.RangeView', maxValue: 10000 },
      value: 5000
    },
    {
      name: 'lastTick_',
      hidden: true,
      value: 0
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.duration$.sub(this.tick);
      this.tick();
    },

    function initE() {
      this.
        addClass(this.myClass()).
        start('row').start('span').addClass('label').add('Elapsed Time:').end().add(this.PROGRESS).end().
        start('row').addClass('elapsed').add(this.elapsedTime$.map(function(t) { return t.toFixed(1); })).end().
        start('row').start('span').addClass('label').add('Duration:').end().add(this.DURATION).end().
        add(this.RESET);
    }
  ],

  actions: [
    function reset() {
      this.elapsedTime = this.lastTick_ = 0;
      this.tick();
    }
  ],

  listeners: [
    {
      name: 'tick',
      isFramed: true,
      code: function() {
        if ( 1000 * this.elapsedTime >= this.duration ) return;
        var now = Date.now();
        if ( this.lastTick_ ) this.elapsedTime += (now - this.lastTick_)/1000;
        this.elapsedTime = Math.min(this.duration/1000, this.elapsedTime);
        this.lastTick_ = now;
        this.tick();
      }
    }
  ]
});
