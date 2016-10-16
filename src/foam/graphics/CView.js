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
  name: 'Transform',

  properties: [
    { class: 'Simple', name: 'a' },
    { class: 'Simple', name: 'b' },
    { class: 'Simple', name: 'c' },
    { class: 'Simple', name: 'd' },
    { class: 'Simple', name: 'e' },
    { class: 'Simple', name: 'f' },
    { class: 'Simple', name: 'g' },
    { class: 'Simple', name: 'h' },
    { class: 'Simple', name: 'i' }
  ],

  methods: [
    function initArgs() {
      this.a = 1; this.b = 0; this.c = 0;
      this.d = 0; this.e = 1; this.f = 0;
      this.g = 0; this.h = 0; this.i = 1;
    },

    function mul(a, b, c, d, e, f, g, h, i) {
      var ta = this.a, tb = this.b, tc = this.c,
          td = this.d, te = this.e, tf = this.f,
          tg = this.g, th = this.h, ti = this.i;

      this.a = ta * a + tb * d + tc * g;
      this.b = ta * b + tb * e + tc * h;
      this.c = ta * c + tb * f + tc * i;

      this.d = td * a + te * d + tf * g;
      this.e = td * b + te * e + tf * h;
      this.f = td * c + te * f + tf * i;

      this.g = tg * a + th * d + ti * g;
      this.h = tg * b + th * e + ti * h;
      this.i = tg * c + th * f + ti * i;

      return this;
    },

    function mulT(t) {
      return this.mul(t.a, t.b, t.c, t.d, t.e, t.f, t.g, t.h, t.i);
    },

    function mulP(p) {
      var ta = this.a, tb = this.b, tc = this.c,
          td = this.d, te = this.e, tf = this.f,
          tg = this.g, th = this.h, ti = this.i;

      var a = p.x;
      var d = p.y;
      var g = p.w;

      p.x = ta * a + tb * d + tc * g;
      p.y = td * a + te * d + tf * g;
      p.w = tg * a + th * d + ti * g;

      return this;
    },

    function affine(m) {
      return this.mul(m.a, m.b, m.c, m.d, m.e, m.f, m.g, m.h, m.i);
    },

    function transpose() {
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
    },

    function invert() {
      var ta = this.a, tb = this.b, tc = this.c,
          td = this.d, te = this.e, tf = this.f,
          tg = this.g, th = this.h, ti = this.i;

      var det = ta*(te*ti  - tf*th) - tb*(td*ti - tf*tg) + tc*(td*th-te*tg);
      var detinv = 1 / det;

      this.a = detinv * (te*ti - tf*th);
      this.b = detinv * (tc*th - tb*ti);
      this.c = detinv * (tb*tf - tc*te);

      this.d = detinv * (tf*tg - td*ti);
      this.e = detinv * (ta*ti - tc*tg);
      this.f = detinv * (tc*td - ta*tf);

      this.g = detinv * (td*th - te*tg);
      this.h = detinv * (tb*tg - ta*th);
      this.i = detinv * (ta*te - tb*td);

      return this;
    },

    function det() {
      // Compute the determinant
      var a = this.a, b = this.b, c = this.c,
          d = this.d, e = this.e, f = this.f,
          g = this.g, h = this.h, i = this.i;

      return a*(e*i  - f*h) - b*(d*i - f*g) + c*(d*h-e*g);
    },

    function reset() {
      this.initArgs();
      return this;
    },

    function translate(dx, dy) {
      if ( ! dx && ! dy ) return;
      this.mul(1, 0, dx, 0, 1, dy, 0, 0, 1);
    },

    function skew(x, y) {
      if ( ! x && ! y ) return;
      this.mul(1, x, 0, y, 1, 0, 0, 0, 1);
    },

    function scale(x, y) {
      if ( x === 1 && y === 1 ) return;
      this.mul(x, 0, 0, 0, y, 0, 0, 0, 1);
    },

    function rotate(a) {
      if ( ! a ) return;
      this.mul(Math.cos(a), Math.sin(a), 0, -Math.sin(a), Math.cos(a), 0, 0, 0, 1);
    }
  ]
});


foam.CLASS({
  package: 'foam.graphics',
  name: 'Transform3D',

  properties: [
    { class: 'Simple', name: 'a' },
    { class: 'Simple', name: 'b' },
    { class: 'Simple', name: 'c' },
    { class: 'Simple', name: 'd' },

    { class: 'Simple', name: 'e' },
    { class: 'Simple', name: 'f' },
    { class: 'Simple', name: 'g' },
    { class: 'Simple', name: 'h' },

    { class: 'Simple', name: 'i' },
    { class: 'Simple', name: 'j' },
    { class: 'Simple', name: 'k' },
    { class: 'Simple', name: 'l' },

    { class: 'Simple', name: 'm' },
    { class: 'Simple', name: 'n' },
    { class: 'Simple', name: 'o' },
    { class: 'Simple', name: 'p' }
  ],

  methods: [
    function init() {
      this.a = 1; this.b = 0; this.c = 0; this.d = 0;
      this.e = 0; this.f = 1; this.g = 0; this.h = 0;
      this.i = 0; this.j = 0; this.k = 1; this.l = 0;
      this.m = 0; this.n = 0; this.o = 0; this.p = 1;
    },

    function mulM(o) {
      return this.mul(
        o.a, o.b, o.c, o.d,
        o.e, o.f, o.h, o.i,
        o.j, o.j, o.k, o.l,
        o.m, o.n, o.o, o.p);
    },

    function mul(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p) {
      var ta = this.a, tb = this.b, tc = this.c, td = this.d,
          te = this.e, tf = this.f, tg = this.g, th = this.h,
          ti = this.i, tj = this.j, tk = this.k, tl = this.l,
          tm = this.m, tn = this.n, to = this.o, tp = this.p;

      this.a = ta * a + tb * e + tc * i + td * m;
      this.b = ta * b + tb * f + tc * j + td * n;
      this.c = ta * c + tb * g + tc * k + td * o;
      this.d = ta * d + tb * h + tc * l + td * p;

      this.e = te * a + tf * e + tg * i + th * m;
      this.f = te * b + tf * f + tg * j + th * n;
      this.g = te * c + tf * g + tg * k + th * o;
      this.h = te * d + tf * h + tg * l + th * p;

      this.i = ti * a + tj * e + tk * i + tl * m;
      this.j = ti * b + tj * f + tk * j + tl * n;
      this.k = ti * c + tj * g + tk * k + tl * o;
      this.l = ti * d + tj * h + tk * l + tl * p;

      this.m = tm * a + tn * e + to * i + tp * m;
      this.n = tm * b + tn * f + to * j + tp * n;
      this.o = tm * c + tn * g + to * k + tp * o;
      this.p = tm * d + tn * h + to * l + tp * p;

      return this;
    },

    function affine(m) {
      return this.mul(m.a, m.b, m.c, m.d,
                      m.e, m.f, m.g, m.h,
                      m.i, m.j, m.k, m.l,
                      m.m, m.n, m.o, m.p);
    },

    function invert() {
      // a b c d    a e i m
      // e f g h -> b f j n
      // i j k l    c g k o
      // m n o p    d h l p
      var tmp = this.b;
      this.b = this.e;
      this.e = tmp;

      tmp = this.c;
      this.c = this.i;
      this.i = tmp;

      tmp = this.d;
      this.d = this.m;
      this.m = tmp;

      tmp = this.g;
      this.g = this.j;
      this.j = tmp;

      tmp = this.h;
      this.h = this.n;
      this.n = tmp;

      tmp = this.l;
      this.l = this.o;
      this.o = tmp;

      return this;
    },

    function reset() {
      this.init();
      return this;
    },

    function translate(dx, dy, dz) {
      if ( ! dx && ! dy && ! dz ) return;
      this.mul(1, 0, 0, dx,
               0, 1, 0, dy,
               0, 0, 1, dz,
               0, 0, 0, 1);
    },

    function skew(x, y, z) {
      if ( ! x && ! y && ! z ) return;
      throw new Error('not implemented yet.');
    },

    function scale(x, y, z) {
      if ( x === 1 && y === 1 && z == 1 ) return;
      this.mul(x, 0, 0, 0,
               0, y, 0, 0,
               0, 0, z, 0,
               0, 0, 0, 1);
    },

    function rotateX(a) {
      if ( ! a ) return;
      var c = Math.cos(a);
      var s = Math.sin(a);

      this.mul(
        1,  0,  0,  0,
        0,  c, -s,  0,
        0,  s,  c,  0,
        0,  0,  0,  1);
    },

    function rotateY(a) {
      if ( ! a ) return;
      var c = Math.cos(a);
      var s = Math.sin(a);

      this.mul(
        c,  0,  s,  0,
        0,  1,  0,  0,
       -s,  0,  c,  0,
        0,  0,  0,  1);
    },


    function rotateZ(a) {
      if ( ! a ) return;
      var c = Math.cos(a);
      var s = Math.sin(a);

      this.mul(
        c, -s,  0,  0,
        s,  c,  0,  0,
        0,  0,  1,  0,
        0,  0,  0,  1);
    }
  ]
});

/*
foam.CLASS({
  package: 'foam.graphics',
  name: 'Quaternion',

  // TODO: doc

  properties: [
    { class: 'Simple', name: 'a' },
    { class: 'Simple', name: 'b' },
    { class: 'Simple', name: 'c' },
    { class: 'Simple', name: 'd' }
  ],

  methods: [
    function init() {
      this.a = this.b = this.c = this.d = 0;
    },

    function add(o) {
      this.a += o.a;
      this.b += o.b;
      this.c += o.b;
      this.d += o.d;
    },

    function scale(a) {
      this.a *= a;
      this.b *= a;
      this.c *= a;
      this.d *= a;
    },

    function mul(a, b, c, d) {
      var ta = this.a, tb = this.b, tc = this.c, td = this.d;

      this.a = ta * a - ( tb * b + tc * c + td * d );
      // TODO(adamvy): Implement
    }
  ]
});
*/

foam.CLASS({
  package: 'foam.graphics',
  name: 'CView',

  requires: [
    'foam.graphics.Canvas',
    'foam.graphics.Transform'
  ],

  // Fires when this CView is invalidated and needs a repaint.
  // Is listened to a foam.u2.Canvas() if one was created for
  // this CView.
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
      },
      hidden: true
    },
    {
      name: 'state',
      value: 'initial'
    },
    {
      name: 'parent',
      hidden: 'true'
    },
    {
      name: 'canvas',
      hidden: 'true'
    },
    {
      name: 'transform_',
      hidden: 'true',
      factory: function() { return this.Transform.create(); }
    },
    {
      name: 'transform',
      hidden: 'true',
      getter: function getTransform() {
        var t = this.transform_.reset();

        t.translate(this.x, this.y);
        t.rotate(this.rotation);
        t.skew(this.skewX, this.skewY);
        t.scale(this.scaleX, this.scaleY);
        t.translate(-this.originX, -this.originY);

        return t;
      }
    },
    {
      // If set to true, then this CView will automatically repaint
      // whenever a child is added or removed, a property changes, or
      // a property of a child changes. Only works if this CView has
      // an associated Canvas (by calling toE()).
      class: 'Boolean',
      name: 'autoRepaint',
      hidden: true,
      value: true
    },
    {
      name: 'invalidate_',
      hidden: true,
      factory: function() {
        return this.parent ? this.parent.invalidate_ :
          this.autoRepaint ? this.invalidated.pub   :
          null ;
      }
    }
  ],

  methods: [
    function initCView() {
      this.invalidate_ && this.propertyChange.sub(this.invalidate_);
    },

    function invalidate() {
      this.invalidate_ && this.invalidate_();
    },

    function toLocalCoordinates(p) {
      if ( this.parent ) this.parent.toLocalCoordinates(p);

      this.transform.invert().mulP(p);
      p.x /= p.w;
      p.y /= p.w;
      p.w = 1;
    },

    function findFirstChildAt(p) {
      if ( arguments.length > 1 ) {
        var tmp = foam.graphics.Point.create();
        tmp.x = arguments[0];
        tmp.y = arguments[1];
        tmp.w = 1;
        p = tmp;
      }

      this.toLocalCoordinates(p);

      var p2 = foam.graphics.Point.create();

      for ( var i = 0 ; i < this.children.length ; i++ ) {
        p2.x = p.x;
        p2.y = p.y;
        p2.w = p.w;

        var c = this.children[i].findFirstChildAt(p2);
        if ( c ) return c;
      }

      if ( this.hitTest(p) ) {
        return this;
      }
    },

    // p must be in local coordinates.
    function hitTest(p) {},

    function maybeInitCView(x) {
      if ( this.state === 'initial' ) {
        this.initCView(x);
        this.state = 'initailized'
      }
    },

    function paint(x) {
      this.maybeInitCView(x);

      x.save();

      var
        alpha       = this.alpha,
        border      = this.border,
        color       = this.color,
        shadowColor = this.shadowColor,
        shadowBlur  = this.shadowBlur;

      if ( alpha !== 1 ) {
        x.globalAlpha *= alpha;
      }

      if ( border ) {
        x.strokeStyle = border.toCanvasStyle ?
          border.toCanvasStyle(x) :
          border ;
      }

      if ( color ) {
        x.fillStyle = color.toCanvasStyle ?
          color.toCanvasStyle(x) :
          color ;
      }

      this.doTransform(x);

      if ( shadowColor && shadowBlur ) {
        x.shadowColor = shadowColor;
        x.shadowBlur  = shadowBlur;
      }

      this.paintSelf(x);
      this.paintChildren(x);

      x.restore();
    },

    function doTransform(x) {
      var t = this.transform;
      x.transform(t.a, t.d, t.b, t.e, t.c, t.f);
    },

    function paintChildren(x) {
      for ( var i = 0 ; i < this.children.length ; i++ ) {
        this.children[i].paint(x);
      }
    },

    function removeChild(c) {
      for ( var i = 0 ; i < this.children.length ; i++ ) {
        if ( this.children[i] === c ) {
          this.children.splice(i, 1);
          this.removeChild_(c);
          return;
        }
      }
    },

    function addChild_(c) {
      c.parent = this;
      c.canvas = this.canvas;
      return c;
    },

    function removeChild_(c) {
      c.parent = undefined;
      c.canvas = undefined;
      this.invalidate();
      return c;
    },

    function addChildren() {
      for ( var i = 0 ; i < arguments.length ; i++ ) {
        this.children.push(arguments[i]);
        this.addChild_(arguments[i]);
      }
      this.invalidate();
    },

    function paintSelf(x) {},

    function hsl(h, s, l) {
      return 'hsl(' + h + ',' + s + '%,' + l + '%)';
    },

    function write() {
      return this.toE().write();
    },

    function toE(X) {
      return this.Canvas.create({ cview: this }, X).attrs({
        // TODO: better to make Arc compute it's width and height
        width: this.x + (this.width  || (this.radius + this.arcWidth) * 2),
        height: this.y + (this.height || (this.radius + this.arcWidth) * 2)
      });
    },

    function intersects(c) {
      if ( c.radius ) {
        return ! (
            this.x + this.width  < c.x - c.radius ||
            this.y + this.height < c.y - c.radius ||
            c.x    + c.radius    < this.x ||
            c.y    + c.radius    < this.y );
      }
      return ! (
          this.x + this.width  < c.x ||
          this.y + this.height < c.y ||
          c.x    + c.width  < this.x ||
          c.y    + c.height < this.y );
    }
  ]
});


foam.CLASS({
  package: 'foam.graphics',
  name: 'CView3D',

  requires: [
    'foam.graphics.Transform3D'
  ],

  properties: [
    { class: 'Float', name: 'x' },
    { class: 'Float', name: 'y' },
    { class: 'Float', name: 'z' },
    { class: 'Float', name: 'rotateX' },
    { class: 'Float', name: 'rotateY' },
    { class: 'Float', name: 'rotateZ' },
    { class: 'Float', name: 'scaleX', value: 1 },
    { class: 'Float', name: 'scaleY', value: 1 },
    { class: 'Float', name: 'scaleZ', value: 1 },
    {
      name: 'transform_',
      factory: function() {
        return this.Transform3D.create();
      }
    },
    {
      name: 'transform',
      getter: function() {
        var t = this.transform_.reset();

        t.translate(this.x, this.y, this.z);
        t.rotateX(this.rotateX);
        t.rotateY(this.rotateY);
        t.rotateZ(this.rotateZ);
        t.scale(this.scaleX, this.scaleY, this.scaleZ);

        return t;
      }
    }
  ],

  methods: [
    function paint3D(gl) {
      // TODO: transform
      this.paintSelf(gl);
    },

    function paintSelf(gl) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      gl.enableVertexAttribArray(this.positionAttribute);
      gl.vertexAttribPoint(this.positionAttribute);
      gl.drawArrays(this.drawType, 0, this.vertexCount);
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
      if ( this.color  ) x.fill();
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

      if ( this.color ) x.fill();

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
    function hitTest(p) {
      var r = this.radius + this.arcWidth/2 - 1;
      return p.x*p.x + p.y*p.y <= r*r;
    },

    function intersects(c) {
      if ( ! c.radius ) return c.intersects(this);
      var r = this.radius + c.radius;
      if ( this.border ) r += this.arcWidth/2-1;
      if ( c.border    ) r += c.arcWidth/2-1;
      var dx = this.x-c.x;
      var dy = this.y-c.y;
      return dx * dx + dy * dy <= r * r;
    }
  ]
});


foam.CLASS({
  package: 'foam.graphics',
  name: 'Point',

  properties: [
    {
      class: 'Simple',
      name: 'x'
    },
    {
      class: 'Simple',
      name: 'y'
    },
    {
      class: 'Simple',
      name: 'w'
    }
  ],

  methods: [
    function clone() {
      var p = this.cls_.create();
      p.x = this.x;
      p.y = this.y;
      p.w = this.w;
      return p;
    },

    function toCartesian() {
      // TODO: What is the right name for this function?
      // It's related to perspective transformations
      // It transforms this point from the homogeneous coordinate space
      // to the cartesian coordiate space.

      this.x = this.x / this.w;
      this.y = this.y / this.w;
      this.w = 1;
    }
  ]
});


foam.CLASS({
  package: 'foam.graphics',
  name: 'Canvas',
  extends: 'foam.u2.Element',

  requires: [
    'foam.input.Pointer'
  ],

  imports: [ 'getElementById' ],

  properties: [
    [ 'nodeName', 'CANVAS' ],
    {
      name: 'context',
      factory: function() {
        return this.el().getContext('2d');
      }
    },
    {
      name: 'context3D',
      factory: function() {
        return this.el().getContext('webgl');
      }
    },
    {
      name: 'cview',
      postSet: function(o, n) {
        n.canvas = this;

        if ( this.attributeMap.width === undefined || this.attributeMap.height === undefined ) {
          this.setAttribute('width', n.width);
          this.setAttribute('height', n.height);
        }

        this.paint();
      }
    },
    {
      name: 'pointer',
      factory: function() {
        return this.Pointer.create({ element: this });
      }
    }
  ],

  methods: [
    function initE() {
      this.on('load', this.paint);
      this.cview$.valueSub('invalidated', this.paint);
    },
    function erase() {
      this.el().width = this.el().width;
    }
  ],

  listeners: [
    {
      name: 'paint',
      isFramed: true,
      code: function paintCanvas() {
        // Only paint after being loaded
        if ( this.state !== this.LOADED ) return;

        var context = this.cview.paint3D ? this.context3D : this.context;
        this.erase(context);

        if ( this.cview ) {
          if ( this.cview.paint3D ) this.cview.paint3D(context);
          else this.cview.paint(context);
        }
      }
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

// TODO: add configurable repaint strategy. Ex. explicit, on property change, on child change


foam.CLASS({
  package: 'foam.graphics',
  name:  'Label',
  extends: 'foam.graphics.CView',

  properties: [
    'width',
    'height',
    {
      class: 'String',
      name:  'text'
    },
    {
      name:  'align',
      label: 'Alignment',
      value: 'start' // values: left, right, center, start, end
    },
    {
      class: 'String',
      name:  'font'
    },
    {
      class: 'Color',
      name:  'color',
      value: 'black'
    },
    {
      class: 'Color',
      name: 'border',
      label: 'Border Color'
    },
    {
      class: 'Float',
      name:  'maxWidth',
      label: 'Maximum Width',
      value: -1
    }
  ],

  methods: [
    function paintSelf(c) {
      if ( this.font ) c.font = this.font;

      c.textAlign = this.align;
      c.fillStyle = this.color;

      c.fillText(
        this.text,
        this.align === 'center' ? this.width/2 : 0,
        this.height/2+10);

      if ( this.border ) {
        c.strokeStyle = this.border;
        c.strokeRect(0, 0, this.width-1, this.height-1);
      }
    }
  ]
});
