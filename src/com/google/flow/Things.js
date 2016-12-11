/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'com.google.flow',
  name: 'Clock',
  extends: 'com.google.foam.demos.clock.Clock',
  implements: [ 'foam.physics.Physical' ],
  properties: [
    [ 'gravity', 1 ],
    [ 'radius', 45 ],
    [ 'width',  90 ],
    [ 'height', 90 ]
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'Text',
  extends: 'foam.graphics.Label',
  implements: [ 'foam.physics.Physical' ],
  properties: [
    [ 'gravity', 1 ],
    [ 'width',   150 ],
    [ 'height',  50 ],
    [ 'text',    'Text' ],
    [ 'color',   '#000000' ],
    [ 'font',    '50px Arial' ]
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'Circle',
  extends: 'foam.graphics.Circle',
  implements: [ 'foam.physics.Physical' ],
  properties: [
    [ 'arcWidth', 1 ],
    [ 'gravity',  1 ],
    [ 'radius',   25 ],
    [ 'friction', 0.98 ]
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'Ellipse',
  extends: 'foam.graphics.Ellipse',
  implements: [ 'foam.physics.Physical' ],
  properties: [
    [ 'border',   1 ],
    [ 'gravity',  1 ],
    [ 'radiusX',  25 ],
    [ 'radiusY',  25 ],
    [ 'friction', 0.98 ]
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'Box',
  extends: 'foam.graphics.Box',
  implements: [ 'foam.physics.Physical' ],
  properties: [
    [ 'width',  50 ],
    [ 'height', 50 ]
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'Desk',
  extends: 'foam.graphics.CView',

  properties: [
    {
      name: 'desk',
      hidden: true,
      factory: function() { return foam.graphics.Box.create({x:0, y:0, width:28, height:14, color:'gray'}); }
    },
    {
      name: 'cabinet',
      hidden: true,
      factory: function() { return foam.graphics.Box.create({x:29, y:0, width:9, height:12, color: 'white'}); }
    },
    {
      name: 'person',
      hidden: true,
      factory: function() { return foam.graphics.Circle.create({x:14, y:21, radius:3, border: null, color:'blue'}); }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.add(this.desk, this.person, this.cabinet);
      this.width  = this.desk.width + this.cabinet.width + 2;
      this.height = this.desk.height * 2.75;
    }
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'DuplexDesk',
  extends: 'foam.graphics.CView',

  requires: [ 'com.google.flow.Desk' ],

  properties: [
    {
      name: 'desk1',
      hidden: true,
      factory: function() { return this.Desk.create({}); }
    },
    {
      name: 'desk2',
      hidden: true,
      factory: function() { return this.Desk.create({}); }
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      this.desk1.y = this.desk2.y = this.desk1.height;
      this.desk1.scaleY = -1;
      this.width = this.desk1.width;
      this.height = this.desk1.height * 2;
      this.add(this.desk1, this.desk2);
    }
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'Desks',
  extends: 'foam.graphics.Box',

  properties: [
    {
      class: 'Class',
      name: 'of',
      value: 'com.google.flow.DuplexDesk'
//      hidden: true
    },
    {
      class: 'Boolean',
      name: 'feedback_',
      hidden: true
    },
    [ 'border', null ],
    { name: 'cellWidth',  hidden: true },
    { name: 'cellHeight', hidden: true },
    { class: 'Int', name: 'rows',    postSet: function(o, n) { if ( this.feedback_ ) return o; this.feedback_ = true; this.height  = this.cellHeight * n; this.feedback_ = false; return n;  } },
    { class: 'Int', name: 'columns', postSet: function(o, n) { if ( this.feedback_ ) return o; this.feedback_ = true; this.width   = this.cellWidth * n; this.feedback_ = false; return n;  } },
    { name: 'width',   postSet: function(o, n) { if ( this.feedback_ ) return o; this.feedback_ = true; this.columns = Math.floor(n/this.cellWidth); this.feedback_ = false; return n;  } },
    { name: 'height',  postSet: function(o, n) { if ( this.feedback_ ) return o; this.feedback_ = true; this.rows    = Math.floor(n/this.cellHeight); this.feedback_ = false; return n;  } }
  ],

  methods: [
    function init() {
      this.SUPER();

      this.updateCellSize();
      this.rows = this.columns = 2;

      this.onResize();
      this.propertyChange.sub('of',     this.onResize);
      this.propertyChange.sub('width',  this.onResize);
      this.propertyChange.sub('height', this.onResize);
    },

    function updateCellSize() {
      var o = this.of.create();
      this.cellWidth  = o.width;
      this.cellHeight = o.height;
    }
  ],

  listeners: [
    {
      name: 'onResize',
      isFramed: true,
      code: function() {
        this.children.
            filter(function(c) { return ! com.google.flow.Halo.isInstance(c); }).
            forEach(this.remove.bind(this));

        this.updateCellSize();
        this.width  = this.width;
        this.height = this.height;
        var w = this.cellWidth, h = this.cellHeight;

        for ( var i = 0 ; i < this.rows ; i++ ) {
          for ( var j = 0 ; j < this.columns ; j++ ) {
            var o = this.of.create(null, this.__subContext__);
            o.x = w  * j;
            o.y = h * i;
            this.add(o);
          }
        }
      }
    }
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'Mushroom',
  extends: 'foam.graphics.Circle',

  implements: [ 'foam.physics.Physical' ],

  requires: [ 'foam.graphics.Box' ],

  properties: [
    [ 'mass', foam.physics.Physical.INFINITE_MASS ],
    [ 'border', null ],
    [ 'color', 'red' ],
    [ 'start',  Math.PI ],
    [ 'radius', 20 ],
    [ 'width', 42 ],
    [ 'height', 45 ],
    { name: 'stem', hidden: true/*, view: 'foam.u2.DetailView'*/ }
  ],

  methods: [
    function init() {
      this.SUPER();

      this.gravity = 0;

      this.add(this.stem = this.Box.create({
        x: -7.5,
        y: -0.5,
        width: 15,
        height: 20,
        color: 'gray',
        border: null
      }));
    }
  ],

  actions: [
    function explode() {
      this.stem.color = 'red';
      // Movement.animate(200, function() {
      //   this.scaleX = this.scaleY = 30;
      //   this.alpha = 0;
      //   this.a = Math.PI * 1.5;
      //   this.stem.alpha = 0;
      // }.bind(this)/*, function() { this.table.removeChild(o2); }.bind(this)*/)();
    }
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'Cursor',
  extends: 'foam.graphics.CView',

  properties: [
    {
      class: 'Float',
      name: 'lineWidth',
      view: { class: 'foam.u2.RangeView', minValue: 0, maxValue: 5, step: 1, onKey: true },
      value: 1
    },
    { name: 'width',  value: 0, hidden: true },
    { name: 'height', value: 0, hidden: true },
    [ 'color', 'red' ],
    [ 'alpha', 0.5 ],
    {
      name: 'x'
    },
    {
      name: 'y'
    }
  ],

  methods: [
    function initCView() {
      this.SUPER();
      this.canvas.on('mousemove', this.onMouseMove);
    },

    function hitTest(p) { return false; },

    function paintSelf(x) {
      if ( ! this.color || ! this.lineWidth ) return;

      x.strokeStyle = this.color;
      x.lineWidth   = this.lineWidth;

      // Draw the lines longer than needed in case the
      // cursor is rotated.
      x.beginPath();
      x.moveTo(-this.parent.width*2, 0);
      x.lineTo(this.parent.width*2, 0);
      x.stroke();

      x.beginPath();
      x.moveTo(0, -this.parent.height*2);
      x.lineTo(0, this.parent.height*2);
      x.stroke();
    },
  ],

  listeners: [
    {
      name: 'onMouseMove',
      code: function(evt) {
        this.x = evt.offsetX;
        this.y = evt.offsetY;
      }
    }
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'Gate',
  extends: 'foam.graphics.Box',

  implements: [ 'foam.physics.Physical' ],

  requires: [
    'foam.graphics.Circle',
    'foam.graphics.Label'
  ],

  properties: [
    {
      class: 'Int',
      name: 'count'
    },
    {
      class: 'Int',
      hidden: true,
      name: 'lastCollision_',
    },
    {
      name: 'width',
      value: 2,
      hidden: true,
      preSet: function() { return 1; }
    },
    {
      name: 'height',
      value: 50
    },
    [ 'mass', 0 ],
    [ 'gravity', 0 ],
    {
      name: 'border',
      vale: '#444444',
      hidden: true
    },
    {
      name: 'circle',
      hidden: true,
      factory: function() {
        return this.Circle.create({
          alpha: 0.8,
          border: null,
          color: 'green',
          radius: 10,
          scaleX: 1.5,
          scaleY: 1.5
        });
      }
    },
    {
      name: 'text',
      hidden: true,
      factory: function() {
        return this.Label.create({
          align: 'center',
          color: 'white',
          font: 'bold 10px sans-serif',
          text$: this.count$.map(function(c) { return c ? c : ''; }),
          y:     -6
        });
      }
    },
    {
      name: 'collisionSet_',
      hidden: true
    },
    {
      name: 'lastCollisionSet_',
      hidden: true
    },
  ],

  methods: [
    function init() {
      this.add(this.circle);
      this.circle.add(this.text);
      this.collisionSet_ = {};
      this.lastCollisionSet_ = {};
    },

    function collideWith(c) {
      this.lastCollision_ = Date.now();
      var id = c.$UID;
      if ( ! this.collisionSet_[id] && ! this.lastCollisionSet_[id] ) this.count++;
      this.collisionSet_[id] = true;
    },

    function paint(x) {
      this.lastCollisionSet_ = this.collisionSet_;
      this.collisionSet_ = {};

      if ( Date.now() - this.lastCollision_ > 250 ) {
        this.border = this.BORDER.value;
      } else {
        this.border = 'orange';
      }

      this.originX  = this.width/2;
      this.originY  = this.height/2;
      this.circle.x = this.width/2;
      this.circle.y = this.height/2;
      this.circle.rotation = - this.rotation;
      this.SUPER(x);
    }
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'Strut',
  extends: 'foam.graphics.CView',

  imports: [
    'scope',
    'timer'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'visible',
      value: true
    },
    {
      class: 'String',
      name: 'head'
    },
    {
      class: 'String',
      name: 'tail'
    },
    {
      class: 'Float',
      name: 'length',
      value: 100
    },
    [ 'color', 'black' ]
  ],

  methods: [
    function init() {
      this.SUPER();
      this.onDestroy(this.timer.time$.sub(this.tick));
      this.propertyChange.sub(this.tick);
    },

    function paintSelf(x) {
      if ( ! this.visible ) return;

      this.x = this.y = 0;

      var c1 = this.scope[this.head];
      var c2 = this.scope[this.tail];

      if ( ! c1 || ! c2 ) return;

      x.strokeStyle = this.color;
      x.lineWidth   = 1

      x.beginPath();
      x.moveTo((c1.left_ + c1.right_)/2, (c1.top_ + c1.bottom_)/2);
      x.lineTo((c2.left_ + c2.right_)/2, (c2.top_ + c2.bottom_)/2);
      x.stroke();
    }
  ],

  listeners: [
    function tick() {
      var c1 = this.scope[this.head];
      var c2 = this.scope[this.tail];
      if ( ! c1 || ! c2 ) return;

      var l = this.length;
      var d = c1.distanceTo(c2);

      // TODO: should take into account their relative masses.
      // TODO: should move both objects.
      var lx = c1.x - c2.x;
      var ly = c1.y - c2.y;
      var m = Math.sqrt(Math.pow(l, 2) / (Math.pow(lx, 2) + Math.pow(ly, 2)));
      c2.x = c1.x - (lx * m);
      c2.y = c1.y - (ly * m);
    }
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'Spring',
  extends: 'foam.graphics.CView',

  imports: [
    'scope',
    'physics'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'visible',
      value: true
    },
    {
      class: 'String',
      name: 'head'
    },
    {
      class: 'String',
      name: 'tail'
    },
    {
      class: 'Float',
      name: 'length',
      value: 80
    },
    {
      class: 'Float',
      name: 'springWidth',
      value: 4
    },
    {
      class: 'Float',
      precision: 2,
      name: 'stretch',
      units: '%'
    },
    {
      class: 'Float',
      name: 'compressionStrength',
      value: 1
    },
    {
      class: 'Float',
      name: 'stretchStrength',
      value: 4
    },
    [ 'color', 'black' ]
  ],

  methods: [
    function init() {
      this.SUPER();
      this.onDestroy(this.physics.onTick.sub(this.tick));
      this.propertyChange.sub(this.tick);
    },

    function paintSelf(x) {
      if ( ! this.visible ) return;

      this.x = this.y = 0;

      var c1 = this.scope[this.head];
      var c2 = this.scope[this.tail];

      if ( ! c1 || ! c2 ) return;

      x.strokeStyle = this.color;
      x.lineWidth = this.springWidth * Math.min(2, 100 / this.stretch);
        this.springWidth

      x.beginPath();
      x.moveTo((c1.left_ + c1.right_)/2, (c1.top_ + c1.bottom_)/2);
      x.lineTo((c2.left_ + c2.right_)/2, (c2.top_ + c2.bottom_)/2);
      x.stroke();
    }
  ],

  listeners: [
    function tick() {
      var c1 = this.scope[this.head];
      var c2 = this.scope[this.tail];
      if ( ! c1 || ! c2 ) return;

      var l = this.length;
      var s = this.stretchStrength/1000;
      var c = this.compressionStrength/1000;
      var d = c1.distanceTo(c2);
      var a = Math.atan2(
          (c2.top_  + c2.bottom_ - c1.top_  - c1.bottom_)/2,
          (c2.left_ + c2.right_  - c1.left_ - c1.right_)/2);

      this.stretch = d/this.length*100;

      if ( s && d > l ) {
        c1.applyMomentum( s * (d-l), a);
        c2.applyMomentum(-s * (d-l), a);
      } else if ( c && d < l ) {
        c1.applyMomentum(-c * (l-d), a);
        c2.applyMomentum( c * (l-d), a);
      }
    }
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'Script',

  imports: [
    'data',
    'scope'
  ],

  properties: [
    {
      class: 'String',
      name: 'code',
      view: { class: 'foam.u2.tag.TextArea', rows: 16 },
      displayWidth: 60
    },
    {
      class: 'String',
      name: 'output',
      transient: true,
      view: { class: 'foam.u2.tag.TextArea', rows: 16 },
      displayWidth: 60
    }
  ],

  methods: [
    function log() {
      this.output += Array.from(arguments).join(' ') + '\n';
    }
  ],

  actions: [
    function run() {
      with ( this.scope ) {
        with ( { log: this.log.bind(this) } ) {
          this.log('>', this.code);
          this.log(eval('(function() {' + this.code + '})').call(this.data));
        }
      }
    },

    function clearOutput() {
      this.output = '';
    }
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'Turtle',
  extends: 'foam.graphics.Ellipse',

  implements: [ 'foam.physics.Physical' ],

  requires: [ 'foam.graphics.Line', 'foam.graphics.CView' ],

  // TODO: better to just add to parent and have listeners
  // then add to physics or other interested parties
  imports: [ 'addProperty' ],

  properties: [
    [ 'radiusX', 8 ],
    [ 'radiusY', 12 ],
    [ 'color', 'green' ],
    {
      class: 'Color',
      name: 'penColor',
      value: '#000000'
    },
    {
      class: 'Float',
      name: 'penWidth',
      value: '1'
    },
    {
      class: 'Boolean',
      name: 'penDown',
      value: true
    },
    {
      name: 'memento',
      hidden: true,
      getter: function() {
        return {
          x: this.x,
          y: this.y,
          penColor: this.penColor,
          penWidth: this.penWidth,
          penDown:  this.pendDown,
          rotation: this.rotation
        };
      },
      setter: function(m) {
        this.copyFrom(m);
      }
    },
    {
      name: 'mementoStack_',
      hidden: true,
      factory: function() { return []; }
    },
    {
      name: 'childLayer',
      hidden: true,
      factory: function() {
        var l = this.CView.create();
        this.parent.add(l);
        return l;
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();

      var leg1     = com.google.flow.Ellipse.create({border:"1",color:"green",radiusY:5,radiusX:5,x:11,y:1});
      var leg2     = com.google.flow.Ellipse.create({border:"1",color:"green",radiusY:5,radiusX:5,x:10,y:16});
      var leg3     = com.google.flow.Ellipse.create({border:"1",color:"green",radiusY:5,radiusX:5,x:-4,y:17});
      var leg4     = com.google.flow.Ellipse.create({border:"1",color:"green",radiusY:5,radiusX:5,x:-5,y:2});
      var head     = com.google.flow.Ellipse.create({border:"1",color:"green",radiusY:6,radiusX:4,x:4,y:-10});
      var leftEye  = com.google.flow.Ellipse.create({border:"",color:"red",radiusY:2,radiusX:2,x:-0.5,y:1});
      var rightEye = com.google.flow.Ellipse.create({border:"",color:"red",radiusY:2,radiusX:2,x:4,y:1});
      var shell    = com.google.flow.Ellipse.create({border:"#000000",color:"green",radiusY:12,radiusX:8,x:0,y:1});
      var tail     = com.google.flow.Ellipse.create({border:"",color:"green",radiusY:6,radiusX:4,x:7.5,y:19,start:1.7,end:4.6});

      head.add(leftEye, rightEye);
      this.add(leg1, leg2, leg3, leg4, head, shell, tail);
    },

    function home() {
      this.x = this.parent.width / 2;
      this.y = this.parent.height / 2;
      this.rotation = 0;

      return this;
    },

    function ss() {
      this.mementoStack_.push(this.memento);
      return this;
    },

    function rs() {
      this.memento = this.mementoStack_.pop();
      return this;
    },

    function pc(color) {
      /* Pen Color */
      this.penColor = color;
      return this;
    },

    function pw(w) {
      /* Pen Width */
      this.penWidth = w;
      return this;
    },

    function pu() {
      /* Pen Up */
      this.penDown = false;
      return this;
    },

    function pd() {
      /* Pen Down */
      this.penDown = true;
      return this;
    },

    function repeat(n, fn) {
      for ( var i = 1 ; i <= n ; i++ ) fn.call(this, i);
      return this;
    },

    function fd(d) {
      /* ForwarD */
      return this.gt(
          this.x + d * Math.cos(this.rotation+Math.PI/2),
          this.y - d * Math.sin(this.rotation+Math.PI/2));
    },

    function gt(x, y) {
      /* Go To */
      var x1 = this.x, y1 = this.y;
      this.x = x;
      this.y = y;

      if ( this.penDown ) {
        // this.addProperty(this.Line.create({
        this.childLayer.add(this.Line.create({
          startX:    x1+this.radiusX,
          startY:    y1+this.radiusY,
          endX:      this.x+this.radiusX,
          endY:      this.y+this.radiusY,
          color:     this.penColor,
          lineWidth: this.penWidth
        }));
      }

      return this;
    },

    function bk(d) {
      /* BacK */
      return this.fd(-d);
    },

    function lt(a) {
      /* Left Turn */
      this.rotation += Math.PI*2*a/360;
      return this;
    },

    function rt(a) {
      /* Right Turn */
      return this.lt(-a);
    },

    function st() {
      /* Show Turtle */
      this.alpha = 1;
      var p = this.parent;
      p.remove(this);
      p.add(this);
      return this;
    },

    function ht() {
      /* Hide Turtle */
      this.alpha = 0;
      return this;
    },

    function lay(obj) {
      obj.x = this.x;
      obj.y = this.y;
      this.addProperty(obj);
      return this;
    },

    function spawn() {
//      var child = this.clone();
      var child = this.cls_.create({
        x: this.x,
        y: this.y,
        penColor: this.penColor,
        penWidth: this.penWidth,
        penDown: this.pendDown,
        rotation: this.rotation
      }, this.__context__);
      this.parent.add(child);
      return child;
    },

    function die() {
      this.parent && this.parent.remove(this);
    },

    function cs() {
      this.childLayer.removeAllChildren();
      return this;
    }
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'Line3D',
  extends: 'foam.graphics.Line',

  properties: [
    { class: 'Float',  name: 'startZ' },
    { class: 'Float',  name: 'endZ' }
  ],

  methods: [
    function xyzToX(x, y, z) {
      return this.parent.parent.width/2 - x + y;
    },

    function xyzToY(x, y, z) {
      return this.parent.parent.height/2 + x + y - z * Math.SQRT2;
    },

    function paintSelf(x) {
      x.beginPath();

      x.moveTo(
          this.xyzToX(this.startX, this.startY, this.startZ),
          this.xyzToY(this.startX, this.startY, this.startZ));

//      console.log('start: ', this.startX, this.startY, this.startZ,
//          this.xyzToX(this.startX, this.startY, this.startZ),
//          this.xyzToY(this.startX, this.startY, this.startZ));

      x.lineTo(
          this.xyzToX(this.endX, this.endY, this.endZ),
          this.xyzToY(this.endX, this.endY, this.endZ));

//     console.log('end: ', this.startX, this.startY, this.startZ,
//          this.xyzToX(this.endX, this.endY, this.endZ),
//          this.xyzToY(this.endX, this.endY, this.endZ));

      x.lineWidth = this.lineWidth;
      x.strokeStyle = this.color;
      x.stroke();
    }
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'Turtle3D',
  extends: 'com.google.flow.Turtle',

  requires: [
    'com.google.flow.Line3D'
  ],

  properties: [
    {
      class: 'Float',
      name: 'z'
    },
    {
      class: 'Float',
      name: 'pitch'
    },
    {
      name: 'memento',
      hidden: true,
      getter: function() {
        return {
          x: this.x,
          y: this.y,
          z: this.z,
          pitch: this.pitch,
          roll: this.roll,
          rotation: this.rotation,
          penColor: this.penColor,
          penWidth: this.penWidth,
          penDown:  this.pendDown
        };
      },
      setter: function(m) {
        this.copyFrom(m);
      }
    },
    {
      class: 'Float',
      name: 'roll'
    }
  ],

  methods: [
    function pitchUp(a) {
      this.pitch += Math.PI * a / 180;
      return this;
    },

    function pitchDown(a) {
      return this.pitchUp(-a);
    },

    function rollRight(a) {
      this.roll += Math.PI * a / 180;
      return this;
    },

    function rollLeft(a) {
      return this.rollRight(-a);
    },

    function fd(d) {
      /* ForwarD */
      var v = d * Math.sin(this.pitch);
      var h = d * Math.cos(this.pitch);

      return this.gt(
          this.x + h * Math.cos(this.rotation+Math.PI/2),
          this.y - h * Math.sin(this.rotation+Math.PI/2),
          this.z + v);
    },

    function up(d) {
      var v = d * Math.sin(this.pitch);
      var h = d * Math.cos(this.pitch);

      return this.gt(
          this.x + h * Math.cos(this.rotation+Math.PI/2),
          this.y - h * Math.sin(this.rotation+Math.PI/2),
          this.z + v);
    },

    function down(d) {
      return this.up(-d);
    },

    function gt(x, y, z) {
      /* Go To */
      var x1 = this.x, y1 = this.y, z1 = this.z;
      this.x = x;
      this.y = y;
      this.z = z;

      if ( this.penDown ) {
        // this.addProperty(this.Line.create({
        this.childLayer.add(this.Line3D.create({
          startX:    x1+this.radiusX,
          startY:    y1+this.radiusY,
          startZ:    z1,
          endX:      this.x+this.radiusX,
          endY:      this.y+this.radiusY,
          endZ:      this.z,
          color:     this.penColor,
          lineWidth: this.penWidth
        }));
      }

      return this;
    }
  ]
});

// foam.json.stringify(flow.memento.map(function(o) { var v = o.value; var r = {name: o.name, factory: 'function() { return ' + v.cls_.id + '.create(' + foam.json.stringify(v.instance_) + ')}'};  return r;})).replace(/\"/g,"'").replace(/\\/g,'');

// flow.memento.map(function(o) { return 'var ' + o.name + ' = ' + o.value.cls_.id + '.create(' + foam.json.stringify(o.value.instance_) + '); ' + o.parent + '.add(' + o.name+ ');'; }).join('\n');
