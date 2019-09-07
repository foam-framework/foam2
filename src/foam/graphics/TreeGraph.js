
/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
   package: 'foam.graphics',
   name: 'TreeGraph',
   extends: 'foam.graphics.CView',

   exports: [
     'as graph',
     'formatNode',
     'nodeHeight',
     'nodeWidth',
     'padding',
     'relationship'
   ],

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
     function initCView() {
       this.SUPER();

       if ( this.data ) {
        this.root = this.Node.create({x:500, y: 50, data: this.data});
        this.add(this.root);
        this.doLayout();
       }

       // List for 'click' events to expand/collapse Nodes.
       this.canvas.on('click', function(e) {
         var x = e.layerX+this.nodeWidth/2, y = e.layerY;
         var c = this.canvas.cview.findFirstChildAt(x,y);

         if ( ! c ) return;
         c.expanded = ! c.expanded;
         
         if ( ! c.expanded ) {
           for ( var i = 0 ; i < c.childNodes.length ; i++ ) {
             c.childNodes[i].y = this.nodeHeight;
             c.childNodes[i].x = 0;
           }
           c.maxLeft = c.maxRight = 0;
         }
         this.doLayout();
       }.bind(this));
     },

     function doLayout() {
       if ( this.root ) { 
        this.root.layout();
        this.root.doLayout();
      }
       this.invalidate();
     }
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

       imports: [
         'formatNode',
         'graph',
         'nodeHeight',
         'nodeWidth',
         'padding',
         'parentNode?',
         'relationship'
       ],
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
         [ 'maxLeft',  0 ],
         [ 'maxRight', 0 ],
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
             var data = this.data.clone(this.__subContext__);

             try {
               data[this.relationship.forwardName].select(function(data) {
                 this.addChildNode({data: data});
                }.bind(this));
              } catch(x) {}
              this.graph.doLayout();
            }
         },

         function paint(x) {
           if ( ! this.parentNode || this.parentNode.expanded ) this.SUPER(x);
         },

         function hitTest(p) {
           /** Needed to avoid handling click events when parent isn't expanded. **/
           return ! this.parentNode || this.parentNode.expanded ? this.SUPER(p) : false;
         },

         function paintSelf(x) {
           x.save();

           // Add shadow blur to box
           x.shadowBlur    = 5;
           x.shadowOffsetX = 5;
           x.shadowOffsetY = 5;
           x.shadowColor   = "gray";

           x.translate(-this.width/2, 0);
           this.SUPER(x);

           // reset translate and shadow settings
           x.restore();

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
               line(c.x, h, c.x, c.y);
             }
           }

           x.lineWidth = this.borderWidth;
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
             if ( c.y < this.height*2 ) { moved = true; c.y += 2; }

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
           // TODO/BUG: I'm not sure why this is necessary, but without, center
           // nodes are a few pixels off.
           if ( l%2 == 1 ) childNodes[Math.floor(m)].x = 0;

           // Calculate maxLeft and maxRight
           this.maxLeft = this.maxRight = 0;
           for ( var i = 0 ; i < l ; i++ ) {
             var c = childNodes[i];
             this.maxLeft  = Math.min(c.x + c.maxLeft, this.maxLeft);
             this.maxRight = Math.max(c.x + c.maxRight, this.maxRight);
           }

           return moved;
         },

         function convergeTo(slot, newValue) {
           /* Return true iff value was changed. */
           var delta = Math.abs(slot.get() - newValue);
           if ( delta < 0.001 ) {
             slot.set(newValue);
             return false;
           }
           slot.set((2*slot.get() + newValue)/3);
           return true;
         }
       ],

       listeners: [
        {
          name: 'doLayout',
          isFramed: true,
          documentation: 'Animate layout until positions stabilize',
          code: function() {
            var needsLayout = false;
            // Scale and translate the view to fit in the available window
            var gw = this.graph.width-110;
            var w  = this.maxRight - this.maxLeft + 55;

            var x = (-this.maxLeft+25)/w * gw + 55;
            needsLayout = this.convergeTo(this.x$, x) || needsLayout;
            
            if ( this.layout() || needsLayout ) {
              this.doLayout();
            }
            else {
              this.graph.updateCWidth();
            }
          
            this.graph.invalidate();
          }
        }
       ]
     }
   ],

   listeners: [
     {
       name: 'updateCWidth',
       isFramed: true,
       code: function() {
        const maxes = {
          maxLeft: 0,
          maxRight: 0
        };
          
        function traverseAndCompare(root) {
          if ( root.maxLeft < maxes.maxLeft ) maxes.maxLeft = root.maxLeft;
          if ( root.maxRight > maxes.maxRight ) maxes.maxRight = root.maxRight;

          for ( var i = 0; i < root.children.length; i++ ){
            traverseAndCompare(root.children[i]);
          }
        }

        traverseAndCompare(this.root);

        // needed to use the adjustments to width in order to account for proper fitting on the screen
        // since by default with out it, the leftmost node and right most node get cutoff by half
        // padding adjustments are there to proper spacing and also for the edge connectors to 
        // fully render
        var width = Math.abs(maxes.maxLeft - maxes.maxRight) + this.nodeWidth + this.padding * 4;
        var delta = Math.abs(this.width - width) / width;

        if ( delta > 0.01 ) {
          this.width = width;
          this.doLayout();
        }
       }
     }
   ]
 });
