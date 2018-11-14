/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
   package: 'foam.graphics',
   name: 'TreeGraph',
   extends: 'foam.graphics.CView',

   exports: [ 'nodeWidth', 'nodeHeight', 'padding', 'relationship', 'as graph', 'formatNode' ],

   properties: [
     [ 'nodeWidth',  155 ],
     [ 'nodeHeight',  60 ],
     [ 'padding',     30 ],
     {
       name: 'data'
     },
     {
       name: 'relationship'
     },
     'root',
     {
       name: 'formatNode',
       value: function() {}
     }
   ],

   methods: [
     function init() {
       this.SUPER();

       if ( this.data ) {
         this.root = this.Node.create();
         this.children.push(this.root);
       }
     },

     function initCView() {
       this.SUPER();

       // List for 'click' events to expand/collapse Nodes.
       this.canvas.on('click', function(e) {
         var x = e.clientX+this.nodeWidth/2, y = e.clientY;
         var c = this.root.findFirstChildAt(x, y);
         if ( ! c ) return;
         c.expanded = ! c.expanded;
         if ( ! c.expanded ) {
           for ( var i = 0 ; i < c.childNodes.length ; i++ ) {
             c.childNodes[i].y = this.nodeHeight;
             c.childNodes[i].x = 0;
           }
         }
         this.doLayout();
       }.bind(this));
     },

     function doLayout() { if ( this.root ) this.root.doLayout(); }
   ],

   classes: [
     {
       name: 'Node',
       extends: 'foam.graphics.Box',

       requires: [
         'foam.graphics.Box',
         'foam.graphics.CView',
         'foam.graphics.Label',
         'foam.graphics.Line'
       ],

       imports: [ 'nodeWidth', 'nodeHeight', 'padding', 'parentNode?', 'formatNode', 'graph' ],
       exports: [ 'as parentNode' ],

       properties: [
         'data',
         { name: 'height', factory: function() { return this.nodeHeight; } },
         { name: 'width',  factory: function() { return this.nodeWidth; } },
         [ 'border', 'gray' ],
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
         [ 'color', 'white' ]
       ],

       methods: [
         function initCView() {
           this.SUPER();

           this.formatNode();

           if ( this.relationship ) {
             this.data[this.relationship.forwardName].select(function(data) {
               this.addChildNode({data: data});
              }.bind(this));
            }
         },

         function paint(x) {
           if ( ! this.parentNode || this.parentNode.expanded ) this.SUPER(x);
         },

         function paintSelf(x) {
           x.translate(-this.width/2, 0);
           this.SUPER(x);
           x.translate(this.width/2, 0);

           this.paintConnectors(x);
         },

         function paintConnectors(x) {
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
             var h = this.childNodes[0].y*3/4;
             line(0, this.height, 0, h);
             var l = this.childNodes.length;
             for ( var i = 0 ; i < l ; i++ ) {
               var c = this.childNodes[i];
               if ( i == 0 || i == l-1 ) {
                line(0, h, c.x, h);
               }
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
           var node = this.cls_.create(args, this);
           this.add(node);
           this.childNodes.push(node);
           this.graph.doLayout();
           return this;
         },

         function layout() {
           this.left = this.right = 0;

           if ( ! this.expanded ) return false;

           var moved      = false;
           var childNodes = this.childNodes;
           var l          = childNodes.length;

           // Layout children
           for ( var i = 0 ; i < l ; i++ ) {
             var c = childNodes[i];
             if ( c.y < this.height*2 ) { moved = true; c.y += 5; }

             if ( c.layout() ) moved = true;
             this.left  = Math.min(this.left, c.x);
             this.right = Math.max(this.right, c.x);
           }

           // Move children away from each other if required
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
                 n1.x -= w/2;
                 n2.x += w/2;
               } else if ( i < Math.floor(m) ) {
                 n1.x -= w;
               } else {
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
           documentation: 'Animate layout until positions stabilize',
           code: function() { if ( this.layout() ) this.doLayout(); }
         }
       ]
     }
   ]
 });
