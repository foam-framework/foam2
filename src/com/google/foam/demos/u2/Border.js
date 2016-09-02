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
    function initE() {
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
sb.write();
sb.add('content');


var E = foam.__context__.E.bind(foam.__context__);
E('br').write();
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
    function initE() {
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
