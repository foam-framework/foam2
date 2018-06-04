/**
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

  documentation: 'Affine transform.',

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
    {
      name: 'inverse_',
      factory: function() { return this.cls_.create(); },
      // Exclude from compareTo()
      compare: function() { return 0; }
    }
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

      var inv = this.inverse_;

      inv.a = detinv * (te*ti - tf*th);
      inv.b = detinv * (tc*th - tb*ti);
      inv.c = detinv * (tb*tf - tc*te);

      inv.d = detinv * (tf*tg - td*ti);
      inv.e = detinv * (ta*ti - tc*tg);
      inv.f = detinv * (tc*td - ta*tf);

      inv.g = detinv * (td*th - te*tg);
      inv.h = detinv * (tb*tg - ta*th);
      inv.i = detinv * (ta*te - tb*td);

      return inv;
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
      if ( dx || dy ) this.mul(1, 0, dx, 0, 1, dy, 0, 0, 1);
      return this;
    },

    function skew(x, y) {
      if ( x || y ) this.mul(1, x, 0, y, 1, 0, 0, 0, 1);
      return this;
    },

    function scale(x, y) {
      if ( y === undefined ) y = x;
      if ( x != 1 || y != 1 ) this.mul(x, 0, 0, 0, y, 0, 0, 0, 1);
      return this;
    },

    function rotate(a) {
      if ( a ) this.mul(Math.cos(a), Math.sin(a), 0, -Math.sin(a), Math.cos(a), 0, 0, 0, 1);
      return this;
    },

    function rotateAround(a, x, y) {
      return this.translate(-x, -y).rotate(a).translate(x, y);
    }
  ]
});


foam.CLASS({
  package: 'foam.graphics',
  name: 'Transform3D',

  documentation: 'Three-dimensional affine transform.',

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

    function mulP(p) {
      var ta = this.a, tb = this.b, tc = this.c, td = this.d,
          te = this.e, tf = this.f, tg = this.g, th = this.h,
          ti = this.i, tj = this.j, tk = this.k, tl = this.l,
          tm = this.m, tn = this.n, to = this.o, tp = this.p;

      var a = p.x;
      var b = p.y;
      var c = p.z
      var d = p.w;

      p.x = ta * a + tb * b + tc * c + td * d;
      p.y = te * a + tf * b + tg * c + th * d;
      p.z = ti * a + tj * b + tk * c + tl * d;
      p.w = tm * a + tn * b + to * c + tp * d;

      return this;
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
    },

    function rotate(x, y, z, r) {
      var d = Math.sqrt(x*x + y*y + z*z);
      x /= d;
      y /= d;
      z /= d;

      var cos = Math.cos(r);
      var sin = Math.sin(r);

      this.mul(
        cos + x*x*(1 - cos),     x*y*(1 - cos) - z*sin,   x*z*(1 - cos) + y*sin,  0,
        y*x*(1 - cos) + z*sin,   cos + y*y*(1-cos),       y*z*(1 - cos) - x*sin,  0,
        z*x*(1 - cos) - y*sin,   z*y*(1 - cos) + x*sin,   cos + z*z*(1 - cos),    0,
        0,                       0,                       0,                      1);

    }
  ]
});


foam.CLASS({
  package: 'foam.graphics',
  name: 'CView',

  documentation: 'A Canvas-View; base-class for all graphical view components.',

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
      class: 'Float',
      name: 'width'
    },
    {
      class: 'Float',
      name: 'height'
    },
    {
      class: 'Float',
      name: 'rotation',
      preSet: function(_, r) {
        if ( r > 2 * Math.PI  ) return r - 2 * Math.PI;
        if ( r < -2 * Math.PI ) return r + 2 * Math.PI;
        return r;
      },
      view: {
        class: 'foam.u2.view.DualView',
        viewa: { class: 'foam.u2.FloatView', precision: 4, onKey: true },
        viewb: { class: 'foam.u2.RangeView', step: 0.00001, minValue: -Math.PI*2, maxValue: Math.PI*2, onKey: true }
      }
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
      class: 'Float',
      hidden: true
    },
    {
      name: 'skewY',
      class: 'Float',
      hidden: true
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
      view: {
        class: 'foam.u2.view.DualView',
        viewa: { class: 'foam.u2.FloatView', precision: 4, onKey: true },
        viewb: { class: 'foam.u2.RangeView', step: 0.0001, maxValue: 1, onKey: true }
      },
      value: 1
    },
    {
      class: 'Color',
      name: 'border'
    },
    {
      class: 'Color',
      name: 'color'
    },
    {
      class: 'Color',
      name: 'shadowColor'
    },
    {
      class: 'Int',
      name: 'shadowBlur',
      units: 'pixels'
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
      value: 'initial',
      hidden: 'true',
      transient: true
    },
    {
      name: 'parent',
      hidden: 'true',
      transient: true
    },
    {
      name: 'canvas',
      hidden: 'true',
      transient: true
    },
    {
      name: 'transform_',
      hidden: 'true',
      transient: true,
      factory: function() { return this.Transform.create(); }
    },
    {
      name: 'transform',
      hidden: 'true',
      expression: function getTransform(x, originX, y, originY, rotation, skewX, skewY, scaleX, scaleY) {
        var t = this.transform_.reset();

        t.translate(x+originX, y+originY);
        t.rotate(rotation);
        t.skew(skewX, skewY);
        t.scale(scaleX, scaleY);
        t.translate(-originX, -originY);

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
    { name: 'top_',    hidden: true, transient: true, getter: function() { return this.y; } },
    { name: 'left_',   hidden: true, transient: true, getter: function() { return this.x; } },
    { name: 'bottom_', hidden: true, transient: true, getter: function() { return this.y+this.height; } },
    { name: 'right_',  hidden: true, transient: true, getter: function() { return this.x+this.width; } },
    {
      name: 'invalidate_',
      transient: true,
      hidden: true,
      // TODO: Would be more efficient to be a factory, but doesn't work. Investigate.
      getter: function() {
        return this.parent ? this.parent.invalidate_ :
          this.autoRepaint ? this.invalidated.pub    :
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

    function parentToLocalCoordinates(p) {
      this.transform.invert().mulP(p);
      p.x /= p.w;
      p.y /= p.w;
      p.w = 1;
    },

    function globalToLocalCoordinates(p) {
      if ( this.parent ) this.parent.globalToLocalCoordinates(p);
      this.parentToLocalCoordinates(p);
    },

    function findFirstChildAt(p) {
      if ( arguments.length > 1 ) {
        var tmp = foam.graphics.Point.create();
        tmp.x = arguments[0];
        tmp.y = arguments[1];
        tmp.w = 1;
        p = tmp;
      }

      this.parentToLocalCoordinates(p);

      if ( this.children.length ) {
        var p2 = foam.graphics.Point.create();

        for ( var i = 0 ; i < this.children.length ; i++ ) {
          p2.x = p.x;
          p2.y = p.y;
          p2.w = p.w;

          var c = this.children[i].findFirstChildAt(p2);
          if ( c ) return c;
        }
      }

      if ( this.hitTest(p) ) return this;
    },

    // p must be in local coordinates.
    function hitTest(p) {
      return p.x >= 0 && p.y >= 0 && p.x < this.width && p.y < this.height;
    },

    function maybeInitCView(x) {
      if ( this.state === 'initial' ) {
        this.state = 'initailized'
        this.initCView(x);
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

    function remove(c) {
      for ( var i = 0 ; i < this.children.length ; i++ ) {
        if ( this.children[i] === c ) {
          this.children.splice(i, 1);
          this.removeChild_(c);
          return;
        }
      }
    },

    function removeAllChildren() {
      var children = this.children;
      this.children = [];
      for ( var i = 0 ; i < children.length ; i++ ) {
        this.removeChild_(children[i]);
      }
    },

    function removeChild(c) {
      console.log('Deprecated use of CView.removeChild(). Use .remove() instead.');
      this.remove(c);
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

    function add() {
      for ( var i = 0 ; i < arguments.length ; i++ ) {
        this.children.push(arguments[i]);
        this.addChild_(arguments[i]);
      }
      this.invalidate();
      return this;
    },

    function addChildren() {
      console.warn('Deprecated use of CView.addChildren(). Use add() instead.');
      return this.add.apply(this, arguments);
    },

    function paintSelf(x) {},

    function hsl(h, s, l) {
      return 'hsl(' + h + ',' + s + '%,' + l + '%)';
    },

    function write() {
      return this.toE().write();
    },

    function toE(args, X) {
      return this.Canvas.create({ cview: this }, X).attrs({
        width:  this.slot(function(x, width,  scaleX) { return x + width*scaleX; }),
        height: this.slot(function(y, height, scaleY) { return y + height*scaleY; })
      });
    },

    function intersects(c) {
      if ( c.radius ) {
        return ! (
            this.x + this.width  < c.x - c.radius ||
            this.y + this.height < c.y - c.radius ||
            c.x    + c.radius    < this.x         ||
            c.y    + c.radius    < this.y );
      }
      return ! (
          this.x + this.width  < c.x ||
          this.y + this.height < c.y ||
          c.x    + c.width  < this.x ||
          c.y    + c.height < this.y );
    },

    function equals(b) { return this === b; }
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

  documentation: 'A CView for drawing a rectangular box.',

  properties: [
    {
      class: 'Float',
      name: 'width'
    },
    {
      class: 'Float',
      name: 'height'
    },
    {
      class: 'Float',
      name: 'borderWidth',
      value: 1
    },
    {
      name: 'border',
      value: '#000000'
    }
  ],

  methods: [
    function paintSelf(x) {
      x.beginPath();
      x.rect(0, 0, this.width, this.height);
      if ( this.border && this.borderWidth ) {
        x.lineWidth = this.borderWidth;
        x.stroke();
      }
      if ( this.color  ) x.fill();
    }
  ]
});


foam.CLASS({
  package: 'foam.graphics',
  name: 'Line',
  extends: 'foam.graphics.CView',

  documentation: 'A CView for drawing a line.',

  properties: [
    {
      class: 'Float',
      name: 'startX',
      getter: function() { return this.x; },
      setter: function(v) { this.x = v; }
    },
    {
      class: 'Float',
      name: 'startY',
      getter: function() { return this.y; },
      setter: function(v) { this.y = v; }
    },
    { class: 'Float',  name: 'endX' },
    { class: 'Float',  name: 'endY' },
    { class: 'Float',  name: 'lineWidth', value: 1 },
    { class: 'String', name: 'color',     value: '#000000' },
    { name: 'lineDash', documentation: 'An Array of numbers which specify distances to alternately draw lines and gaps. Full line if not set.' },
  ],

  methods: [
    function paintSelf(x) {
      x.beginPath();
      if ( this.lineDash ) x.setLineDash(this.lineDash);
      x.moveTo(0, 0);
      x.lineTo(this.endX-this.x, this.endY-this.y);
      x.lineWidth = this.lineWidth;
      x.strokeStyle = this.color;
      x.stroke();
    },

    function hitTest(p) {
      // There is probably a better way to do this.
      // This checks if the given point is

      // A is the vector from the start of the line to point p
      var ax = p.x - this.startX;
      var ay = p.y - this.startY;

      // B a vector representing the line (from start to end).
      var bx = this.endX - this.startX;
      var by = this.endY - this.startY;
      var blen = Math.sqrt(bx * bx + by * by);

      // Project A onto B
      var scalarProj = (ax * bx + ay * by ) / blen;
      var factor = scalarProj / blen;
      var projX = bx * factor;
      var projY = by * factor;

      // Calculate vector rejection "perpendicular distance"
      var rejX = ax - projX;
      var rejY = ay - projY;

      // Hit's if the perpendicular distance is less than some factor,
      // and the point is within some factor of the line start/finish

      var distance = Math.sqrt(rejX * rejX + rejY * rejY);
      var pos = scalarProj;

      return distance < 5 && pos > -5 && pos < (blen + 5)

      return false;
    }
  ]
});


foam.CLASS({
  package: 'foam.graphics',
  name: 'Polygon',
  extends: 'foam.graphics.CView',

  documentation: 'A CView for drawing a polygon.',

  properties: [
    { class: 'Array', of: 'Float', name: 'xCoordinates' },
    { class: 'Array', of: 'Float', name: 'yCoordinates' },
    { class: 'String', name: 'color', value: '#000' },
    { class: 'Float', name: 'lineWidth', value: 1 }
  ],

  methods: [
    function paintSelf(x) {
      x.beginPath();
      x.moveTo(this.xCoordinates[0], this.yCoordinates[0]);
      for ( var i = 1; i < this.xCoordinates.length; i++ ) {
        x.lineTo(this.xCoordinates[i], this.yCoordinates[i]);
      }
      x.lineWidth = this.lineWidth;
      x.strokeStyle = this.color;
      x.stroke();
    }
  ]
});


foam.CLASS({
  package: 'foam.graphics',
  name: 'Arc',
  extends: 'foam.graphics.CView',

  documentation: 'A CView for drawing an arc.',

  properties: [
    {
      name: 'radius',
      class: 'Float',
      preSet: function(_, r) { return Math.max(0, r); }
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
      // TODO: rename this
      name: 'arcWidth',
      class: 'Float'
    },
    {
      name: 'border',
      value: '#000000'
    },
    { name: 'top_',    hidden: true, transient: true, getter: function() { return this.y-this.radius; } },
    { name: 'left_',   hidden: true, transient: true, getter: function() { return this.x-this.radius; } },
    { name: 'bottom_', hidden: true, transient: true, getter: function() { return this.y+this.radius; } },
    { name: 'right_',  hidden: true, transient: true, getter: function() { return this.x+this.radius; } }
  ],

  methods: [
    function paintSelf(x) {
      x.beginPath();
      x.arc(0, 0, this.radius, this.start, this.end);

      if ( this.start != 0 || this.end != Math.PI*2 ) {
        x.lineTo(0,0);
        x.lineTo(this.radius*Math.cos(this.start)+0.5,this.radius*Math.sin(this.start));
      }

      if ( this.color ) x.fill();

      if ( this.border ) {
        x.lineWidth = this.arcWidth;
        x.stroke();
      }
   },

    function toE(X) {
      return this.Canvas.create({ cview: this }, X).attrs({
        width: this.x + this.radius + this.arcWidth,
        height: this.y + this.radius + this.arcWidth
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.graphics',
  name: 'Circle',
  extends: 'foam.graphics.Arc',

  documentation: 'A CView for drawing a Circle.',

  properties: [
    {
      name: 'start',
      value: 0,
      view: {
        class: 'foam.u2.view.DualView',
        viewa: { class: 'foam.u2.FloatView', precision: 4, onKey: true },
        viewb: { class: 'foam.u2.RangeView', maxValue: Math.PI*2, step: 0.01, onKey: true }
      }
    },
    {
      name: 'end',
      value: 2*Math.PI,
      view: {
        class: 'foam.u2.view.DualView',
        viewa: { class: 'foam.u2.FloatView', precision: 4, onKey: true },
        viewb: { class: 'foam.u2.RangeView', maxValue: Math.PI*2, step: 0.01, onKey: true }
      }
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
  name: 'Ellipse',
  extends: 'foam.graphics.CView',

  documentation: 'A CView for drawing an ellipse.',

  properties: [
    {
      class: 'Float',
      name: 'radiusX',
      preSet: function(_, r) { return Math.max(0, r); }
    },
    {
      class: 'Float',
      name: 'radiusY',
      preSet: function(_, r) { return Math.max(0, r); }
    },
    {
      name: 'start',
      value: 0,
      view: {
        class: 'foam.u2.view.DualView',
        viewa: { class: 'foam.u2.FloatView', precision: 4, onKey: true },
        viewb: { class: 'foam.u2.RangeView', maxValue: Math.PI*2, step: 0.01, onKey: true }
      }
    },
    {
      name: 'end',
      value: 2*Math.PI,
      view: {
        class: 'foam.u2.view.DualView',
        viewa: { class: 'foam.u2.FloatView', precision: 4, onKey: true },
        viewb: { class: 'foam.u2.RangeView', maxValue: Math.PI*2, step: 0.01, onKey: true }
      }
    },
    {
      name: 'borderWidth',
      class: 'Float'
    },
    {
      name: 'border',
      value: '#000000'
    },
    {
      class: 'Float',
      name: 'width',
      getter: function() { return 2 * this.radiusX; },
      setter: function(w) { this.radiusX = w / 2; }
    },
    {
      class: 'Float',
      name: 'height',
      getter: function() { return 2 * this.radiusY; },
      setter: function(h) { this.radiusY = h / 2; }
    },
    { name: 'top_',    hidden: true, transient: true, getter: function() { return this.y; } },
    { name: 'left_',   hidden: true, transient: true, getter: function() { return this.x; } },
    { name: 'bottom_', hidden: true, transient: true, getter: function() { return this.y+2*this.radiusY; } },
    { name: 'right_',  hidden: true, transient: true, getter: function() { return this.x+2*this.radiusX; } },
  ],

  methods: [
    function paintSelf(x) {
      x.beginPath();
      x.ellipse(this.radiusX, this.radiusY, this.radiusX, this.radiusY, 0, this.start, this.end);

      if ( this.color ) x.fill();

      if ( this.border ) {
        x.lineWidth = this.borderWidth;
        x.stroke();
      }
    }

    // TODO: implement intersects()
  ]
});


foam.CLASS({
  package: 'foam.graphics',
  name: 'Point',

  // TODO: where/how is this used?
  // documentation: '',

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

  documentation: 'A Canvas U2 Element for drawing CViews in. Don\'t create directly, use CView.toE() instead.',

  requires: [
    'foam.input.Pointer'
  ],

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
          this.setAttribute('width',  n.width);
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
      this.SUPER();
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
        if ( this.state !== this.LOADED || ! this.cview ) return;

        var ctx = this.cview.paint3D ? this.context3D : this.context;
        this.erase(ctx);
        if ( this.cview.paint3D ) {
          this.cview.paint3D(ctx);
        } else {
          this.cview.paint(ctx);
        }
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.graphics',
  name: 'Gradient',

  // TODO: where/how is this used?
//   documentation: '',

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

  documentation: 'A CView drawing text.',

  properties: [
    {
      class: 'String',
      name:  'text',
      view: { class: 'foam.u2.TextField', onKey: true }
    },
    {
      name:  'align',
      label: 'Alignment',
      value: 'start',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [ 'start', /*'left',*/ 'center', /*'right',*/ 'end' ]
      }
    },
    {
      class: 'String',
      name:  'font'
    },
    {
      class: 'Color',
      name:  'color',
      value: '#000000'
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
          this.align === 'start'  ? 0 :
          this.align === 'center' ? this.width/2 :
          this.width,
        this.height/2+10);

      if ( this.border ) {
        c.strokeStyle = this.border;
        c.strokeRect(0, 0, this.width-1, this.height-1);
      }
    }
  ]
});

/*
a : 1 // H scale
b : 0 // V skew
c : 3821.142407877334 // H move
d : 0 // H skew
e : 1 // V scale
f : -6796.176219640322 // V move
g : 0
h : 0
i : 1
*/
