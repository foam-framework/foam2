/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// http://davidbau.com/mandelbrot/?grid=1&s=3&c=-0.5+0i
// https://math.hws.edu/eck/js/mandelbrot/MB.html
foam.CLASS({
  package: 'foam.demos.mandelbrot',
  name: 'Mandelbrot',
  extends: 'foam.u2.Element',

  requires: [
    'foam.nanos.controller.WindowHash',
    'foam.graphics.Box',
    'foam.input.Gamepad'
  ],

  constants: {
    MEMENTO_PROPERTIES: [ 'x1', 'y1', 'x2', 'y2', 'maxIterations', 'width', 'height' ]
  },

  properties: [
    {
      name: 'memento'
    },
    {
      name: 'canvas',
      factory: function() { return this.Box.create({width$: this.width$, height$: this.height$}); }
    },
    [ 'width',  1400 ],
    [ 'height', 800 ],
    { class: 'Int',    name: 'maxIterations', value: 1024 },
    { class: 'Double', name: 'x1',            value: -2 },
    { class: 'Double', name: 'y1',            value: -1.15 },
    { class: 'Double', name: 'x2',            value: 0.5 },
    { class: 'Double', name: 'y2',            value: 1.15 },
    {
      name: 'img',
      hidden: true,
      expression: function(width, height) { return this.canvas.canvas.context.createImageData(this.width, this.height); }
    },
    {
      // Joystick
      name: 'gamepad',
      factory: function() { return this.Gamepad.create(); }
    },
    {
      name: 'hsl',
      value: foam.Function.memoize1(function(h) {
        return 'hsl(' + h + ',100%,50%)';
      })
    },
    //'pass',
    //'v'
  ],

  methods: [
    function initE() {
      this.SUPER();

      var h = this.WindowHash.create();
      this.memento = h.value;
      h.value$.follow(this.memento$);

      if ( this.memento ) {
        var a = this.memento.split(',');
        a.forEach((v, i) => this[this.MEMENTO_PROPERTIES[i]] = v);
      }

      this.MEMENTO_PROPERTIES.forEach(p => this.propertyChange.sub(p, this.invalidate));

      this.
        style({outline: 'none'}).
        focus().
        start(this.canvas).
          on('click', this.onClick).
        end().
        tag({
          class: 'foam.u2.DetailView',
          data: this,
          properties: [ 'width', 'height', 'x1', 'y1', 'x2', 'y2', 'maxIterations' ]});

      this.canvas.paintSelf = (ctx) => {
        var start = performance.now();
        var x1 = this.x1, y1 = this.y1, x2 = this.x2, y2 = this.y2, width = this.width, height = this.height, xd = x2-x1, yd = y2-y1;
        var v = this.pass ? this.v : [];
        if ( ! this.pass ) {
          for ( var i = 0 ; i < width/10 ; i++ ) {
            v[i] = [];
            for ( var j = 0 ; j < height/10 ; j++ ) {
              var x = i*10/width*xd+x1;
              var y = j*10/height*yd+y1;
              v[i][j] = this.calc(x, y);
            }
          }
        }
        function eq(c, i, j) {
          return v[i] == undefined || v[i][j] == undefined || v[i][j] == c;
        }
        for ( var i = 0 ; i < width/10; i++ ) {
          for ( var j = 0 ; j < height/10 ; j++ ) {
            var c = v[i][j];
            var same = ! this.pass || eq(c, i-1, j) && eq(c, i+1, j) && eq(c, i, j-1) && eq(c, i, j+1);
            for ( var i2 = i*10 ; i2 < i*10 + 10 ; i2++ ) {
              for ( var j2 = j*10 ; j2 < j*10 + 10 ; j2++ ) {
                var x = i2/width*xd+x1;
                var y = j2/height*yd+y1;
                this.set(i2, j2, same ? c : this.calc(x, y));
              }
            }
          }
        }
        console.log('paint', Math.round(performance.now() - start));
        this.pass = ! this.pass;
        if ( this.pass ) {
          this.v = v;
          this.invalidate();
        }
        ctx.putImageData(this.img, 0, 0);
      };
    },

    function set(x, y, c) {
      var i   = (y*this.width+x)*4;
      if ( c <= 1 ) {
        this.img.data[i]   = 0;
        this.img.data[i+1] = 0;
        this.img.data[i+2] = 0;
        this.img.data[i+3] = 255;
      } else {
        c *= 5;
        var rgb = this.hslToRgb(c/255, 0.5, 1);
        this.img.data[i]   = c || rgb[0];
        this.img.data[i+1] = c || rgb[1];
        this.img.data[i+2] = c || rgb[2];
        this.img.data[i+3] = 255;
      }
    },

    function calc(x, y) {
      var zx = 0, zy = 0;

      for ( var i = 0 ; i < this.maxIterations ; i++ ) {
        var xt = zx*zy;
        zx = zx*zx - zy*zy + x;
        zy = 2*xt + y;
        if ( zx*zx + zy*zy > 4 ) return 2 * 255 * Math.pow(i / this.maxIterations, 0.8);
      }

      return 0;
    },

    function hslToRgb(h, s, l){
        var r, g, b;

        if ( s == 0 ) {
          r = g = b = l;
        } else {
          var hue2rgb = function hue2rgb(p, q, t) {
            if ( t < 0 ) t += 1;
            if ( t > 1 ) t -= 1;
            if ( t < 1/6 ) return p + (q - p) * 6 * t;
            if ( t < 1/2 ) return q;
            if ( t < 2/3 ) return p + (q - p) * (2/3 - t) * 6;
            return p;
          }

          var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          var p = 2 * l - q;
          r = hue2rgb(p, q, h + 1/3);
          g = hue2rgb(p, q, h);
          b = hue2rgb(p, q, h - 1/3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }
  ],

  actions: [
    {
      name: 'increaseMaxIterations',
      keyboardShortcuts: [ 'e' ],
      code: function() {
        this.maxIterations *= 2;
        this.invalidate();
      }
    },
    {
      name: 'decreaseMaxIterations',
      keyboardShortcuts: [ 'q' ],
      code: function() {
        this.maxIterations /= 2;
        this.invalidate();
      }
    },
    {
      name: 'zoomIn',
      keyboardShortcuts: [ '+', '=' ],
      code: function() {
        var x1 = this.x1, y1 = this.y1, x2 = this.x2, y2 = this.y2, xd = x2-x1, yd = y2-y1;
        this.x1 += xd/5;
        this.x2 -= xd/5;
        this.y1 += yd/5;
        this.y2 -= yd/5;
        this.invalidate();
      }
    },
    {
      name: 'zoomOut',
      keyboardShortcuts: [ '-', '_' ],
      code: function() {
        var x1 = this.x1, y1 = this.y1, x2 = this.x2, y2 = this.y2, xd = x2-x1, yd = y2-y1;
        this.x1 -= xd/5;
        this.x2 += xd/5;
        this.y1 -= yd/5;
        this.y2 += yd/5;
        this.invalidate();
      }
    },
    {
      name: 'up',
      keyboardShortcuts: [ 38 /* up arrow */, 'w' ],
      code: function() {
        var y1 = this.y1, y2 = this.y2, yd = y2-y1;
        this.y1 -= yd/10;
        this.y2 -= yd/10;
        this.invalidate();
      }
    },
    {
      name: 'down',
      keyboardShortcuts: [ 40 /* down arrow */, 's' ],
      code: function() {
        var y1 = this.y1, y2 = this.y2, yd = y2-y1;
        this.y1 += yd/10;
        this.y2 += yd/10;
        this.invalidate();
      }
    },
    {
      name: 'left',
      keyboardShortcuts: [ 37 /* left arrow */, 'a' ],
      code: function() {
        var x1 = this.x1, x2 = this.x2, xd = x2-x1;
        this.x1 -= xd/10;
        this.x2 -= xd/10;
        this.invalidate();
      }
    },
    {
      name: 'right',
      keyboardShortcuts: [ 39 /* right arrow */, 'd' ],
      code: function() {
        var x1 = this.x1, x2 = this.x2, xd = x2-x1;
        this.x1 += xd/10;
        this.x2 += xd/10;
        this.invalidate();
      }
    }
  ],

  listeners: [
    {
      name: 'invalidate',
      isFramed: true,
      code: function() {
        this.memento = this.MEMENTO_PROPERTIES.map(p => this[p]);
        this.canvas.invalidate();
      }
    },

    function onClick(evt) {
      var x = evt.clientX, y = evt.clientY;
      console.log(x,y);
      var x1 = this.x1, y1 = this.y1, x2 = this.x2, y2 = this.y2, xd = x2-x1, yd = y2-y1;
      this.x1 = x * xd / this.width  + x1 - xd / 2;
      this.x2 = x * xd / this.width  + x1 + xd / 2;
      this.y1 = y * yd / this.height + y1 - yd / 2;
      this.y2 = y * yd / this.height + y1 + yd / 2;
      this.invalidate();
    }
  ]
});
