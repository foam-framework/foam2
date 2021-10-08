/**
 * @license
 * Copyright 2015 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demos.bubbles',
  name: 'SquareBubbles',
  extends: 'foam.graphics.Box',

  requires: [
    'foam.physics.PhysicalCircle',
    'foam.physics.PhysicalBox',
    'foam.physics.PhysicsEngine',
    'foam.util.Timer'
  ],

  properties: [
    {
      name: 'timer',
      factory: function() {
        var timer = this.Timer.create();
        timer.start();
        return timer;
      }
    },
    [ 'n',          7 ],
    [ 'width',      800 ],
    [ 'height',     600 ],
    [ 'background', '#ccf' ],
    { name: 'engine',   factory: function() {
      var e = this.PhysicsEngine.create({gravity: true});
      e.start();
      return this.onDetach(e);
    }}
  ],

  methods: [
    function initCView() {
      this.SUPER();

      var N = this.n;

      for ( var x = 0 ; x < N ; x++ ) {
        for ( var y = 0 ; y < N ; y++ ) {
          var c = this.PhysicalBox.create({
            width: 30,
            height: 30,
            x: 400+(x-(N-1)/2)*70,
            y: 200+(y-(N-1)/2)*70,
            friction: 0.96,
            gravity: 0.03,
            borderWidth: 5,
            border: this.hsl(x/N*100, (70+y/N*30), 60)
          });
          this.engine.add(c);
          this.add(c);

          this.timer.i$.sub(foam.Function.bind(function circleBoundOnWalls(c) {
            if ( c.y > 1/this.scaleY*this.height+50 ) {
              c.y = -50;
            }
            if ( c.x < 0          ) c.vx =  Math.abs(c.vx)+0.1;
            if ( c.x > this.width ) c.vx = -Math.abs(c.vx)-0.1;
          }, this, c));
        }
      }

      for ( var i = 0 ; i < 90 ; i++ ) {
        var b = this.PhysicalCircle.create({
          radius: 4,
          x: this.width * Math.random(),
          y: this.height + this.height * Math.random(),
          arcWidth: 0,
          border: null,
          color: '#88c',
          gravity: -0.2,
          friction: 0.96,
          mass: 0.3
        });
        this.engine.add(b);
        this.add(b);

        this.timer.i$.sub(foam.Function.bind(function bubbleWrap(b) {
          if ( b.y < 1 ) {
            b.y = this.height;
            b.x = this.width * Math.random();
          }
        }, this, b));
      }

      this.timer.i$.sub(this.invalidated.pub)
    }
  ]
});
