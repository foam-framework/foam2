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
    'nodeHeight',
    'nodeWidth',
    'padding',
    'parentNode?',
    'relationship'
  ],
  exports: ['as parentNode'],

  properties: [
    'data',
    {
      name: 'outline',
      expression: function (x, nodeWidth, expanded, childNodes, padding) {
        var nodeLeftEdgePadded = x - nodeWidth / 2 - padding / 2;
        var nodeRightEdgePadded = x + nodeWidth / 2 + padding / 2;
        var rootLevelOutline = [
          {
            left: nodeLeftEdgePadded,
            right: nodeRightEdgePadded
          }
        ];

        var champion = [];

        for (let i = 0; i < childNodes.length && expanded; i++) {
          // get child outline
          // transform all rows
          // merge levels into childoutlines
          var childOutline = childNodes[i].outline.map(o => ({
            left: o.left + x,
            right: o.right + x,
          }));

          for (var j = 0; j < childOutline.length; j++) {
            champion[j] = champion[j] || {
              left: Number.MAX_SAFE_INTEGER,
              right: Number.MIN_SAFE_INTEGER
            };
            champion[j].left = Math.min(childOutline[j].left, champion[j].left);
            champion[j].right = Math.max(childOutline[j].right, champion[j].right);
          }
        }

        var totalOutline = rootLevelOutline.concat(champion);

        return totalOutline;
      }
    },
    { name: 'height', factory: function () { return this.nodeHeight; } },
    { name: 'width', factory: function () { return this.nodeWidth; } },
    ['border', 'gray'],
    {
      name: 'childNodes',
      factory: function () { return []; }
    },
    ['left', 0],
    ['right', 0],
    ['maxLeft', 0],
    ['maxRight', 0],
    {
      name: 'x',
      expression: function(neighborX, centerX) {
        return neighborX + centerX;
      },
      postSet: function() {
        this.neighborX = 0;
        this.centerX = 0;
        this.x = undefined;
      }
    },
    {
      class: 'Float',
      name: 'neighborX'
    },
    {
      class: 'Float',
      name: 'centerX'
    },
    {
      class: 'Boolean',
      name: 'expanded',
      expression: function(childNodes) {
        return childNodes.length < 5;
      },
      postSet: function() {
        this.graph.doLayout();
      }
    },
    ['color', 'white']
  ],

  methods: [
    function initCView() {
      this.SUPER();

      this.formatNode();

      if (this.relationship) {
        var data = this.data.clone(this.__subContext__);
        try {
          data[this.relationship.forwardName].select(data => {
            this.addChildNode({ data: data });
          });
        } catch (x) { }
        this.graph.doLayout();
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
        point.x += this.width / 2;

        var hit = this.hitTest(point)
        if ( hit ) {
          this.expanded = ! this.expanded;
        }
      });
    },

    function paint(x) {
      if (!this.parentNode || this.parentNode.expanded) this.SUPER(x);
    },

    function paintSelf(x) {
      x.save();

      x.translate(-this.width / 2, 0);
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

      x.lineWidth = 0.5; //this.borderWidth;
      x.strokeStyle = this.border;

      // Paint lines to childNodes
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

      x.lineWidth = this.borderWidth;
      // Paint expand/collapse arrow
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
        this.outline = [];
        this.outline = undefined
      });
      return this;
    },

    function distanceTo(node) {
      var outlineA = this.outline;
      var outlineB = node.outline;
      minLevels = Math.min(outlineA.length, outlineB.length);

      var champion = Number.MAX_SAFE_INTEGER;
      for (var i = 0; i < minLevels; i++) {
        // we only need to check if the right of outlineA overlaps with the left of outlineB
        var overlapDistance = outlineB[i].left - outlineA[i].right;

        champion = Math.min(champion, overlapDistance);
      }
      return champion;
    },

    function layout() {
      const { childNodes } = this;
      var moved = false;

      for ( var i = 0; i < childNodes.length; i++ ) {
        var n1 = childNodes[i];

        for ( var j = i + 1; j < childNodes.length; j++ ){
          var n2 = childNodes[j];

          var distance = n1.distanceTo(n2);

          if ( distance < 0 ) {
            n2.neighborX -= distance;
            moved = true;
          }
        }
      }

      for ( var i = 0; i < childNodes.length - 1; i++ ) {
        var n1 = childNodes[i];
        var n2 = childNodes[i + 1];

        var distance = n1.distanceTo(n2);

        if ( distance > 0 ) {
          for ( var j = 0; j < i; j++ ) {
            var n3 = childNodes[j];
            distance = Math.min(distance, n3.distanceTo(n2));
          }
          if ( distance ) {
            n2.neighborX -= distance;
            moved = true;
          }
        }
      }

      for ( var i = 0; i < childNodes.length; i++ ){
        if ( childNodes[i].layout() ) moved = true;
      }

      if ( this.outline[1] ) {
        var rw = this.outline[0].right - this.outline[0].left;
        var cw = this.outline[1].right - this.outline[1].left;
        var d = - (cw - rw) / 2;
        childNodes.forEach(c => {
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

      var childNodes = this.childNodes;
      for (var i = 0; i < childNodes.length; i++) {
        var foundNode = childNodes[i].findNode(id);
        if (foundNode) {
          return foundNode;
        }
      }
    }
  ]
})