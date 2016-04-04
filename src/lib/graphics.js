/*
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
  package: 'foam.graphics',
  name: 'Matrix',

  properties: [
    {
      name: 'a',
      class: 'Simple'
    },
    {
      name: 'b',
      class: 'Simple'
    },
    {
      name: 'c',
      class: 'Simple'
    },
    {
      name: 'd',
      class: 'Simple'
    },
    {
      name: 'e',
      class: 'Simple'
    },
    {
      name: 'f',
      class: 'Simple'
    },
    {
      name: 'g',
      class: 'Simple'
    },
    {
      name: 'h',
      class: 'Simple'
    },
    {
      name: 'i',
      class: 'Simple'
    }
  ],

  methods: [
    function initArgs() {
      this.a = 1; this.b = 0; this.c = 0;
      this.d = 0; this.e = 1; this.f = 0;
      this.g = 0; this.h = 0; this.i = 1;
    },

    function mul(m) {
      var a = this.a, b = this.b, c = this.c,
          d = this.d, e = this.e, f = this.f,
          g = this.g, h = this.h, i = this.i;

      this.a = a * m.a + b * m.d + c * m.g;
      this.b = a * m.b + b * m.e + c * m.h;
      this.c = a * m.c + b * m.f + c * m.i;

      this.d = d * m.a + e * m.d + f * m.g;
      this.e = d * m.b + e * m.e + f * m.h;
      this.f = d * m.c + e * m.f + f * m.i;

      this.g = g * m.a + h * m.d + i * m.g;
      this.h = g * m.b + h * m.e + i * m.h;
      this.i = g * m.c + h * m.f + i * m.i;

      return this;
    },

    function invert() {
      // a b c    a d g
      // d e f -> b e h
      // g h i    c f i
      var tmp = this.b;
      this.b = this.d;
      this.d = tmp;

      tmp = this.c;
      this.c = this.g;
      this.g = tmp;

      tmp = this.f;
      this.f = this.h;
      this.h = tmp;
      return this;
    }
  ]
});


// TODO: Perhaps these methods should be moved to matrix.
foam.CLASS({
  package: 'foam.graphics',
  name: 'Transform',

  requires: [
    'foam.graphics.Matrix'
  ],

  properties: [
    {
      name: 'matrix',
      factory: function() {
        return this.Matrix.create();
      },
    },
    {
      name: 'm2',
      factory: function() {
        return this.Matrix.create();
      }
    }
  ],

  methods: [
    function reset() {
      this.matrix.initArgs();
      return this;
    },

    function affine(m) {
      this.matrix.mul(m);
      return this;
    },

    function translate(dx, dy) {
      if ( ! dx && ! dy ) return;
      //      var m = this.Matrix.create()
      var m = this.m2;
      m.a = 1; m.b = 0; m.c = dx;
      m.d = 0; m.e = 1; m.f = dy;
      m.g = 0; m.h = 0; m.i = 1;
      this.matrix.mul(m);
    },

    function skew(x, y) {
      if ( ! x && ! y ) return;
      //      var m = this.Matrix.create();
      var m = this.m2;
      m.a = 1; m.b = x; m.c = 0;
      m.d = y; m.e = 1; m.f = 0;
      m.g = 0; m.h = 0; m.i = 1;
      this.matrix.mul(m);
    },

    function scale(x, y) {
      if ( x === 1 && y === 1 ) return;
      //      var m = this.Matrix.create();
      var m = this.m2;
      m.a = x; m.b = 0; m.c = 0;
      m.d = 0; m.e = y; m.f = 0;
      m.g = 0; m.h = 0; m.i = 1;
      this.matrix.mul(m);
    },

    function rotate(a) {
      if ( ! a ) return;
      //      var m = this.Matrix.create();
      var m = this.m2;
      m.a = Math.cos(a);  m.b = Math.sin(a); m.c = 0;
      m.d = -Math.sin(a); m.e = Math.cos(a); m.f = 0;
      m.g = 0;            m.h = 0;           m.i = 1;
      this.matrix.mul(m);
    }
  ]
});


foam.CLASS({
  package: 'foam.graphics',
  name: 'CView',

  requires: [
    'foam.graphics.Canvas',
    'foam.graphics.Transform'
  ],

  topics: [ 'invalidated' ],

  properties: [
    {
      name: 'rotation',
      class: 'Float'
    },
    {
      name: 'originX',
      class: 'Float'
    },
    {
      name: 'originY',
      class: 'Float'
    },
    {
      name: 'scaleX',
      class: 'Float',
      value: 1
    },
    {
      name: 'scaleY',
      class: 'Float',
      value: 1
    },
    {
      name: 'skewX',
      class: 'Float'
    },
    {
      name: 'skewY',
      class: 'Float'
    },
    {
      name: 'x',
      class: 'Float'
    },
    {
      name: 'y',
      class: 'Float'
    },
    {
      name: 'alpha',
      class: 'Float',
      value: 1
    },
    {
      name: 'border'
    },
    {
      name: 'color'
    },
    {
      name: 'shadowColor'
    },
    {
      name: 'shadowBlur'
    },
    {
      name: 'children',
      factory: function() { return []; },
      postSet: function(o, n) {
        for ( var i = 0 ; o && i < o.length ; i++ ) this.removeChild_(o[i]);
        for ( var i = 0 ; n && i < n.length ; i++ ) this.addChild_(n[i]);
      }
    },
    {
      name: 'state',
      value: 'initial'
    },
    {
      name: 'transform_',
      factory: function() { return this.Transform.create(); }
    },
    {
      name: 'transform',
      getter: function() {
        var t = this.transform_.reset();

        t.translate(this.x, this.y);
        t.rotate(this.rotation);
        t.skew(this.skewX, this.skewY);
        t.scale(this.scaleX, this.scaleY);
        t.translate(-this.originX, -this.originY);

        return t;
      }
    }
  ],

  methods: [
    function initCView() {
/*
      this.propertyChange.sub(function() {
        this.pub('invalidated');
      }.bind(this));
*/
    },

    function maybeInitCView() {
      if ( this.state == 'initial' ) {
        this.initCView();
        this.state = 'initailized'
      }
    },

    function paint(x) {
      this.maybeInitCView();
      x.save();
      x.globalAlpha *= this.alpha;
      x.strokeStyle = ( this.border && this.border.toCanvasStyle ) ?
        this.border.toCanvasStyle(x) : this.border;
      x.fillStyle = ( this.color && this.color.toCanvasStyle ) ?
        this.color.toCanvasStyle(x) : this.color;
      this.doTransform(x);
      if ( this.shadowColor && this.shadowBlur ) {
        x.shadowColor = this.shadowColor;
        x.shadowBlur  = this.shadowBlur;
      }
      this.paintSelf(x);
      this.paintChildren(x);
      x.restore();
    },

    function doTransform(x) {
      var t = this.transform.matrix;
      x.transform(t.a, t.d, t.b, t.e, t.c, t.f);
    },

    function paintChildren(x) {
      for ( var i = 0 ; i < this.children.length ; i++ ) {
        this.children[i].paint(x);
      }
    },

    function addChild_(c) {
      c.invalidated.sub(this.onChildUpdate);
      return c;
    },

    function removeChild_(c) {
      c.invalidated.unsub(this.onChildUpdate);
      return c;
    },

    function addChildren() {
      for ( var i = 0 ; i < arguments.length ; i++ ) {
        this.children.push(arguments[i]);
        // this.addChild_(arguments[i]);
      }
    },

    function paintSelf(x) {},

    // TODO: Replace with toE() when/if ready.
    function toHTML() {
      return this.Canvas.create({
        width: this.x + this.width || this.r * 2,
        height: this.y + this.height || this.r * 2,
        cview: this
      }).toHTML();
    }
  ],

  listeners: [
    {
      name: 'onChildUpdate',
      isFramed: true,
      code: function onChildUpdate() { this.pub('invalidated'); }
    }
  ]
});


foam.CLASS({
  package: 'foam.graphics',
  name: 'Box',
  extends: 'foam.graphics.CView',

  properties: [
    {
      name: 'width',
      class: 'Float'
    },
    {
      name: 'height',
      class: 'Float'
    },
    {
      name: 'border',
      value: 'black'
    }
  ],

  methods: [
    function paintSelf(x) {
      x.beginPath();
      x.rect(0, 0, this.width, this.height);
      if ( this.border ) x.stroke();
      if ( this.color ) x.fill();
    }
  ]
});


foam.CLASS({
  package: 'foam.graphics',
  name: 'Arc',
  extends: 'foam.graphics.CView',

  properties: [
    {
      name: 'radius',
      class: 'Float'
    },
    {
      name: 'start',
      class: 'Float'
    },
    {
      name: 'end',
      class: 'Float'
    },
    {
      name: 'arcWidth',
      class: 'Float'
    },
    {
      name: 'border',
      value: 'black'
    }
  ],

  methods: [
    function paintSelf(x) {
      x.beginPath();
      x.arc(0, 0, this.radius, this.start, this.end);

      if ( this.color ) {
        x.fill();
      }
      if ( this.border ) {
        x.lineWidth = this.arcWidth;
        x.stroke();
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.graphics',
  name: 'Circle',
  extends: 'foam.graphics.Arc',

  properties: [
    {
      name: 'start',
      value: 0
    },
    {
      name: 'end',
      value: 2*Math.PI
    }
  ],

  methods: [
    function intersects(c) {
      var r = this.radius + c.radius;
      if ( this.border ) r += this.arcWidth-2;
      if ( c.border    ) r += c.arcWidth-2;
      return foam.math.distance(this.x-c.x, this.y-c.y) <= r;
    }
  ]
});


foam.CLASS({
  package: 'foam.graphics',
  name: 'Canvas',

  imports: [ 'getElementById' ],

  properties: [
    {
      name: 'id',
      factory: function() { return 'v' + this.$UID; }
    },
    {
      name: 'width',
    },
    {
      name: 'height',
    },
    {
      name: 'element',
      factory: function() {
        var e = this.getElementById(this.id);
        e.width = this.width;
        e.height = this.height;
        return e;
      },
      postSet: function(_, e) {
        e.width = this.width;
        e.height = this.height;
      }
    },
    {
      name: 'context',
      factory: function() {
        return this.element.getContext('2d');
      }
    },
    {
      name: 'cview',
      postSet: function(o, n) {
        o && o.invalidated.unsub(this.paint);
        n && n.invalidated.sub(this.paint);
        this.paint();
      }
    }
  ],

  methods: [
    function erase() {
      this.element.width = this.element.width;
    }
  ],

  listeners: [
    {
      name: 'paint',
      isFramed: true,
      code: function() {
        this.erase();
        this.cview && this.cview.paint(this.context);
      }
    }
  ],

  templates: [
    {
      name: 'toHTML',
      template: '<canvas id="<%= this.id %>"></canvas>'
    }
  ]
});


foam.CLASS({
  package: 'foam.graphics',
  name: 'Gradient',

  properties: [
    'x0', 'y0', 'r0',
    'x1', 'y1', 'r1',
    {
      name: 'radial',
      class: 'Boolean',
      value: false
    },
    {
      name: 'colors',
      factory: function() {
        return [];
      }
    }
  ],

  methods: [
    function toCanvasStyle(x) {
      var t = this;
      var g = this.radial ?
        x.createRadialGradient(t.x0, t.y0, t.r0, t.x1, t.y1, t.r1) :
        x.createLinearGradient(t.x0, t.y0, t.x1, t.y1) ;

      for ( var i = 0 ; i < t.colors.length ; i++ )
        g.addColorStop(t.colors[i][0], t.colors[i][1]);

      return g;
    }
  ]
});
