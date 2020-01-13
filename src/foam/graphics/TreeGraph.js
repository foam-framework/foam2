
/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
   package: 'foam.graphics',
   name: 'TreeGraph',
   extends: 'foam.graphics.Box',

   requires: [
    'foam.graphics.TreeNode'
   ],
   exports: [
     'as graph',
     'formatNode',
     'relationship',
     'isAutoExpandedByDefault',
     'childNodesForAutoExpansion'
   ],

   properties: [
     [ 'nodeWidth',  155 ],
     [ 'nodeHeight',  60 ],
     [ 'lineWidth',   0.5 ],
     [ 'padding',     30 ],
     [ 'color', 'white'],
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
     },
     {
       class: 'Boolean',
       name: 'isAutoExpandedByDefault',
       value: true     
     },
     {
       class: 'Int',
       name: 'childNodesForAutoExpansion',
       value: 5
     }
   ],

   topics: [
    'onSizeChangeComplete'
   ],

   methods: [
     function initCView() {
       this.SUPER();

       if ( this.data ) {
        this.root = this.TreeNode.create({
          width: this.nodeWidth,
          height: this.nodeHeight,
          padding: this.padding,
          lineWidth: this.lineWidth,
          y: this.nodeHeight * 2,
          data: this.data
        });
        this.add(this.root);
        this.doLayout();
       }
     },
   ],

   listeners: [
     {
       name: 'doLayout',
       isMerged: true,
       code: function() {
          if ( this.root && this.root.layout() ) {
            this.invalidate();
            this.doLayout();
          } else {
            this.updateCSize();
          }
        }
     },
     {
       name: 'updateCSize',
       isFramed: true,
       code: function() {
         const maxes  = {
           maxLeft: Number.MAX_SAFE_INTEGER,
           maxRight: Number.MIN_SAFE_INTEGER
         }

         this.root.outline.forEach(level => {
           maxes.maxLeft = Math.min(level.left, maxes.maxLeft);
           maxes.maxRight = Math.max(level.right, maxes.maxRight);
         })

         var width = Math.abs(maxes.maxLeft - maxes.maxRight);
         var height = (this.nodeHeight * 2) * (this.root.outline.length + 1);

         if ( this.width != width || this.height != height ) {
           this.width = width;
           this.height = height;

           this.root.centerX = 0;
           this.root.centerX = - Math.min.apply(Math, this.root.outline.map(o => o.left));

           // IMPORTANT: Have to add the extra invalidate and doLayout to avoid a bug with
           // the tree freezing upon render sometimes during search 
           this.invalidate();
           this.doLayout();

         } else {
          this.onSizeChangeComplete.pub();
         }
      }
     }
   ]
 });
