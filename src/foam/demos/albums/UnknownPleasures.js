/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// about: http://theconversation.com/joy-division-40-years-on-from-unknown-pleasures-astronomers-have-revisited-the-pulsar-from-the-iconic-album-cover-119861
// https://blogs.scientificamerican.com/sa-visual/pop-culture-pulsar-origin-story-of-joy-division-s-unknown-pleasures-album-cover-video/
// source: https://i.etsystatic.com/17408700/r/il/9ecc8c/1501868680/il_1588xN.1501868680_f6f1.jpg
foam.CLASS({
  package: 'foam.demos.albums',
  name: 'UnknownPleasures',
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
              if ( i > 55 && i < 145 ) a[i] += Math.pow(Math.random(),24);
            }
            for ( var pass = 0 ; pass < 12 ; pass ++ ) {
              for ( var i = 1 ; i < a.length-1 ; i++ ) {
                a[i] = (a[i-1] + a[i] + a[i+1])/3 + (Math.random()-0.5)/250;
              }
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
          x.moveTo(0, 0);
          var l = this.data.length;
          for ( var i = 1 ; i < l ; i++ )  {
            x.lineTo(this.width/l*i, -this.data[i]*200);
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
        this.add(this.Series.create({x:50, y: 70+9*i, width: 400, lineWidth: 1.5, color: 'white'}));
      }
    }
  ]
});
