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
       var g = TreeGraph.create({x:800, y:50});
       this.add(g.addChildNode());
       this.add(g.addChildNode());
       this.add(g.addChildNode());
       g.children[0].addChildNode()/*.addChildNode()*/;
       g.children[0].addChildNode();
       g.children[0].children[0].addChildNode().addChildNode()/*.addChildNode()*/;
       g.children[0].children[0].children[0].addChildNode().addChildNode();
       g.children[0].children[1].addChildNode();
       g.children[1].addChildNode();
       g.children[2].addChildNode();
       g.children[2].children[0].addChildNode();
       g.children[2].children[0].addChildNode();
       g.children[2].children[0].addChildNode();
       g.children[2].children[0].children[1].addChildNode();
       g.children[2].children[0].children[2].addChildNode().addChildNode();
       g.layout();
       g.x+=100;

/*
       var g = TreeGraph.create({x:100, y:500});
       this.add(g.addChildNode());

       var g = TreeGraph.create({x:350, y:500});
       this.add(g.addChildNode());
       this.add(g.addChildNode());

       var g = TreeGraph.create({x:850, y:500});
       this.add(g.addChildNode());
       this.add(g.addChildNode());
       this.add(g.addChildNode());
       */
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
    [ 'slide', 0 ],
    {
      name: 'childNodes',
      factory: function() { return []; }
    },
    'parentNode'
  ],

  methods: [
    function doTransform(x) {
      this.SUPER(x);
    },

    function widths() {
      var ws = [];
      ws[0] = this.children.length*2+1;
      return ws;
    },

    function xxxinitCView( x, y, seriesValues, radius, margin, graphColors, symbol, lineColor, w, h, lineWidth, fontValue, align ) {
    },

    function paintSelf(x) {
      x.translate(-50, 0);
      this.SUPER(x);
      x.translate(50, 0);
      if ( this.children.length ) {
        function line(x1, y1, x2, y2) {
          x.beginPath();
          x.moveTo(x1, y1);
          x.lineTo(x2, y2);
          x.lineWidth = 1;
          x.strokeStyle = 'gray';
          x.stroke();
        }
        line(0, 50, 0, 75);
        var l = this.children.length;
        for ( var i = 0 ; i < l ; i++ ) {
          line(0, 75, this.children[i].x, 75);
          line(this.children[i].x, 75, this.children[i].x, 100);
        }
      }
    },

    function addChildNode(args) {
      var node = this.cls_.create({y:100, parentNode: this});
      node.copyFrom(args);
      this.add(node);
      this.layout();
      return this;
    },

    function layout() {
      var children = this.children;
      var l = children.length;
      for ( var i = 0 ; i < l ; i++ ) {
        this.children[i].x = -l*100 + 200 * i + 100;
        this.children[i].layout();
      }

      var m = l/2;
      for ( var i = 0 ; i < l-1 ; i++ ) {
        var n1 = children[i];
        var n2 = children[i+1];
        var w1 = n1.widths()[0];
        var w2 = n2.widths()[0];
        var w = w1 + w2;
        if ( w > 6 ) {
          console.log('******************', i, w, m, w1, w2, n1.children.length, n2.children.length);
          w *= 20*2/3;
          if ( i+1 == m ) {
            console.log('move away', w/2);
            n1.x -= w/2;
            n2.x += w/2;
            n1.color = n2.color = 'green';
          } else if ( i < Math.floor(m) ) {
            console.log('move left', i, m, l, w);
            n1.x -= w;
            n1.color = 'pink';
          } else {
            console.log('move right', i, m, l, w);
            n2.x += w;
            n2.color = 'blue';
          }
        }
      }

      return;
      var children = this.children;
      var l        = children.length;

      if ( ! l ) return;

      children[0].x = -125;
      for ( var i = 1 ; i < l ; i++ ) {
        var p  = children[i-1];
        var c  = children[i];
        var pw = p.widths()[0];
        var cw = c.widths()[0];
        c.x = p.x + Math.min(200, pw/2 + cw/2);
      }
      var w = children[l-1].x/2;
      for ( var i = 0 ; i < l ; i++ ) {
        var p = this.children[i];
        p.x = /*this.x + */ p.x - w/2;
      }
    }

  ]
} );
