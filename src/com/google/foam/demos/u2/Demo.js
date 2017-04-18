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
    code: function(s) {
      return s % 2 ?
        E('span').add('PI', 'NG').style({color: 'aqua'}) :
        E('span').add('PONG').style({color: 'orange'});
    }
  }),
  ' dynamic function2: ',
  timer.second$.map(function(s) {
    return s % 2 ?
      E('span').add('PI', 'NG').style({color: 'aqua'}) :
      E('span').add('PONG').style({color: 'orange'});
  }),
  ' dynamic function3: ',
  timer.slot(function (second) {
    return second % 2 ?
      E('span').add('PI', 'NG').style({color: 'aqua'}) :
      E('span').add('PONG').style({color: 'orange'});
  }),
  ' dynamic function4: ',
  foam.core.ExpressionSlot.create({
    args: [ timer.second$ ],
    code: function(s) {
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


E('div').add('add class before').addClass('important').write();

var e7 = E('div').add('add class after');
e7.write();
e7.addClass('important');



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
  properties: [ 'firstName', 'lastName', 'age' ],
  actions: [
    function sayHello() {
      console.log('hello');
    },
    function sayGoodbye() {
      console.log('goodbye');
    }
  ]
});

var p = Person.create({firstName: 'John', lastName: 'Doe', age: 42});

var Y =  foam.__context__.createSubContext({data: p});
console.log('data: ', Y.data);

var s = p.firstName$;
var input = foam.u2.tag.Input.create({data: 'william'});
var input2 = foam.u2.tag.Input.create({data: 'john'});
input.data$ = input2.data$;
input.write();
input2.write();

Person.FIRST_NAME.toE(null, Y).write();
Person.FIRST_NAME.toE(null, Y).write();

var e = Y.E('div').add('simple: ').add(Person.FIRST_NAME, Person.LAST_NAME);
e.write();

var e2 = Y.E('div').add('simple2: ').add(Person.getAxiomsByClass(foam.core.Property));
e2.write();

foam.u2.DetailView.create({
  data: p
}).write();

var dv2 = foam.u2.DetailView.create({
  data: p,
  showActions: true
}).write();

foam.u2.DetailView.create({
  data: foam.util.Timer.create(),
  showActions: true
}).write();

foam.u2.DetailView.create({
  data: foam.util.Timer.create(),
  showActions: true,
  properties: [ foam.util.Timer.INTERVAL, foam.util.Timer.I ],
  actions: [ foam.util.Timer.STOP, foam.util.Timer.START ]
}).write();

foam.CLASS({
  name: 'CustomDetailView',
  extends: 'foam.u2.Element',

  exports: [ 'as data' ],

  axioms: [
    foam.u2.CSS.create({
      code: function() {/*
        important { color: red; }
      */}
    })
  ],

  properties: [
    { class: 'Int', name: 'i' },
    'field1',
    'field2',
    {
      name: 'choices',
      view: {
//        class: 'foam.u2.view.ChoiceView',
        class: 'foam.u2.view.RadioView',
        choices: [
          'ABC',
          'DEF',
          'XYZ'
        ]
      }
    },
    'flip'
  ],

  actions: [
    function reset() { this.field1 = this.field2 = ''; },
    function sayHello() { console.log('hello'); }
  ],

  listeners: [
    {
      name: 'flop',
      isMerged: true,
      mergeDelay: 1000,
      code: function() {
        this.i++;
        this.flip = ! this.flip;
        this.flop();
      }
    }
  ],

  methods: [
    function initE() {
      this.flop();

      this.field1 = 'foo';
      this.field2 = 'bar';

      var o2 = this.cls_.create({field1: 'O2.f1', field2: 'O2.f2'});

      this.
        addClass(this.slot(function(flip) {
            return flip ? 'important' : '';
          })).
          tag('br').
          tag('hr').
          add(
              'start: ',
              this.field1$, ' ',
              this.field2$, ' ',
              this.field1$, ' ',
              this.field2$, ' O2: ',
              o2.field2$,
              this.E('br'),
              this.FIELD1, ' ',
              this.FIELD2, ' ',
              this.CHOICES, ' ',
              this.CHOICES, ' ',
              this.E('br'),
              this.SAY_HELLO, ' ',
              this.RESET,
              this.E('br'),
              'OnKey: '
          ).
          start('div').show(this.flip$).add('flip').end().
          start('div').hide(this.flip$).add('flop').end().
          start(this.FIELD1).attrs({onKey: true}).end().
          start(this.FIELD1).attrs({onKey: true}).end().
          start(this.FIELD2).attrs({onKey: true}).end().
          start(this.CHOICES).end().
          start(this.CHOICES).end().
          tag('br').

          start(this.FIELD1, {data$: o2.field1$}).end().
          start(this.FIELD2, {data$: o2.field2$}).end().

          tag('br').
          add('subContext: ').
          startContext({data: o2}).
            add(o2.FIELD1).
            add(o2.FIELD2).
            add(this.slot(function(flip) {
              return flip ? o2.FIELD1 : o2.FIELD2;
            })).
          endContext();


          /*
          start('notimage').
            attrs({
              data: 'dragon.png',
              displayWidth: this.slot(function(i) { return i * 10 % 100; })
            }).
          end().
          */


    }
  ]
});
foam.lookup('CustomDetailView').create().write();


// Converted from Angular2 demo:
// https://github.com/thelgevold/angular-2-samples/blob/master/components/bound-textbox/bound-textbox.js
foam.CLASS({
  name: 'BoundTextbox',
  extends: 'foam.u2.Controller',
  properties: [ ['text', 'hello' ] ],
  methods: [ function initE() {
    this.start('h1').add("Bound Textbox").end().start(this.TEXT, {onKey: true}).end().add(this.text$);
  }]
});
foam.lookup('BoundTextbox').create().write();


foam.CLASS({
  name: 'Test',
  properties: [
    {
      class: 'Int',
      name: 'foo',
      preSet: function(_, a) {
        if ( a > 20 ) return 20;
        return a;
      }
    }
  ]
});

var d = Test.create();
foam.u2.DetailView.create({ data: d }).write();
foam.u2.DetailView.create({ data: d }).write();
foam.u2.DetailView.create({ data: d }).write();
