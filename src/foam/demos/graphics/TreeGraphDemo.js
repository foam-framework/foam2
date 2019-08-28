/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demo.graphics',
  name: 'TreeGraphDemo',
  extends: 'foam.graphics.TreeGraph',

  properties: [
    [ 'width', 1500 ],
    [ 'height', 1000 ],
    [ 'x', 0 ],
    [ 'y', 0 ],
    {
      name: 'formatNode',
      value: function() {
        var c = this.hsl(Math.random()*360, 90, 45);

        this.add(this.Label.create({color: 'black', x: -this.width/2+14, y: 7, text: 'ABC Corp.', font: 'bold 12px sans-serif'}));
        this.add(this.Label.create({color: 'gray',  x: -this.width/2+14, y: this.height-20, text: this.childNodes.length ? 'Aggregate' : ''}));
        this.add(this.Label.create({color: 'gray',  x: this.width/2-10,  y: this.height-20, align: 'end', text: '$100,000'}));
        this.add(this.Line.create({
          startX: -this.width/2+7,
          startY: 5,
          endX: -this.width/2+7,
          endY: this.height-5,
          color: c,
          lineWidth: 4
        }));
      }
    }
  ],

  methods: [
    function init() {
      var g = this.Node.create({x:500, y:40}, this);
      this.root = g;
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
