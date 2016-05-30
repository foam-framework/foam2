foam.CLASS({
  package: 'foam.demos.graphics',
  name: 'ThreeDTest',
//  extends: 'foam.graphics.Box',
  extends: 'foam.graphics.StereoCView',

  classes: [
    {
      name: 'Point',
      extends: 'foam.graphics.Circle',
      implements: [ 'foam.physics.Physical' ],
      properties: [
        'z', 'vz',
        [ 'radius',   4 ],
        [ 'color',    'white' ],
        [ 'border',   null ],
        [ 'arcWidth', 0 ],
        { class: 'Float', name: 'glowRadius' }
      ],
      methods: [
        function doTransform(x) {
          var oldX = this.x, oldY = this.y;
          var s = 1 - this.z/600;
          this.x *= s;
          this.y *= s;
          var t = this.transform;
          t.scale(s, s);
          x.transform(t.a, t.d, t.b, t.e, t.c, t.f);
          this.x = oldX;
          this.y = oldY;
        }
      ]
    }
  ],

  properties: [
    [ 'x',      500 ],
    [ 'y',      350 ],
    [ 'width',  1200 ],
    [ 'height', 500 ],
    {
      name: 'ball',
      factory: function() {
        return this.Point.create({
          vx: 10,
          vy: 10,
          vz: 10,
          z: 0,
          color: 'red',
          radius: 10
        }); 
      }
    }
  ],

  methods: [
    function initCView() {
      this.SUPER();
      for ( var x = 0 ; x < 7 ; x++ ) {
        for ( var y = 0 ; y < 7 ; y++ ) {
          for ( var z = 0 ; z < 7 ; z++ ) {
            this.addChildren(this.Point.create({
              x: x * 50 - 150,
              y: y * 50 - 150,
              z: z * 50 - 150
            }));
          }
        }
      }

      this.addChildren(this.ball);
      this.tick();
    }
  ],

  listeners: [
    {
      name: 'tick',
      isFramed: true,
      code: function() {
        var ball = this.ball;

        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.z += ball.vz;

        if ( ball.x < -150 ) ball.vx =   9;
        if ( ball.x >  150 ) ball.vx =  -9;
        if ( ball.y < -150 ) ball.vy =  10;
        if ( ball.y >  150 ) ball.vy = -10;
        if ( ball.z < -150 ) ball.vz =  11;
        if ( ball.z >  150 ) ball.vz = -11;

        this.invalidated.pub();
        this.tick();
      }
    }
  ]
});
