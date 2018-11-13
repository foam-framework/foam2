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
    [ 'left', 0 ],
    [ 'right', 0 ],
    'parentNode'
  ],

  methods: [
    function doTransform(x) {
      this.SUPER(x);
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
          var c = this.children[i];
          line(0, 75, c.x, 75);
          line(c.x, 75, c.x, c.y);
        }
      }
    },

    function addChildNode(args) {
      var node = this.cls_.create({y: 50, parentNode: this});
      node.copyFrom(args);
      this.add(node);
      this.doLayout();
      return this;
    },

    function layout() {
      var moved = false;
      var children = this.children;
      var l = children.length;

      this.left = this.right = 0;
      for ( var i = 0 ; i < l ; i++ ) {
        var c = children[i];
        if ( c.y < 100 ) { moved = true; c.y += 4; }

        c.layout();
        this.left  = Math.min(this.left, c.x);
        this.right = Math.max(this.right, c.x);
      }

      var m = l/2;
      for ( var i = 0 ; i < l-1 ; i++ ) {
        var n1 = children[i];
        var n2 = children[i+1];
        var d = n2.x-n1.x+n2.left-n1.right;
        if ( d < 120 ) {
          moved = true;
          var w = 20;
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

      return moved;
    }
  ],

  listeners: [
    {
      name: 'doLayout',
      isFramed: true,
      code: function() {
        if ( this.layout() ) this.doLayout();
      }
    }
  ]
} );
