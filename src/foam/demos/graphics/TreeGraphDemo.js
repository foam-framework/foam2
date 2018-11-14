foam.CLASS({
  name: 'TreeGraphDemo',
  extends: 'foam.graphics.TreeGraph',

  properties: [
    [ 'width', 2000 ],
    [ 'height', 1000 ]
  ],

  methods: [
    function init() {
      var g = this.Node.create({x:910, y:50});
      this.add(g.addChildNode());
      this.add(g.addChildNode());
      this.add(g.addChildNode());
      g.childNodes[0].addChildNode()/*.addChildNode()*/;
      g.childNodes[0].addChildNode();
      g.childNodes[0].childNodes[0].addChildNode().addChildNode()/*.addChildNode()*/;
      g.childNodes[0].childNodes[0].childNodes[0].addChildNode().addChildNode().addChildNode();
      g.childNodes[0].childNodes[1].addChildNode();
      g.childNodes[1].addChildNode();
      // g.childNodes[1].childNodes[0].addChildNode(); // TODO: not supported
      g.childNodes[2].addChildNode();
      g.childNodes[2].childNodes[0].addChildNode();
      g.childNodes[2].childNodes[0].addChildNode();
      g.childNodes[2].childNodes[0].addChildNode();
      g.childNodes[2].childNodes[0].childNodes[1].addChildNode();
      g.childNodes[2].childNodes[0].childNodes[2].addChildNode().addChildNode();
      g.layout();
      g.x+=100;
    }
  ]
});
