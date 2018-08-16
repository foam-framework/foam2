/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

var E = foam.__context__.E.bind(foam.__context__);

foam.CLASS({
  name: 'Tab',
  extends: 'foam.u2.Element',

  properties: [
    { class: 'String',  name: 'label' },
    { class: 'Boolean', name: 'selected' }
  ]
});


foam.CLASS({
  name: 'Tabs',
  extends: 'foam.u2.Element',

  css: `
    ^ {
      background: gray;
      width: 600px;
      height: 200px;
      padding: 10px;
      display: block;
    }
    ^tabRow { height: 30px; }
    ^tab {
      border: 1px solid black;
      border-bottom: none;
      padding: 5px;
      background: lightgray;
    }
    ^tab.selected {
      background: white;
      position: relative;
      z-index: 1;
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
    /* not used
    {
      name: 'tabs',
      factory: function() { return []; }
    },
    */
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
        end();

        tab.shown$ = tab.selected$;
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
