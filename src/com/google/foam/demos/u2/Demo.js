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
  E('br')
);

E().
  add('Entities:').
  add('foo').
  nbsp().
  entity('amp').
  add(' bar ').
  entity('lt').
  entity('quot').
  entity("#039").
  add(E('br')).
  write();

E('b').add(
  'color: ',
  E('font').attrs({color: 'red'}).add('red', E('br'))).write();

var e = E('font').add('click me', E('br'));
console.log('id: ', e.id);
e.write();
e.attrs({color: 'orange'}).
  style({
    fontWeight: 'bold',
    fontSize:  '24pt'
  }).
  on('click', function() { console.log('clicked'); });

var e13 = E('div').add(
  'dynamic function: ',
  foam.core.ExpressionSlot.create({
    args: [ timer.second$ ],
    fn: function(s) {
      return s % 2 ?
        E('span').add('PI', 'NG').style({color: 'aqua'}) :
        E('span').add('PONG').style({color: 'orange'});
    }
  }),
  E('br'),
  'dynamic value: ', timer.i$,
  E('br'));
e13.write();

var e2 = E('font').add('on click (before)', E('br')).on('click', function() { console.log('clicked, before'); });
e2.write();

var e2b = E('font').add('on click (after)');
e2b.write();
e2b.on('click', function() { console.log('clicked, after'); });

E('br').write();


var e3 = E('div').add('first line, added before');
e3.write();
e3.add(E('br'),'second line, added after', E('br'));


E('div').add('add style before').style({color: 'blue'}).write();

var e5 = E('div').add('add style after');
e5.write();
e5.style({color: 'blue'});



