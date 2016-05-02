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
        { name: 'g' }
      ],
      methods: [
        function polar3D(r, t, g) {
          this.x = 200 + Math.cos(g) * Math.cos(t) * r;
          this.y = 200 + Math.sin(t) * r;
        },
        function paintSelf(x) {
          this.polar3D(this.r, this.t, this.g);
          this.SUPER(x);
        }
      ]
    }
  ],

  properties: [
    [ 'n',  197 ],
    [ 'width', 500 ],
    [ 'height', 500 ],
    [ 'time',   0 ],
    [ 'color', 'white' ]
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
        color: 'hsl(' + i*365/this.n + ',' + 100 + '%, 60%)'
      });
      p.shadowColor = p.color;

      this.time$.sub(function() {
        p.t -= 0.02;
        p.g += 0.02;
        p.shadowBlur = Math.abs(this.time % this.n -i) < 5 ? 10 : 0;
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
