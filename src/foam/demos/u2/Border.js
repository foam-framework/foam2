/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// Several examples of creating Border or Container views.
// Containers are views which set the 'content' Property of Element to
// some child Element. When add() is called new child elements are added
// to the content area rather than to the end of the View.
// Alternatively, containers can create explicit content areas like
// 'leftPane', 'rightPane', 'header', etc.

// Copy 'E' out of root context for convenience.
var E = foam.__context__.E.bind(foam.__context__);

// Note that this is just a simple Tab view for demonstration purposes.
// There's a more complete implementation in the foam.u2 package.
foam.CLASS({
  name: 'Tab',
  extends: 'foam.u2.Element',

  css: `
    ^ { xxxposition: absolute; }
  `,

  properties: [
    { class: 'String',  name: 'label' },
    { class: 'Boolean', name: 'selected' }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass());
    }
  ]
});


foam.CLASS({
  name: 'Tabs',
  extends: 'foam.u2.Element',

  css: `
    ^ {
      // background: gray;
      display: block;
      // height: 200px;
      padding: 10px 4px;
      // width: 600px;
      // width: 100%;
    }
    ^tabRow { height: 38px; }
    ^tab {
      background: lightgray;
      border: 1px solid black;
      border-radius: 3px 3px 0 0;
      display: inline-block;
      height: 12px;
      padding: 8px;
    }
    ^tab.selected {
      background: white;
      position: relative;
      z-index: 1;
    }
    ^bottomEdge {
      background: white;
      height: 2.5px;
      left: 0;
      position: absolute;
      top: 27px;
      width: 100%;
    }
    ^content {
      margin: 4px;
      padding: 6px;
      background: white;
      border: 1px solid black;
      position: relative;
      top: -13px;
      left: -4px;
    }
  `,

  properties: [
    {
      name: 'selected',
      postSet: function(o, n) {
        if ( o ) o.selected = false;
        n.selected = true;
      }
    },
    'tabRow'
  ],

  methods: [
    function init() {
      this.
        addClass(this.myClass()).
        start('div', null, this.tabRow$).
          addClass(this.myClass('tabRow')).
        end().
        start('div', null, this.content$).
          addClass(this.myClass('content')).
        end();
    },

    function add(tab) {
      if ( Tab.isInstance(tab) ) {

        if ( ! this.selected ) this.selected = tab;

        this.tabRow.start('span').
          addClass(this.myClass('tab')).
          enableClass('selected', tab.selected$).
          on('click', function() { this.selected = tab; }.bind(this)).
          add(tab.label).
          br().
          start('div').addClass(this.myClass('bottomEdge')).show(tab.selected$).end().
        end();

        // tab.shown$ = tab.selected$;
        // Rather than using 'shown', setting visibility maintains the size of the
        // largest tab.
        tab.style({visibility: tab.selected$.map(function(s) { return s ? '' : 'hidden'; })});
      }

      this.SUPER(tab);
    }
  ]
});

var tabs = Tabs.create().
  start(Tab, {label: 'Tab 1'}).add('tab 1 contents').end().
  start(Tab, {label: 'Tab 2'}).add('tab 2 contents').end().
  start(Tab, {label: 'Tab 3'}).add('Even more contents in tab 3').end();

tabs.write();



E('br').write();
E('br').write();



// TODO: add CardDeck example
foam.CLASS({
  name: 'Card',
  extends: 'foam.u2.Element',

  css: `
    ^ {
      background: white;
      border-radius: 3px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.38);
      margin: 8px;
      transform-origin: top left;
      display: inline-block;
    }
    ^content { padding: 6px; width: 300px; height: 200px; background: white; }
  `,

  methods: [
    function init() {
      this.
        addClass(this.myClass()).
        start('div', null, this.content$).
          addClass(this.myClass('content')).
        end();
    }
  ]
});

Card.create().add('content').tag('br').add('more content').tag('br').add('even more conent').write();



E('br').write();
E('br').write();



foam.CLASS({
  name: 'SampleBorder',
  extends: 'foam.u2.Element',

  css: `
    ^ { background: gray; padding: 10px; display: inline-block; }
    ^title { padding: 6px; align-content: center; background: aliceblue; }
    ^footer { padding: 6px; align-content: left; background: white; }
    ^content { padding: 6px; width: 300px; height: 200px; background: white; }
  `,

  properties: [
    'title',
    'footer'
  ],

  methods: [
    function init() {
      this.
        start().
          addClass(this.myClass()).
          start('div').addClass(this.myClass('title')).add(this.title$).end().
          start('div', null, this.content$).
            addClass(this.myClass('content')).
          end().
          start('div')
            .addClass(this.myClass('footer'))
            .tag('hr')
            .add(this.footer$)
          .end().
        end();
    }
  ]
});

var sb = SampleBorder.create({title: 'Title', footer: 'Footer'});
sb.add('content');
sb.write();



E('br').write();
E('br').write();



foam.CLASS({
  name: 'LabelledSection',
  extends: 'foam.u2.Element',

  css: `
    ^ {
      border-style: ridge;
      display: block;
      padding: 10px;
    }
    ^title {
      background: white;
      color: #666;
      display: inline;
      padding: 3px;
      position: relative;
      top: -20px;
    }
    ^content {
      height: 200px;
      position: relative;
      top: -22px;
      // width: 300px;
    }
  `,

  properties: [ 'title' ],

  methods: [
    function init() {
      this.start().
        addClass(this.myClass()).
        start('div').addClass(this.myClass('title')).add(this.title$).end().
        start('div', null, this.content$).
          addClass(this.myClass('content')).
        end().
      end();
    }
  ]
});

var sb = LabelledSection.create({title: 'Title'});
sb.add('content').br().add('more content');
sb.write();



E('br').write();
E('br').write();



foam.CLASS({
  name: 'SideLabelledSection',
  extends: 'foam.u2.Element',

  css: `
    ^ {
      display: inline-block;
      padding: 10px;
    }
    ^title {
      background: white;
      color: #666;
      display: inline;
      padding: 3px;
      vertical-align: top;
      width: 33%;
    }
    ^content {
      background: white;
      display: inline-block;
      height: 200px;
      width: 66%;
    }
  `,

  properties: [ 'title' ],

  methods: [
    function init() {
      this.start().
        addClass(this.myClass()).
        start('div').addClass(this.myClass('title')).add(this.title).end().
        start('div', null, this.content$).
          addClass(this.myClass('content')).
        end().
      end();
    }
  ]
});

var sb = SideLabelledSection.create({title: 'Title'});
sb.add('content').br().add('more content');
sb.write();



E('br').write();
E('br').write();



foam.CLASS({
  name: 'FoldingSection',
  extends: 'foam.u2.Controller',

  requires: [ 'foam.u2.ActionView' ],

  css: `
    ^ {
      border-top: 1px solid #999;
      display: inline-block;
      padding: 10px;
    }
    ^.expanded {
      border: 1px solid #999;
      padding-left: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.38);
    }
    ^control {
      background: white;
      display: inline;
      float: right;
      height: 30px;
      position: relative;
      top: -10px;
      width: 30px;
    }
    ^toolbar {
      color: #666;
      display: inline-block;
      padding: 3px;
      position: relative;
      left: -8px;
      top: -20px;
      width: 100%;
    }
    ^title {
      background: white;
      padding: 3px;
      position: relative;
      top: -3px;
    }
    ^content {
      background: white;
      height: 200px;
      position: relative;
      top: -22px;
      width: 300px;
    }
    ^ .foam-u2-ActionView-toggle {
      transform: rotate(-90deg);
      transition: transform 0.3s;
      background: transparent;
      border: none;
      outline: none;
      padding: 3px;
      width: 30px;
      height: 30px;
    }
    ^.expanded .foam-u2-ActionView-toggle {
      transform: rotate(0deg);
      transition: transform 0.3s;
    }
    ^ .foam-u2-ActionView-toggle:hover {
      background: transparent;
    }
  `,

  properties: [
    'title',
    {
      class: 'Boolean',
      name: 'expanded',
      value: true
    }
  ],

  methods: [
    function init() {
      this.
        addClass(this.myClass()).
        enableClass('expanded', this.expanded$).
        start('div').
          addClass(this.myClass('toolbar')).
          start('span').
            addClass(this.myClass('title')).
            add(this.title$).
          end().
          start('div').
            addClass(this.myClass('control')).
            tag(this.ActionView, {action: this.TOGGLE, data: this, label: '\u25BD'}).
          end().
        end().
        start('div', null, this.content$).
          show(this.expanded$).
          addClass(this.myClass('content')).
        end();
    }
  ],

  actions: [
    function toggle() { this.expanded = ! this.expanded; }
  ]
});

var sb = FoldingSection.create({title: 'Title'}).style({width: '500px'});
sb.add('content').br().add('more content');
sb.write();



E('br').write();
E('br').write();



foam.CLASS({
  name: 'MDFoldingSection',
  extends: 'FoldingSection',

  requires: [ 'foam.u2.ActionView' ],

  css: `
    ^ {
      border: 1px solid #999;
      padding-left: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.38);
    }
    ^.expanded {
    }
    ^control {
      background: white;
      display: inline;
      float: right;
      height: 30px;
      position: relative;
      top: -10px;
      width: 30px;
    }
    ^toolbar {
      color: #666;
      display: inline-block;
      padding: 3px;
      position: relative;
      left: -8px;
      top: 10px;
      width: 100%;
    }
    ^title {
      background: white;
      padding: 3px;
      position: relative;
      top: -3px;
    }
    ^content {
      background: white;
      height: 200px;
      width: 300px;
    }
    ^ .foam-u2-ActionView-toggle {
      transform: rotate(-90deg);
      transition: transform 0.3s;
      background: transparent;
      border: none;
      outline: none;
      padding: 3px;
      width: 30px;
      height: 30px;
    }
    ^.expanded .foam-u2-ActionView-toggle {
      transform: rotate(0deg);
      transition: transform 0.3s;
    }
    ^ .foam-u2-ActionView-toggle:hover {
      background: transparent;
    }
  `,
/*
  properties: [
    'title',
    {
      class: 'Boolean',
      name: 'expanded',
      value: true
    }
  ],

  methods: [
    function init() {
      this.
        addClass(this.myClass()).
        enableClass('expanded', this.expanded$).
        start('div').
          addClass(this.myClass('toolbar')).
          start('span').
            addClass(this.myClass('title')).
            add(this.title$).
          end().
          start('div').
            addClass(this.myClass('control')).
            tag(this.ActionView, {action: this.TOGGLE, data: this, label: '\u25BD'}).
          end().
        end().
        start('div', null, this.content$).
          show(this.expanded$).
          addClass(this.myClass('content')).
        end();
    }
  ],

  actions: [
    function toggle() { this.expanded = ! this.expanded; console.log(this.expanded); }
  ]
  */
});

var sb = MDFoldingSection.create({title: 'Title'}).style({width: '500px'});
sb.add('content').br().add('more content');
sb.write();



E('br').write();
E('br').write();



foam.CLASS({
  name: 'SampleSplitContainer',
  extends: 'foam.u2.Element',

  css: `
    ^ { background: gray; padding: 10px; display: inline-flex; }
    ^content { margin: 4px; padding: 6px; width: 300px; height: 200px; background: white; }
  `,

  properties: [
    'leftPanel', 'rightPanel'
  ],

  methods: [
    function init() {
      this.
        addClass(this.myClass()).
        start('div', null, this.leftPanel$).
          addClass(this.myClass('content')).
        end().
        start('div', null, this.rightPanel$).
          addClass(this.myClass('content')).
        end();
    }
  ]
});

var split = SampleSplitContainer.create();
split.write();
split.leftPanel.add('leftContent');
split.rightPanel.add('rightContent');



E('br').write();
E('br').write();
E('br').write();



foam.CLASS({
  name: 'Blink',
  extends: 'foam.u2.Element',

  methods: [ function init() { this.blinkOn(); } ],

  listeners: [
    {
      name: 'blinkOn',
      isMerged: true,
      mergeDelay: 250,
      code: function() { this.style({visibility: 'visible'}); this.blinkOff(); }
    },
    {
      name: 'blinkOff',
      isMerged: true,
      mergeDelay: 750,
      code: function() { this.style({visibility: 'hidden'}); this.blinkOn(); }
    }
  ]
});

var blink = Blink.create();
blink.add('blinking');
blink.write();



E('br').write();
E('br').write();



foam.CLASS({
  name: 'Columns',
  extends: 'foam.u2.Element',

  css: `
    ^ {
      // background: #efefef;
      display: flex;
      // width: 100%;
    }
  `,

  methods: [
    function init() {
      this.addClass(this.myClass());
    }
  ]
});

foam.CLASS({
  name: 'Column',
  extends: 'foam.u2.Element',

  css: `
    ^ {
      display: inline-block;
      padding: 4px;
      float: left;
      margin: 4px;
      // border: 1px solid black;
      // width: 100%;
    }
  `,

  methods: [
    function init() {
      this.addClass(this.myClass())
    }
  ]
});

var cols = E().
  start(Columns).
    start(Column).add('column 1 contents').end().
    start(Column).add('column 2 contents').br().add('and more content').end().
  end().
  start(Columns).
    start(Column).add('column 1 contents').end().
    start(Column).add('column 2 contents').br().add('and more content').end().
    start(Column).add('column 3 contents').br().add('and more content').end().
  end().
  start(Tabs).
    start(Tab, {label: 'Tab 1'}).add('tab 1 contents').end().
    start(Tab, {label: 'Tab 2'}).add('tab 2 contents').end().
    start(Tab, {label: 'Tab 3'}).add('Even more contents in tab 3').end().
  end().
  start(foam.u2.Tabs).
    start(foam.u2.Tab, {label: 'Tab 1'}).add('tab 1 contents').end().
    start(foam.u2.Tab, {label: 'Tab 2'}).add('tab 2 contents').end().
    start(foam.u2.Tab, {label: 'Tab 3'}).add('Even more contents in tab 3').end().
  end().
  start(Tabs).
    start(Tab, {label: 'Tab 1'}).add('tab 1 contents').end().
    start(Tab, {label: 'Tab 2'}).add('tab 2 contents').end().
    start(Tab, {label: 'Tab 3'}).add('Even more contents in tab 3').end().
  end();
cols.write();
