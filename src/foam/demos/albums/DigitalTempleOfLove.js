/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// source: https://i.etsystatic.com/8907128/r/il/b33ad2/1685058287/il_fullxfull.1685058287_8i3t.jpg

foam.CLASS({
  package: 'foam.demos.albums',
  name: 'DigitalTempleOfLove',
  extends: 'foam.graphics.Box',

  classes: [
    {
      name: 'NaturalLine',
      extends: 'foam.graphics.Line',
      methods: [
        function paintSelf(x) {
          x.strokeStyle = this.color;
          // x.shadowColor = this.color;
          // x.shadowBlur  = 2;
          this.paintLine(x, 0, 0, this.endX-this.startX, this.endY-this.startY, this.lineWidth);
        },
        function paintLine(x, x1, y1, x2, y2, w) {
          var d = Math.pow(x2-x1,2) + Math.pow(y2-y1, 2);
          if ( d < 80 ) {
            x.beginPath();
            x.moveTo(x1, y1);
            x.lineTo(x2, y2);
            x.lineWidth = w;
            x.stroke();
          } else {
            var xm = (x1+x2)/2;
            var ym = (y1+y2)/2;
            var w2 = 0.3+5*Math.random();
            paintLine(x, x1, y1, xm, ym, w);
            paintLine(x, xm, ym, x2, y2, w2);
          }
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
    [ 'height', 450 ],
    [ 'color', 'black' ]
  ],

  methods: [
    function initCView() {
      this.SUPER();

      for ( var i = 0 ; i < 100 ; i++ ) {
        var r = i*Math.PI*2/100;
        this.add(this.NaturalLine.create({
          startX: 150 +  60 * Math.cos(r),
          startY: 150 +  60 * Math.sin(r),
          endX:   150 + 700 * Math.cos(r),
          endY:   150 + 700 * Math.sin(r),
          lineWidth: 2.5,
          color:'green'
        }));
      }
    }
  ]
});
