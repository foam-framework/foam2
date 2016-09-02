foam.CLASS({
  name: 'SampleBorder',
  extends: 'foam.u2.Element',

  axioms: [
    foam.u2.CSS.create({
      code: function() {/*
        ^ { background: gray; padding: 10px; display: inline-block; }
        ^title { align-content: center; background: pink; }
        ^content { width: 300px; height: 300px; background: white; }
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
          start('div').cssClass(this.myCls('content')).add('sample content').end();
    }
  ]
});

var sb = SampleBorder.create({title: 'Title'});
sb.add('content');
sb.write();
