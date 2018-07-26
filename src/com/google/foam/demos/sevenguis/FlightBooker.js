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
  package: 'com.google.foam.demos.sevenguis',
  name: 'FlightBooker',
  extends: 'foam.u2.Element',

  requires: [
    'foam.u2.DateView',
    'foam.u2.tag.Select'
  ],

  exports: [ 'as data' ],

  css: `
    ^ { padding: 10px; }
    ^ .error { border: 2px solid red; }
    ^title { font-size: 18px; }
    ^title, ^ button, ^ input, ^ select {
      width: 160px; height: 24px; margin: 5px;
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'oneWay',
      value: true,
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          [ true,  'one-way flight' ],
          [ false, 'return flight'  ]
        ]
      }
    },
    {
      class: 'Date',
      name: 'departDate',
      factory: function() { return new Date(Date.now()+3600000*24); },
      validateObj: function(departDate) {
        var today = new Date();
        today.setHours(0,0,0,0);
        if ( foam.Date.compare(departDate, today) < 0 ) return 'Must not be in the past.';
      }
    },
    {
      class: 'Date',
      name: 'returnDate',
      factory: function() { return new Date(Date.now()+2*3600000*24); },
      validateObj: function(oneWay, returnDate, departDate) {
        if ( ! oneWay && foam.Date.compare(returnDate, departDate) < 0 ) return 'Must not be before depart date.';
      }
    },
    {
      name: 'returnDateMode',
      expression: function(oneWay) { return oneWay ? 'disabled' : 'rw'; }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.nodeName = 'div';
      this.
        start('div').addClass('^title').add('Book Flight').end().
        add(this.ONE_WAY).tag('br').
        add(this.DEPART_DATE).tag('br').
        start(this.RETURN_DATE).attrs({mode: this.returnDateMode$}).end().tag('br').
        add(this.BOOK);
    }
  ],

  actions: [
    {
      name: 'book',
      isEnabled: function(errors_) { return ! errors_; },
      code: function() {
        var depart = this.departDate.toLocaleDateString();

        window.alert('You have booked a ' + (this.oneWay ?
          'one-way flight on ' + depart :
          'flight departing on ' + depart + ' and returning ' + this.returnDate.toLocaleDateString() ) + '.');
      }
    }
  ]
});
