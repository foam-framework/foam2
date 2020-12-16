/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.google.foam.demos.mandelbrot',
  name: 'Mandelbrot',
  extends: 'foam.graphics.Box',

  properties: [
    [ 'width',  1400 ],
    [ 'height', 800 ],
    [ 'x1',      -2 ],
    [ 'y1',      -1 ],
    [ 'x2',       0.5 ],
    [ 'y2',       1 ],
    {
      name: 'img',
      factory: function() { return this.canvas.context.createImageData(this.width, this.height); }
    }
  ],

  methods: [
    function initCView() {
      this.SUPER();
   //   this.canvas.style({transform: 'scale(4,4)'});
    },

    function set(x, y, c) {
      this.img.data[(y*this.width+x)*4] = c;

      // Next two lines can be commented out for a more red fire
      this.img.data[(y*this.width+x)*4+1] = Math.pow(c/255,4)*256;
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
  ]

// this.invalidate();
});
