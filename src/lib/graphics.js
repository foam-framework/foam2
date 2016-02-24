foam.CLASS({
  package: 'foam.core',
  name: 'Float',
  extends: 'Property',
  properties: [
    {
      name: 'defaultValue',
      defaultValue: 0
    }
  ]
});

foam.CLASS({
  package: 'foam.graphics',
  name: 'Matrix',
  properties: [
    {
      name: 'a',
      type: 'Simple'
    },
    {
      name: 'b',
      type: 'Simple'
    },
    {
      name: 'c',
      type: 'Simple'
    },
    {
      name: 'd',
      type: 'Simple'
    },
    {
      name: 'e',
      type: 'Simple'
    },
    {
      name: 'f',
      type: 'Simple'
    },
    {
      name: 'g',
      type: 'Simple'
    },
    {
      name: 'h',
      type: 'Simple'
    },
    {
      name: 'i',
      type: 'Simple'
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
    }
  ],
  methods: [
    function reset() {
      this.matrix = this.Matrix.create();
    },
    function translate(dx, dy) {
      var m = this.Matrix.create()
      m.a = 1; m.b = 0; m.c = dx;
      m.d = 0; m.e = 1; m.f = dy;
      m.g = 0; m.h = 0; m.i = 1;
      this.matrix.mul(m);
    },
    function skew(x, y) {
      var m = this.Matrix.create();
      m.a = 1; m.b = x; m.c = 0;
      m.d = y; m.e = 1; m.f = 0;
      m.g = 0; m.h = 0; m.i = 1;
      this.matrix.mul(m);
    },
    function affine(m) {
      this.matrix.mul(m);
    },
    function scale(x, y) {
      var m = this.Matrix.create();
      m.a = x; m.b = 0; m.c = 0;
      m.d = 0; m.e = y; m.f = 0;
      m.g = 0; m.h = 0; m.i = 1;
      this.matrix.mul(m);
    },
    function rotate(a) {
      var m = this.Matrix.create();
      m.a = Math.cos(a);  m.b = Math.sin(a); m.c = 0;
      m.d = -Math.sin(a); m.e = Math.cos(a); m.f = 0;
      m.g = 0;            m.h = 0;           m.i = 1;
      this.matrix.mul(m);
    }
  ]
});

foam.CLASS({
  package: 'foam.graphics',
  requires: [
    'foam.graphics.Transform'
  ],
  name: 'CView',
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
      defaultValue: 1
    },
    {
      name: 'scaleY',
      class: 'Float',
      defaultValue: 1
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
      name: 'strokeStyle',
      defaultValue: 'black'
    },
    {
      name: 'fillStyle',
      defaultValue: 'black'
    },
    {
      name: 'children',
      factory: function() {
        return [];
      }
    },
    {
      name: 'transform',
      expression: function(originX, originY, rotation, scaleX, scaleY, skewX, skewY, x, y) {
        var t = this.Transform.create()
        t.translate(x, y);
        t.rotate(rotation);
        t.skew(skewX, skewY);
        t.scale(scaleX, scaleY);
        t.translate(-originX, -originY);

        return t;
      }
    }
  ],
  methods: [
    function paint(x) {
      x.save();
      x.strokeStyle = this.strokeStyle.toCanvasStyle ?
        this.strokeStyle.toCanvasStyle(x) : this.strokeStyle;
      x.fillStyle = this.fillStyle.toCanvasStyle ?
        this.fillStyle.toCanvasStyle(x) : this.fillStyle;
      this.doTransform(x);
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
    function paintSelf(x) {}
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
      name: 'fill',
      class: 'Boolean',
      defaultValue: false
    },
    {
      name: 'stroke',
      class: 'Boolean',
      defaultValue: true
    }
  ],
  methods: [
    function paintSelf(x) {
      x.beginPath();
      x.rect(0, 0, this.width, this.height);
      if ( this.stroke ) x.stroke();
      if ( this.fill ) x.fill();
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
      name: 'fill',
      class: 'Boolean',
      deafultValue: false
    },
    {
      name: 'stroke',
      class: 'Boolean',
      defaultValue: true
    }
  ],
  methods: [
    function paintSelf(x) {
      x.beginPath();
      x.arc(0, 0, this.radius, this.start, this.end);
      if ( this.fill ) x.fill();
      if ( this.stroke ) x.stroke();
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
      defaultValue: 0
    },
    {
      name: 'end',
      defaultValue: 2*Math.PI
    }
  ]
});

foam.CLASS({
  package: 'foam.graphics',
  name: 'Canvas',
  imports: [
    '$'
  ],
  properties: [
    {
      name: 'id'
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
        var e = this.$(this.id);
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
      postSet: function(old, nu) {
        old && old.unsubscribe(this.paint);
        nu && nu.subscribe(this.paint);
        this.paint();
      }
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
  ],
  methods: [
    function erase() {
      this.element.width = this.element.width;
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
      defaultValue: false
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
      var g;
      if ( this.radial )
        g = x.createRadialGradient(this.x0, this.y0, this.r0, this.x1, this.y1, this.r1);
      else
        g = x.createLinearGradient(this.x0, this.y0, this.x1, this.y1);

      for ( var i = 0 ; i < this.colors.length ; i++ ) {
        g.addColorStop(this.colors[i][0], this.colors[i][1]);
      }

      return g;
    }
  ]
});
