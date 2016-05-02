foam.CLASS({
  package: 'foam.demos.graphics',
  name: 'LifeStar',
  extends: 'foam.graphics.CView',

  requires: [ 'foam.graphics.Arc' ],

  classes: [
    {
      name: 'Point',
      extends: 'foam.graphics.Circle',
      properties: [
        [ 'radius', 3 ]
      ],
      methods: [
        function polar3D(r, t, g) {
          this.x = 200 + Math.cos(t) * r;
          this.y = 200 + Math.sin(t) * r;
        }
      ]
    }
  ],
  
  properties: [
    [ 'n',  211 ],
    [ 'width', 500 ],
    [ 'height', 500 ],
    [ 'time',   0 ]
  ],

  methods: [
    function initCView() {
      this.SUPER();
      for ( var i = 0 ; i < this.n ; i++ ) this.addPoint(i);
    },
    function addPoint(i) {
      var p = this.Point.create({
        radius: 3,
        border: null,
        arcWidth: 0,
        color: 'hsl(' + i*365/this.n + ',' + 100 + '%, 60%)'
      });
      p.polar3D(i*200/this.n, i*Math.PI*20/this.n, 0);  
      /*
      this.time$.sub(function(_, __, ___, time$) {
        arc.start += Math.cos(time$.get() / 4000) * (a+1)/100;
        arc.end    = arc.start + Math.PI;
      });
      */
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
