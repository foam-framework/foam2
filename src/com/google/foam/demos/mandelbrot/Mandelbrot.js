/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.google.foam.demos.mandelbrot',
  name: 'Mandelbrot',
  extends: 'foam.graphics.Box',
//  extends: 'foam.u2.Element',

  requires: [
    'foam.input.Gamepad'
  ],

  properties: [
    [ 'width',  1400 ],
    [ 'height', 800 ],
    [ 'x1',      -2 ],
    [ 'y1',      -1.15 ],
    [ 'x2',       0.5 ],
    [ 'y2',       1.15 ],
    {
      name: 'img',
      factory: function() { return this.canvas.context.createImageData(this.width, this.height); }
    },
    {
      // Joystick
      name: 'gamepad',
      factory: function() { return this.Gamepad.create(); }
    }
  ],

  methods: [
    /*
    function initE() {
      this.SUPER();

      // Set focus so keyboard actions work
      this.focus();
    },
    */

    function initCView() {
      this.SUPER();
//      this.canvas.style({transform: 'scale(.25,.25)'});
    },

    function set(x, y, c) {
      this.img.data[(y*this.width+x)*4] = c;

      this.img.data[(y*this.width+x)*4+1] = Math.pow(c/255,4)*300;
      this.img.data[(y*this.width+x)*4+2] = Math.pow(c/255,10)*300;

      this.img.data[(y*this.width+x)*4+3] = 255;
    },

    function calc(x, y) {
      var zx = 0, zy = 0;
      for ( var i = 0 ; i < 255 ; i++ ) {
        var xt = zx*zy;
        zx = zx*zx - zy*zy + x;
        zy = 2*xt + y;
        if ( zx*zx + zy*zy > 4 ) return 255-i*10;
      }
      return 0;
    },

    function paintSelf(ctx) {
      var x1 = this.x1, y1 = this.y1, x2 = this.x2, y2 = this.y2, width = this.width, height = this.height, xd = x2-x1, yd = y2-y1;
      for ( var i = 0 ; i < width-1 ; i++ ) {
        for ( var j = 0 ; j < height-1 ; j++ ) {
          var x = i/width*xd+x1;
          var y = j/height*yd+y1;
          this.set(i, j, this.calc(x, y));
        }
      }
      ctx.putImageData(this.img, 0, 0);
    }
  ],

  actions: [
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
        this.y1 += yd/10;
        this.y2 += yd/10;
        this.invalidate();
      }
    },
    {
      name: 'down',
      keyboardShortcuts: [ 40 /* down arrow */, 's' ],
      code: function() {
        var y1 = this.y1, y2 = this.y2, yd = y2-y1;
        this.y1 -= yd/10;
        this.y2 -= yd/10;
        this.invalidate();
      }
    },
    {
      name: 'left',
      keyboardShortcuts: [ 37 /* left arrow */, 'a' ],
      code: function() {
        var x1 = this.x1, x2 = this.x2, xd = x2-x1;
        this.x1 += xd/10;
        this.x2 += xd/10;
        this.invalidate();
      }
    },
    {
      name: 'right',
      keyboardShortcuts: [ 39 /* right arrow */, 'd' ],
      code: function() {
        var x1 = this.x1, x2 = this.x2, xd = x2-x1;
        this.x1 -= xd/10;
        this.x2 -= xd/10;
        this.invalidate();
      }
    },
  ]


// this.invalidate();
});
