/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// about: http://theconversation.com/joy-division-40-years-on-from-unknown-pleasures-astronomers-have-revisited-the-pulsar-from-the-iconic-album-cover-119861
// https://blogs.scientificamerican.com/sa-visual/pop-culture-pulsar-origin-story-of-joy-division-s-unknown-pleasures-album-cover-video/
// source: https://i.etsystatic.com/17408700/r/il/9ecc8c/1501868680/il_1588xN.1501868680_f6f1.jpg
foam.CLASS({
  package: 'foam.demos.albums',
  name: 'PumpkinUnknownPleasures',
  extends: 'foam.graphics.Box',

  classes: [
    {
      name: 'Series',
      extends: 'foam.graphics.Line',
      properties: [
        {
          name: 'data',
          factory: function() {
            var a = [0];
            for ( var i = 1 ; i < 200 ; i++ ) {
              a[i] = Math.random() * 0.03;
              if ( this.inTarget(i*2, this.y) )
                a[i] += Math.pow(Math.random(), 10);
            }
            for ( var pass = 0 ; pass < 4 ; pass ++ ) {
              for ( var i = 1 ; i < a.length-1 ; i++ ) {
                a[i] = (a[i-1] + a[i] + a[i+1])/3 + (Math.random()-0.5)/250;
              }
            }
            return a;
          }
        }
      ],
      methods: [
        function inTarget(x, y) {
          return                 this.inRect(x, y, 175, 105, 50, 50) ||
           this.inCircle(x, y*1.1, 200, 350, 190) && ! (
                 this.inTriangle(x, y, 200, 300, 60, 70) ||
                 this.inCircle(x, y, 125, 250, 40) ||
                 this.inCircle(x, y, 275, 250, 40) ||
                 this.inCircle(x/3, y, 200/3, 410, 25)
               );
        },
        function inCircle(x, y, cx, cy, r) {
          return Math.sqrt(Math.pow(cx-x,2) + Math.pow(cy-y,2)) < r;
        },
        function inTriangle(x, y, tx, ty, tw, th) {
          if ( y < ty ) return false;
          if ( y > ty + th ) return false;
          var d = Math.abs(x-tx);
          if ( d > tw * (1-(y-ty)/th) ) return false;
          return true;
        },
        function inRect(x, y, sx, sy, w, h) {
          if ( y < sy ) return false;
          if ( y > sy + h ) return false;
          if ( x < sx ) return false;
          if ( x > sx + h ) return false;
          return true;
        },
        function paintSelf(x) {
          x.fillStyle   = 'black';
          x.strokeStyle = this.color;
          x.lineWidth   = this.lineWidth;
          x.beginPath();
          x.moveTo(0, 0);
          var l = this.data.length;
          for ( var i = 1 ; i < l ; i++ )  {
            x.lineTo(this.width/l*i, -this.data[i]*100);
          }
          x.fill();
          x.stroke();
        }
      ]
    }
  ],

  requires: [
    'foam.graphics.Circle',
    'foam.graphics.Line'
  ],

  properties: [
    [ 'width',  500 ],
    [ 'height', 600 ],
    [ 'color', 'black' ]
  ],

  methods: [
    function initCView() {
      this.SUPER();

      for ( var i = 0 ; i < 50 ; i++ ) {
        this.add(this.Series.create({x:50, y: 70+9*i, width: 400, lineWidth: 1.5, color: 'orange'}));
      }
    }
  ]
});
