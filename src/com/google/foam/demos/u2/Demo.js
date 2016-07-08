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

var E = foam.__context__.E.bind(foam.__context__);

E('b').add(
  'bold',
  E('br'),
  '<span style="color:red">HTML Injection Attempt</span>',
  E('br')
);

E().
  add('Entities: ').
  add('foo').
  nbsp().
  entity('amp').
  add(' bar ').
  entity('lt').
  entity('quot').
  entity("#039").
  tag('br').
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

E('br').write();


E('div').add('add class before').cssClass('important').write();

var e7 = E('div').add('add class after');
e7.write();
e7.cssClass('important');



E('font').add(E('br'), 'set attr before').attrs({color: 'blue'}).write();

var e11 = E('font').add(E('br'), 'set attr after', E('br'));
e11.write();
e11.attrs({color: 'blue'});

 var e = E('div').add(
   E('span').add("hello "),
   E('span').add("!")).write();
 e.insertBefore(E('span').add('world'), e.children[1]);

var e = E('div').add(
  E('span').add("hello "),
  E('span').add("!"));
e.insertBefore(E('span').add('world'), e.children[1]);
e.write();

var e = E('div').add(
  E('span').add("hello "),
  E('span').add("!")).write();
e.insertAfter(E('span').add('world'), e.children[0]);

var e = E('div').add(
  E('span').add("hello "),
  E('span').add("!"));
e.insertAfter(E('span').add('world'), e.children[0]);
e.write();

var e = E('div').add(
  E('span').add("hello "),
  E('span').add("!"));
e.addBefore(e.children[1], E('span').add('there '), E('span').add('world'));
e.write();

var oldChild = E().add('First Child').style({color: 'red'});
var newChild = E().add('Second Child').style({color: 'green'});
var e = E('div').tag('br').add(oldChild).tag('br').write();
e.replaceChild(newChild, oldChild);


foam.CLASS({
  name: 'RedElement',
  extends: 'foam.u2.Element',
  methods: [ function init() { this.SUPER(); this.style({color: 'red'}); } ]
});

RedElement.create().add('red element').write();

var i = E('image').attrs({
  displayWidth: 200,
  displayHeight: 200,
  data: 'Dragon.png'
});

i.write();

foam.CLASS({
  name: 'Person',
  properties: [ 'firstName', 'lastName', 'age' ]
});

var p = Person.create();

foam.u2.DetailView.create({
  data: p
}).write();
