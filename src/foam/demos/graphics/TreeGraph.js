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
    }
  ],

  methods: [
    function xxxinitCView( x, y, seriesValues, radius, margin, graphColors, symbol, lineColor, w, h, lineWidth, fontValue, align ) {
    },

    function addChildNode() {
      var node = this.cls_.create({x: 50, y:100});
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
