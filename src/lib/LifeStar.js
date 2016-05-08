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
        r: Math.sin(Math.PI * i/this.n)*200,
        t: i*Math.PI*20/this.n,
        g: 0, //i*Math.PI/5/this.n,
        radius: 3,
        border: null,
        arcWidth: 0
      });

      p.x = Math.sin(p.t) * Math.cos(p.g) * p.r;
      p.y = Math.cos(p.t) * p.r;
      p.z = Math.sqrt(200*200 - p.x*p.x - p.y*p.y) * (( i > this.n/2 ) ? 1 : -1);

      this.time$.sub(function() {
        p.rotateY(0.01);
        p.rotateX(0.005);
        var on = Math.abs((this.time % this.n - i + this.n)%this.n) < 20
        p.glowRadius = on ? 8 : 0;
        var s = on ? 100 : 70;
        var l = on ?  70 : 40;
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
