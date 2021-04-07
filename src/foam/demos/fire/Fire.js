/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demos.fire',
  name: 'Fire',
  extends: 'foam.graphics.Box',

  // algorithm from: https://nullprogram.com/blog/2020/04/30/
  // similar:
  //   https://codepen.io/aecend/details/BGeZpa
  //   https://codepen.io/ge1doot/pen/aQPqXX

  properties: [
    [ 'width',  400 ],
    [ 'height', 400 ],
    [ 'x',      100 ],
    [ 'y',      100 ],
    {
      name: 'img',
      factory: function() { return this.canvas.context.createImageData(this.width, this.height); }
    }
  ],

  methods: [
    function initCView() {
      this.SUPER();
      this.canvas.style({transform: 'scale(4,4)'});
      this.onTick();
    },

    function set(x, y, c) {
      // ctx.fillStyle = `rgb(${Math.round(nc * 4)}, ${Math.round(nc * 2)},${Math.round((nc * nc * nc * 0.000005) + nc * 0.001 * z * z * z)})`;

      this.img.data[(y*this.width+x)*4]   = c;

      // Next two lines can be commented out for a more red fire
      this.img.data[(y*this.width+x)*4+1] = Math.pow(c/255,4)*256;
      this.img.data[(y*this.width+x)*4+2] = Math.pow(c/255,10)*300;

      this.img.data[(y*this.width+x)*4+3] = 255;
    },

    function get(x, y) {
      return this.img.data[(y*this.width+x)*4];
    },

    function paintSelf(x) {
      x.putImageData(this.img, 0, 0);
    }
  ],

  listeners: [
    {
      name: 'onTick',
      isFramed: true,
      code: function() {
        // The +0.1 prevents the fire from blowing left, I don't know why
        function rand(l, h) { return Math.floor((Math.random()+0.1) * (h-l+1)) + l; }

        // from https://nullprogram.com/blog/2020/04/30/
        for ( var y = 0 ; y < this.height-1 ; y++ ) {
          for ( var x = 1 ; x < this.width-1 ; x++ ) {
            var c = this.get(x, y+1) - Math.random()*2;
            this.set(x+rand(-1,1), y, c);
          }
        }

        for ( var x = 0 ; x < this.width ; x++ ) {
          this.set(x, this.height-2, 255-Math.random()*100);
        }

        this.invalidate();
        this.onTick();
      }
    }
  ]
});
