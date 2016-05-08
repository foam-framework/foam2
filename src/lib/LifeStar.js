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
        { name: 'r' },
        { name: 't' },
        { name: 'g' },
        { class: 'Float', name: 'glowRadius' }
      ],
      methods: [
        function rotateY(a) {
          this.z = this.z * Math.cos(a) - this.x * Math.sin(a);
          this.x = this.z * Math.sin(a) + this.x * Math.cos(a);
        },
        function rotateX(a) {
          this.z = this.z * Math.cos(a) - this.y * Math.sin(a);
          this.y = this.z * Math.sin(a) + this.y * Math.cos(a);
        },
        function doTransform(x) {
          var t = this.transform;
          var s = 1 - this.z/5000;
          t.translate(-200,-200);
          t.scale(s, s);
          t.translate(200,200);
          x.transform(t.a, t.d, t.b, t.e, t.c, t.f);
        },
        function polar3D(r, t, g) {
          this.x = Math.sin(t) * Math.cos(g) * r;
          this.y = Math.cos(t) * r;
          this.z = Math.sqrt(200*200 - this.x*this.x - this.y*this.y);
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
    [ 'n',      128 ],
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
      for ( var i = 0 ; i < this.n ; i++ ) {
        var p = this.addPoint(i);
        p.z *= -1;
      }
      this.tick();
    },
    function addPoint(i) {
      var p = this.Point.create({
        r: i*200/this.n,
        t: i*Math.PI*20/this.n,
        g: 0, //i*Math.PI/5/this.n,
        radius: 3,
        border: null,
        arcWidth: 0
      });

      p.polar3D(p.r, p.t, p.g);

      this.time$.sub(function() {
        p.rotateY(0.01);
        var on = Math.abs((this.time % this.n - i + this.n)%this.n) < 20
        p.glowRadius = on ? 8 : 0;
        var s = on ? 100 : 70;
        var l = on ?  70 : 30;
        p.color = this.hsl(i*365/this.n, s, l);
      }.bind(this));
      this.addChildren(p);

      return p;
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
