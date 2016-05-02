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
        { name: 'r' },
        { name: 't' },
        { name: 'g' },
        { class: 'Float', name: 'glowRadius' }
      ],
      methods: [
        function polar3D(r, t, g) {
          this.x = 200 + Math.cos(g) * Math.cos(t) * r;
          this.y = 200 + Math.sin(t) * r;
        },
        function paintSelf(x) {
          this.polar3D(this.r, this.t, this.g);
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
    [ 'n',  197 ],
    [ 'width', 500 ],
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
        r: i*200/this.n,
        t: i*Math.PI*20/this.n,
        g: 0,
        radius: 3,
        border: null,
        arcWidth: 0,
//        color: 'hsl(' + i*365/this.n + ',' + 100 + '%, 60%)'
      });

      this.time$.sub(function() {
        p.t -= 0.02;
        p.g += 0.02;
        p.glowRadius = Math.abs(this.time % this.n - i) < 20 ? 8 : 0;
        var bright = Math.abs(this.time % this.n - i) < 20 ? 70 : 30;
        var sat = Math.abs(this.time % this.n - i) < 20 ? 100 : 60;
        p.color = 'hsl(' + i*365/this.n + ',' + 100 + '%, ' + bright + '%)';
      }.bind(this));
      this.addChildren(p);
    }
  ],
  listeners: [
    {
      name: 'tick',
      isFramed: true,
      code: function() {
        this.time++;
        this.tick();
        this.invalidated.pub();
      }
    }
  ]
});
