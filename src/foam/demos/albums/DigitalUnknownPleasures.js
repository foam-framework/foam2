/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// about: http://theconversation.com/joy-division-40-years-on-from-unknown-pleasures-astronomers-have-revisited-the-pulsar-from-the-iconic-album-cover-119861
// source: https://i.etsystatic.com/17408700/r/il/9ecc8c/1501868680/il_1588xN.1501868680_f6f1.jpg
foam.CLASS({
  package: 'foam.demos.albums',
  name: 'DigitalUnknownPleasures',
  extends: 'foam.graphics.Box',

  classes: [
    {
      name: 'Series',
      extends: 'foam.graphics.Line',
      properties: [
        {
          name: 'data',
          factory: function() {
            var a = [];
            for ( var i = 0 ; i < 30 ; i++ ) {
//              a[i] = Math.random() * i < 5 || i > 24 ? 0.1 : 1;
              a[i] = Math.random() * i < 6 || i > 21 ? 0.1 : 1;
            }
            return a;
          }
        }
      ],
      methods: [
        function paintSelf(x) {
          x.fillStyle   = 'black';
          x.strokeStyle = this.color;
          x.lineWidth   = this.lineWidth;
          x.beginPath();
          x.moveTo(0, -this.data[0]*20);
          var l = this.data.length;
          for ( var i = 1 ; i < l ; i++ )  {
            x.lineTo(this.width/l*i, -this.data[i]*20);
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
    [ 'height', 450 ],
    [ 'color', 'black' ]
  ],

  methods: [
    function initCView() {
      this.SUPER();

      for ( var i = 0 ; i < 40 ; i++ ) {
        this.add(this.Series.create({x:50, y: 50+9*i, width: 400, lineWidth: 1.35, color: 'white'}));
      }
    }
  ]
});
