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
    'foam.graphics.CView',
    'foam.graphics.Label'
  ],

  properties: [
    [ 'height', 60 ],
    [ 'width', 140 ],
    [ 'border', 'gray' ],
    [ 'slide', 0 ],
    {
      name: 'childNodes',
      factory: function() { return []; }
    },
    [ 'left',  0 ],
    [ 'right', 0 ],
    {
      class: 'Boolean',
      name: 'expanded',
      value: true
    },
    [ 'color', 'white' ],
    [ 'padding', 30 ],
    'parentNode'
  ],

  methods: [
    function initCView() {
      this.SUPER();

      this.add(this.Label.create({x: -this.width/2+10, y: 7, text: 'ABC Corp.', font: 'bold 12px sans-serif'}));
      this.add(this.Label.create({x: this.width/2-10,  y: this.height-22, align: 'end', text: '$100,000'}));
      this.add(this.Label.create({x: -this.width/2+10, y: this.height-22, text: this.childNodes.length ? 'Aggregate' : ''}));

      // If top-level node
      if ( ! this.parentNode ) {
        var self = this;
        this.parent.canvas.on('click', function(e) {
          var c = self.findFirstChildAt(e.clientX+50, e.clientY);
          if ( ! c ) return;
          c.expanded = ! c.expanded;
          if ( ! c.expanded ) {
            for ( var i = 0 ; i < c.childNodes.length ; i++ ) {
              c.childNodes[i].y = self.height;
              c.childNodes[i].x = 0;
            }
          }
          self.doLayout();
        });
      }
    },

    function paint(x) {
      if ( this.parentNode && ! this.parentNode.expanded ) return;
      this.SUPER(x);
    },

    function paintSelf(x) {
      x.translate(-this.width/2, 0);
      this.SUPER(x);
      x.translate(this.width/2, 0);

      function line(x1, y1, x2, y2) {
        x.beginPath();
        x.moveTo(x1, y1);
        x.lineTo(x2, y2);
        x.stroke();
      }

      x.lineWidth   = 0.5; //this.borderWidth;
      x.strokeStyle = this.border;

      // Paint lines to childNodes
      if ( this.expanded && this.childNodes.length ) {
        var h = this.height+25;
        line(0, this.height, 0, h);
        var l = this.childNodes.length;
        for ( var i = 0 ; i < l ; i++ ) {
          var c = this.childNodes[i];
          line(0, h, c.x, h);
          line(c.x, h, c.x, c.y);
        }
      }

      x.lineWidth = 1.5; //this.borderWidth;
      // Paint expand/collapse arrow
      if ( this.childNodes.length ) {
        var d = this.expanded ? 5 : -5;
        var y = this.height - 8;
        line(-5, y, 0, y+d);
        line(0, y+d, 5, y);
      }
    },

    function addChildNode(args) {
      var node = this.cls_.create({y: 0, parentNode: this});
      node.copyFrom(args);
      this.add(node);
      this.childNodes.push(node);
      this.doLayout();
      return this;
    },

    function layout() {
      this.left = this.right = 0;

      if ( ! this.expanded ) return false;

      var moved      = false;
      var childNodes = this.childNodes;
      var l          = childNodes.length;

      for ( var i = 0 ; i < l ; i++ ) {
        var c = childNodes[i];
        if ( c.y < this.height*2 ) { moved = true; c.y += 5; }

        moved      = moved || c.layout();
        this.left  = Math.min(this.left, c.x);
        this.right = Math.max(this.right, c.x);
      }

      var m = l/2;
      for ( var i = 0 ; i < l-1 ; i++ ) {
        var n1 = childNodes[i];
        var n2 = childNodes[i+1];
        var d  = n2.x-n1.x+n2.left-n1.right;
        if ( d != this.width + this.padding ) {
          moved = true;
          var w = Math.min(Math.abs(this.width+this.padding-d), 10);
          if ( d > this.width + this.padding ) w = -w;
          if ( i+1 == m ) {
            // console.log('move away', w/2);
            n1.x -= w/2;
            n2.x += w/2;
          } else if ( i < Math.floor(m) ) {
            // console.log('move left', i, m, l, w);
            n1.x -= w;
          } else {
            // console.log('move right', i, m, l, w);
            n2.x += w;
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
