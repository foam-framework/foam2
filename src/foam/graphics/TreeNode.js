/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.graphics',
  name: 'TreeNode',
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
    'parentNode?',
    'relationship',
    'isAutoExpandedByDefault',
    'childNodesForAutoExpansion'
  ],
  exports: ['as parentNode'],

  properties: [
    'data',
    [ 'height', 155 ],
    [ 'width', 60 ],
    [ 'padding', 30 ],
    [ 'lineWidth', 0.5 ],
    [ 'border', 'gray' ],
    [ 'color', 'white' ],
    {
      name: 'outline',
      documentation: `
        An array containing the max left ( left edge plus padding of the leftmost node)
        and max right ( right edge plus padding of the rightmost node) values per level
        of the tree where index 0 is the root
      `,
      expression: function (x, width, expanded, childNodes, padding) {
        var outlineBelowRoot = [];

        /**
         * We need to check the outlines of each child node against eachother regardless 
         * of overlap so that we get actual max left and max right of each level,
         * overlap and corresponding adjustments are dealt with in the @layout method
         */
        for (let i = 0; i < childNodes.length && expanded; i++) {
          var childOutline = childNodes[i].outline.map(o => ({
            left: o.left + x,
            right: o.right + x,
          }));

          for (var j = 0; j < childOutline.length; j++) {
            outlineBelowRoot[j] = outlineBelowRoot[j] || {
              left: Number.MAX_SAFE_INTEGER,
              right: Number.MIN_SAFE_INTEGER
            };
            outlineBelowRoot[j].left = Math.min(childOutline[j].left, outlineBelowRoot[j].left);
            outlineBelowRoot[j].right = Math.max(childOutline[j].right, outlineBelowRoot[j].right);
          }
        }

        var rootLevelOutline = [
          {
            left: x - width / 2 - padding / 2,
            right: x + width / 2 + padding / 2
          }
        ]

        return rootLevelOutline.concat(outlineBelowRoot);
      }
    },
    {
      name: 'childNodes',
      factory: function () { return []; }
    },
    {
      name: 'x',
      documentation: `
        The x value of a node's position relative to their parent
      `,
      expression: function(neighborX, centerX) {
        return neighborX + centerX;
      }
    },
    {
      class: 'Float',
      name: 'neighborX',
      documentation: `
        The relative position of the current node's right neighbor
      `
    },
    {
      class: 'Float',
      name: 'centerX',
      documentation: `
        The adjustment to the current node's x to properly
        center the current node above their children
      `
    },
    {
      class: 'Boolean',
      name: 'expanded',
      expression: function(isAutoExpandedByDefault, childNodesForAutoExpansion, childNodes) {
        if ( isAutoExpandedByDefault ) {
          return childNodes < childNodesForAutoExpansion;
        }
        return false;
      },
      postSet: function() {
        this.graph.doLayout();
      }
    }
  ],

  methods: [
    function initCView() {
      this.SUPER();

      this.formatNode();

      if (this.relationship) {
        this.data[this.relationship.forwardName].select(childData => {
          this.addChildNode({ 
            data: childData,
            width: this.width,
            height: this.height,
            padding: this.padding,
            lineWidth: this.lineWidth
          });
        });
      }

      this.canvas.on('click', (e) => {
        var p = this.parent;

        while ( this.cls_.isInstance(p) ) {
          if ( ! p.expanded ) return;
          p = p.parent;
        }

        var point = this.globalToLocalCoordinates({
          w: 1,
          x: e.offsetX,
          y: e.offsetY,
        });

        /**
         * need to adjust the x-value to the middle of the node and not the far left edge
         * so that the pointer click registers correctly when clicking any part of the node
         */
        point.x += this.width / 2;

        if ( this.hitTest(point) ) {
          this.expanded = ! this.expanded;
        }
      });
    },

    function paint(x) {
      if ( ! this.parentNode || this.parentNode.expanded ) this.SUPER(x);
    },

    function paintSelf(x) {
      x.save();

      x.translate(-this.width / 2, 0);
      this.SUPER(x);

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

      // Paint lines to childNodes
      x.lineWidth = this.lineWidth;
      x.strokeStyle = this.border;

      if (this.expanded && this.childNodes.length) {
        var h = this.childNodes[0].y * 3 / 4;
        var l = this.childNodes.length;

        line(0, this.height, 0, h);
        for (var i = 0; i < l; i++) {
          var c = this.childNodes[i];
          line(0, h, c.x, h);
          line(c.x, h, c.x, c.y);
        }
      }

      // Paint expand/collapse arrow
      x.lineWidth = this.borderWidth;
      
      if (this.childNodes.length) {
        var d = this.expanded ? 5 : -5;
        var y = this.height - 8;
        line(-5, y, 0, y + d);
        line(0, y + d, 5, y);
      }
    },

    function addChildNode(args) {
      var node = this.cls_.create(args, this);
      node.y = this.height * 2;
      this.add(node);
      this.childNodes = this.childNodes.concat(node);
      node.outline$.sub(() => {
        /**
         * Here we are forcing a recalculation of the outline b/c there is no way to subscribe
         * to all children outlines via an expression since outline is an array
         */
        this.outline = [];
        this.outline = undefined
      });
      return this;
    },

    function distanceTo(node) {
      minLevels = Math.min(this.outline.length, node.outline.length);

      var minDistance = Number.MAX_SAFE_INTEGER;
      for (var i = 0; i < minLevels; i++) {
        var overlapDistance = node.outline[i].left - this.outline[i].right;

        minDistance = Math.min(minDistance, overlapDistance);
      }
      return minDistance;
    },

    /**
     * We need to first ensure that there are no overlaps between subtrees
     * and then we can take care of subtrees being too far apart because
     * otherwise they will conflict with eachother and go into an infinite loop
     * since nodes can have be a positive distance away from each other and be properly spaced (i.e. higher levels in the tree)
     * whereas nodes cannot be a negative distance since that means an overlap has occured
     * once the above is done we can finally center the nodes
     */
    function layout() {
      var moved = false;

      for ( var i = 0; i < this.childNodes.length; i++ ) {
        var n1 = this.childNodes[i];

        for ( var j = i + 1; j < this.childNodes.length; j++ ){
          var n2 = this.childNodes[j];

          var distance = n1.distanceTo(n2);

          if ( distance < 0 ) {
            n2.neighborX -= distance;
            moved = true;
          }
        }
      }

      for ( var i = 0; i < this.childNodes.length - 1; i++ ) {
        var n1 = this.childNodes[i];
        var n2 = this.childNodes[i + 1];

        var distance = n1.distanceTo(n2);

        if ( distance > 0 ) {
          for ( var j = 0; j < i; j++ ) {
            var n3 = this.childNodes[j];
            distance = Math.min(distance, n3.distanceTo(n2));
          }
          if ( distance ) {
            n2.neighborX -= distance;
            moved = true;
          }
        }
      }

      for ( var i = 0; i < this.childNodes.length; i++ ){
        if ( this.childNodes[i].layout() ) moved = true;
      }

      if ( this.outline[1] ) {
        var rootLevelWidth = this.outline[0].right - this.outline[0].left;
        var childLevelWidth = this.outline[1].right - this.outline[1].left;
        var d = - (childLevelWidth - rootLevelWidth) / 2;
        this.childNodes.forEach(c => {
          if ( c.centerX != d ) {
            c.centerX = d;
            moved = true;
          }
        })
      }
      return moved;
    },

    function findNode(id){
      if (this.data.id === id) {
        return this;
      }

      for (var i = 0; i < this.childNodes.length; i++) {
        var foundNode = this.childNodes[i].findNode(id);
        if (foundNode) {
          return foundNode;
        }
      }
    }
  ]
})
