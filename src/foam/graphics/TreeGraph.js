
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
     },
     'time'
   ],

   topics: [
    'layoutComplete'
   ],

   methods: [
     function initCView() {
       this.SUPER();

       this.color = 'white';

       if ( this.data ) {
        this.root = this.TreeNode.create({y: this.nodeHeight * 2, data: this.data});
        this.add(this.root);
        this.doLayout();
       }
     },
   ],

   listeners: [
     {
       name: 'doLayout',
       isMerged: true,
       mergeDelay: 1,
       code: function() {
         if ( ! this.time ) {
           this.time = Date.now();
         }
          if ( this.root && this.root.layout() ) {
            this.invalidate();
            this.doLayout();
          } else {
            // console.log(Date.now() - this.time)
            this.time = null;
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

         var deltaX = Math.abs(this.width - width) / width;
         var deltaY = Math.abs(this.height - height) / height;

         if ( deltaX > 0.01 || deltaY > 0.01 ) {
           this.width = width;
           this.height = height;

           this.root.centerX = 0;
           this.root.centerX = - Math.min.apply(Math, this.root.outline.map(o => o.left));
           this.layoutComplete.pub();
         }
      }
     }
   ]
 });
