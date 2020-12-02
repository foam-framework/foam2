/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


 foam.CLASS({
   name: 'MultiPartTextField',
   extends: 'foam.u2.View',

   requires: [ 'foam.u2.TextField' ],

   properties: [
     {
       class: 'Int',
       name: 'numOfParts',
       value: 7
     }
   ],

   methods: [
     function initE() {
       this.SUPER();

       for ( let i = 0 ; i < this.numOfParts ; i++ ) {
         let v = this.TextField.create({size: 2});
         v.data$.relateFrom(this.data$, () => this.data.substring(0,i) + v.data.substring(0) + this.data.substring(i+1), () => this.data.substring(i, i+1));
         this.tag(v);
       }

     }
   ]
 });

 foam.CLASS({
   name: 'MultiPartTextFieldTest',
   properties: [
     {
       name: 'val',
       view: 'MultiPartTextField'
     }
   ]
 })

 var mptft = MultiPartTextFieldTest.create({val:'1234567'});
 foam.u2.DetailView.create({ data: mptft }).write();
 foam.u2.DetailView.create({ data: mptft }).write();
 mptft.val$.sub(function() { console.log('***** value: ', mptft.val)});



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
).write();

E().
  add('Entities: ').
  add('foo').
  nbsp().
  entity('amp').
  add(' bar ').
  entity('lt').
  entity('quot').
  entity("#039").
  add("&quot;").
  tag('br').
  br().
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
      debugger;
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


foam.CLASS({
  name: 'CustomDetailView',
  extends: 'foam.u2.Element',

  exports: [ 'as data' ],

  css: 'important { color: red; }',

  properties: [
    {
      class: 'Date',
      name: 'datePicker',
      view: 'foam.u2.property.MDDateField'
    },
    { class: 'Int', name: 'i' },
    'field1',
    { name: 'field2', view: { class: 'foam.u2.view.PasswordView' } },
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
      },
      value: 'ABC'
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
          // Static method of implementing a 'switch' statement.
          // Output won't change if the value of 'choices' changes.
          call(function() {
            switch ( this.choices ) {
              case 'ABC': this.add('choice ABC'); break;
              case 'DEF': this.add('choice 2'); break;
              default: this.add('other');
            }
          }).
          // Dynamic method of implementing a 'switch' statement.
          // Output will change if the value of 'choices' changes.
          add(this.choices$.map(function(c) {
            switch ( c ) {
              case 'ABC': return 'choice ABC';
              case 'DEF': return 'choice 2';
              default: return 'other';
            }
          })).
          // Hide the DOM depending on the value of 'flip'
          start('div').show(this.flip$).add('flip').end().
          start('div').hide(this.flip$).add('flop').end().
          // Create or destroy the DOM depending on the value of 'flip'
          add(this.flip$.map(function(f) {
            if ( f ) return E().start('div').add('flip').end();
          })).
          add(this.flip$.map(function(f) {
            if ( ! f ) return E().start('div').add('flop').end();
          })).
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


foam.CLASS({
  name: 'AnyViewDemo',

  documentation: 'Show use of AnyView, which provides a suitable view for Object properties based on their current value.',

  properties: [
    {
      class: 'Object',
      name: 'anyValue',
      view: 'foam.u2.view.AnyView',
      value: true
    }
  ],

  actions: [
    function becomeString()  { this.anyValue = 'a String'; },
    function becomeBoolean() { this.anyValue = true},
    function becomeInt()     { this.anyValue = 42; },
    function becomeDate()    { this.anyValue = new Date(); },
  ]
});

foam.u2.DetailView.create({ data: AnyViewDemo.create() }).write();


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


foam.CLASS({
  name: 'ActionDemo',
  properties: [ 'foo' ],
  actions: [
    function add() {
      console.log('add');
    },
    {
      name: 'add2',
      label: 'Add',
      icon: 'https://cdn4.iconfinder.com/data/icons/48x48-free-object-icons/48/Add.png',
      code: function() { console.log('add'); }
    }
  ]
});

foam.CLASS({
  name: 'ActionDemoSubView',
  extends: 'foam.u2.Element',

  imports: [ 'viewAction' ],

  exports: [ 'as data' ],

  methods: [
    function initE() {
      this
        // Default Button
        .add('subView: ', this.SUB_VIEW_ACTION);
    }
  ],
  actions: [
    function subViewAction(X, obj) {
      this.viewAction();
    }
  ]
});

foam.CLASS({
  name: 'ActionDemoView',
  extends: 'foam.u2.View',

  exports: [ 'viewAction' ],

  methods: [
    function initE() {
      this
        // Default Button
        .add(ActionDemo.ADD)

        // Embed an Image manually
        .start(ActionDemo.ADD).start('img').attr('src','https://cdn4.iconfinder.com/data/icons/48x48-free-object-icons/48/Add.png').end().end()

        // Set the ActionView's icon
        .start(ActionDemo.ADD, {icon:'https://cdn4.iconfinder.com/data/icons/48x48-free-object-icons/48/Add.png'}).end()

        // Set the ActionView's icon and hide the label
        .start(ActionDemo.ADD, {showLabel: false, icon:'https://cdn4.iconfinder.com/data/icons/48x48-free-object-icons/48/Add.png'}).end()

        // Set the ActionView's icon and hide the label and make an anchor to avoid button decoration
        .start(ActionDemo.ADD, {showLabel: false, icon:'https://cdn4.iconfinder.com/data/icons/48x48-free-object-icons/48/Add.png'}).setNodeName('a').end()

        // Show an Action that already has an icon defined
        .start(ActionDemo.ADD2).end()

        .add(this.VIEW_ACTION)

        .tag({class: 'ActionDemoSubView'});
    }
  ],
  actions: [
    function viewAction() {
      console.log('view action');
    }
  ]
});

ActionDemoView.create({data: ActionDemo.create()}).write();


foam.CLASS({
  name: 'ParentView',
  extends: 'foam.u2.Element',
  css: '^ { background: pink }',
  methods: [ function initE() {
    this.addClass(this.myClass()).add('text');
  }]
});

foam.CLASS({
  name: 'Child1View',
  extends: 'ParentView',
  axioms: [ foam.u2.CSS.create({code: ParentView.getAxiomsByClass(foam.u2.CSS)[0].code}) ]
});

foam.CLASS({
  name: 'Child2View',
  extends: 'ParentView',
  axioms: [ foam.u2.CSS.create({code: ParentView.getAxiomsByClass(foam.u2.CSS)[0].code}) ]
});

Child1View.create().write();
Child2View.create().write();


foam.CLASS({
  name: 'FObjectViewTest',
  properties: [
    {
      class: 'FObjectProperty',
      name: 'obj',
      view: { class: 'foam.u2.view.FObjectView' },
      value: foam.util.Timer.create()
    }
  ]
});

var fovt = FObjectViewTest.create();
foam.u2.DetailView.create({data:fovt}).write();
foam.u2.DetailView.create({data:fovt}).write();


foam.CLASS({
  name: 'StringArrayTest',
  properties: [
    {
      class: 'StringArray',
      name: 'a1',
      value: [ 'abc', 'def', 'xyz' ]
    },
    {
      class: 'StringArray',
      name: 'a2',
      view: { class: 'foam.u2.view.StringArrayRowView' }
    }
  ]
});

foam.CLASS({
  name: 'StringArrayTestDetailView',
  extends: 'foam.u2.View',

  properties: [
    { class: 'Boolean', name: 'showMe' }
  ],

  methods: [
    function initE() {
      this.SUPER();

//      this.tick();

      this.start('blockquote')
        .show(this.showMe$)
        .forEach(this.data.a1, function(d) {
          this.add('(', d, ')');
        })
      .end();

      this.tag('br');
      this.add(this.data.a1.map(function(d) { return '[' + d + ']'; }));
    }
  ],

  listeners: [
    {
      name: 'tick',
      isMerged: true,
      mergeDelay: 1000,
      code: function() {
        this.showMe = ! this.showMe;
        this.tick();
      }
    }
  ]
});



var sat = StringArrayTest.create({a1:['abc','def','ghi']});
// sat.a1$ = sat.a2$;

// foam.u2.DetailView.create({data: sat}).write(document);

StringArrayTestDetailView.create({data: sat}).write(document);


foam.CLASS({
  name: 'TextFieldTest',

  properties: [
    {
      class: 'Float',
      name: 'floatViewTest',
      precision: 2,
      view: { class: 'foam.u2.FloatView', min: 0.01, max: 0.99, onKey: true }
    },
    {
      class: 'String',
      name: 'textField',
    },
    {
      class: 'Boolean',
      name: 'booleanField',
    },
    {
      class: 'Date',
      name: 'datePicker',
      view: 'foam.u2.property.MDDateField'
    },
    {
      class: 'String',
      name: 'textArea',
      view: { class: 'foam.u2.tag.TextArea', rows: 5, cols: 40}
    },
    {
      class: 'String',
      name: 'choiceView',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [ 'Red', 'Green', 'Blue' ]
      }
    },
    {
      class: 'String',
      name: 'choiceView2',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [ [ 'R', 'Red' ], [ 'G', 'Green' ], [ 'B', 'Blue' ] ]
      }
    },
    {
      class: 'String',
      name: 'comboBox',
      view: {
        class: 'foam.u2.TextField',
        choices: [ 'Red', 'Green', 'Blue', 'Purple', 'Peach', 'Pink' ]
      }
    },
  ]
});

var d = TextFieldTest.create();
foam.u2.DetailView.create({ data: d }).write();
foam.u2.DetailView.create({ data: d }).write();
