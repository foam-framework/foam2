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
        var rootLevelOutline = [
          {
            left: x - nodeWidth / 2 - padding / 2,
            right: x + nodeWidth / 2 + padding / 2
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
      minLevels = Math.min(this.outline.length, node.outline.length);

      var minDistance = Number.MAX_SAFE_INTEGER;
      for (var i = 0; i < minLevels; i++) {
        var overlapDistance = node.outline[i].left - this.outline[i].right;

        minDistance = Math.min(minDistance, overlapDistance);
      }
      return minDistance;
    },

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
        var rw = this.outline[0].right - this.outline[0].left;
        var cw = this.outline[1].right - this.outline[1].left;
        var d = - (cw - rw) / 2;
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
