foam.CLASS({
  name: 'TreeGraphDemo',
  extends: 'foam.graphics.TreeGraph',

  properties: [
    [ 'width', 2000 ],
    [ 'height', 1000 ],
    [ 'x', 0 ],
    [ 'y', 0 ]
  ],

  methods: [
    function init() {
      var g = this.Node.create({x:1110, y:40}, this);
      this.add(g.addChildNode().addChildNode().addChildNode().addChildNode());
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
    }
  ]
});
