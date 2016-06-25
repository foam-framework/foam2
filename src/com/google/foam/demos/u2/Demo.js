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
  name: 'Something',

  requires: [
    'foam.util.Timer'
  ],

  properties: [
    {
      name: 'value',
      value: 'aaaa'
    },
    {
      name: 'timer',
      factory: function() {
        return this.Timer.create();
      }
    }
  ],

  methods: [
    function init() {
      this.timer.start();
      this.timer.propertyChange.sub('second', this.onTimer);
    }
  ],

  listeners: [
    function onTimer() {
      this.value = this.value === 'aaaa' ? 'bbbb' : 'aaaa';
    }
  ]
});


var timer = foam.util.Timer.create();
timer.start();

var E = foam.__context__.E;

E('b').add(
  'bold',
  E('br'),
  '<span style="color:red">HTML Injection Attempt</span>',
  E('br'),
  'foo'
  ).nbsp().entity('amp').add('bar').write();

E('b').add(
  'color: ',
  E('font').attrs({color: 'red'}).add('red', E('br'))).write();

var e = E('font').add('text', E('br'));
console.log('id: ', e.id);
e.write();
e.attrs({color: 'orange'});
e.style({
  fontWeight: 'bold',
  fontSize:  '24pt'
});
e.on('click', function() { console.log('clicked'); });

var e13 = E('div').add(
  'dynamic function PLAN B * ',
  foam.core.ExpressionSlot.create({
    args: [ timer.second$ ],
    fn: function(s) {
      return s % 2 ?
        E('span').add('PING', ' ', 'PING') :
        E('span').add('PONG').style({color: 'orange'});
    }
  }),
  ' *    dynamic value: ',
  timer.i$,
  '  ');

e13.write();
