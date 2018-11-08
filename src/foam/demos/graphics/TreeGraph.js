/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


 foam.CLASS({
   // package: 'foam.graphics',
   name: 'TreeGraphDemo',
   extends: 'foam.graphics.CView',

   properties: [
     [ 'x', 0 ],
     [ 'y', 0 ],
     [ 'height', 2000 ],
     [ 'width', 2000 ]
   ],

   methods: [
     function init() {
       var g = TreeGraph.create({x:500, y:50});
       this.add(g.addChildNode());
       this.add(g.addChildNode());
       this.add(g.addChildNode());
       g.children[0].addChildNode().addChildNode();
       g.children[0].children[0].addChildNode().addChildNode();
     }
   ]
 });

foam.CLASS({
  // package: 'foam.graphics',
  name: 'TreeGraph',
  extends: 'foam.graphics.Box',

  requires: [
    'foam.graphics.Box',
    'foam.graphics.CView'
  ],

  properties: [
    [ 'height', 50 ],
    [ 'width', 100 ],
    [ 'border', 'gray' ],
    {
      name: 'childNodes',
      factory: function() { return []; }
    },
    'parentNode'
  ],

  methods: [
    function xxxinitCView( x, y, seriesValues, radius, margin, graphColors, symbol, lineColor, w, h, lineWidth, fontValue, align ) {
    },

    function paintSelf(x) {
      this.SUPER(x);
      if ( this.children.length ) {
        function line(x1, y1, x2, y2) {
          x.beginPath();
          x.moveTo(x1, y1);
          x.lineTo(x2, y2);
          x.lineWidth = 1;
          x.strokeStyle = 'gray';
          x.stroke();
        }
        line(-this.children.length*100 + 150, 75, this.children.length*100 -50, 75);
        line(50, 50, 50, 75);
        var l = this.children.length;
        for ( var i = 0 ; i < l ; i++ ) {
          line(i*200-100*(l-1)+50, 75, i*200-100*(l-1)+50, 100);
        }
      }
    },

    function addChildNode() {
      var node = this.cls_.create({x: 50, y:100, parentNode: this});
      this.add(node);
      this.layout();
      return this;
    },

    function layout() {
      var l = this.children.length;
      for ( var i = 0 ; i < l ; i++ ) {
        this.children[i].x = -l*100 + 200 * i + 100;
      }
    }

  ]
} );
