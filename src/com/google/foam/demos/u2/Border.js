var E = foam.__context__.E.bind(foam.__context__);

foam.CLASS({
  name: 'SampleBorder',
  extends: 'foam.u2.Element',

  axioms: [
    foam.u2.CSS.create({
      code: function() {/*
        ^ { background: gray; padding: 10px; display: inline-block; }
        ^title { padding: 6px; align-content: center; background: aliceblue; }
        ^content { padding: 6px; width: 300px; height: 200px; background: white; }
      */}
    })
  ],

  properties: [
    'title'
  ],

  methods: [
    function init() {
      this.
          cssClass(this.myCls()).
          start('div').cssClass(this.myCls('title')).add(this.title$).end().
          start('div', null, this.content$).
            cssClass(this.myCls('content')).
          end();
    }
  ]
});

var sb = SampleBorder.create({title: 'Title'});
sb.add('content');
sb.write();


E('br').write();

foam.CLASS({
  name: 'SampleSplitContainer',
  extends: 'foam.u2.Element',

  axioms: [
    foam.u2.CSS.create({
      code: function() {/*
        ^ { background: gray; padding: 10px; display: inline-flex; }
        ^content { margin: 4px; padding: 6px; width: 300px; height: 200px; background: white; }
      */}
    })
  ],

  properties: [
    'leftPanel', 'rightPanel'
  ],

  methods: [
    function init() {
      this.
          cssClass(this.myCls()).
          start('div', null, this.leftPanel$).
            cssClass(this.myCls('content')).
          end().
          start('div', null, this.rightPanel$).
            cssClass(this.myCls('content')).
          end();
    }
  ]
});

var split = SampleSplitContainer.create();
split.write();
split.leftPanel.add('leftContent');
split.rightPanel.add('rightContent');

E('br').write();


foam.CLASS({
  name: 'Tab',
  extends: 'foam.u2.Element',

  properties: [ 'label' ]
});


foam.CLASS({
  name: 'Tabs',
  extends: 'foam.u2.Element',

  axioms: [
    foam.u2.CSS.create({
      code: function() {/*
        ^ { background: gray; width: 600px; height: 200px; padding: 10px; display: block; }
        ^handles { height: 30px; backround: pink; }
        ^content { margin: 4px; padding: 6px; background: white; }
      */}
    })
  ],

  properties: [
    {
      name: 'tabs',
      factory: function() { return []; }
    },
    'handles',
    'area'
  ],

  methods: [
    function init() {
      this.
          cssClass(this.myCls()).
          start('div', null, this.handles$).
            cssClass(this.myCls('handles')).
            add('handles').
          end().
          start('div', null, this.content$).
            cssClass(this.myCls('content')).
          end();
    }
  ]
});

var tabs = Tabs.create();
var t2 = tabs.
  start(Tab, {label: 'Tab 1'}).add('tab 1 contents').end().
  start(Tab, {label: 'Tab 2'}).add('tab 2 contents').end();

tabs.write();
