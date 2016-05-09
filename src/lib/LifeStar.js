foam.CLASS({
  package: 'foam.demos.graphics',
  name: 'LifeStar',
  extends: 'foam.graphics.Box',

  requires: [ 'foam.graphics.Arc' ],

  classes: [
    {
      name: 'Point',
      extends: 'foam.graphics.Circle',
      properties: [
        'z',
        { class: 'Float', name: 'glowRadius' }
      ],
      methods: [
        function rotateY(a) {
          var x = this.x, z = this.z;
          this.z = z * Math.cos(a) - x * Math.sin(a);
          this.x = z * Math.sin(a) + x * Math.cos(a);
        },
        function rotateX(a) {
          var y = this.y, z = this.z;
          this.z = z * Math.cos(a) - y * Math.sin(a);
          this.y = z * Math.sin(a) + y * Math.cos(a);
        },
        function doTransform(x) {
          var t = this.transform;
          var s = 1 - this.z/300;
          t.scale(s, s);
          x.transform(t.a, t.d, t.b, t.e, t.c, t.f);
        },
        function paintSelf(x) {
          this.SUPER(x);
          if ( this.glowRadius ) {
            x.globalAlpha = 0.2;
            var oldR = this.radius;
            this.radius = this.glowRadius;
            this.SUPER(x);
            this.radius = oldR;
          }
        }
      ]
    }
  ],

  properties: [
    [ 'n',      217 ],
    [ 'x',      500 ],
    [ 'y',      350 ],
    [ 'width',  1000 ],
    [ 'height', 500 ],
    [ 'time',   0 ],
    [ 'color', 'black' ]
  ],

  methods: [
    function initCView() {
      this.SUPER();
      for ( var i = 0 ; i < this.n ; i++ ) this.addPoint(i);
      this.tick();
    },
    function addPoint(i) {
      var p = this.Point.create({
        radius: 3,
        border: null,
        arcWidth: 0
      });

      this.time$.sub(function() {
        var time = this.time;
        var r    = Math.sin(Math.PI * i/this.n)*200;
        var a    = (i-time/10)*Math.PI*19/this.n;

        p.x = Math.sin(a) * r;
        p.y = Math.cos(a) * r;
        p.z = Math.sqrt(200*200 - p.x*p.x - p.y*p.y) * (( i > this.n/2 ) ? 1 : -1);

        p.rotateY(0.01*time);
        p.rotateX(0.005*time);

        var on = Math.abs((time % this.n - i + this.n)%this.n) < 20
        p.glowRadius = on ? 8 : 0;
        var s = on ? 100 : 70;
        var l = on ?  70 : 40;
        p.color = this.hsl(i*365/this.n, s, l);
      }.bind(this));
      this.addChildren(p);
    }
  ],
  listeners: [
    {
      name: 'tick',
      isFramed: true,
      code: function() { this.time++; this.tick(); this.invalidated.pub(); }
    }
  ]
});
