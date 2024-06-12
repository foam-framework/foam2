/**
 * @license
 * Copyright 2014 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demos.lifestar',
  name: 'Disk',
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
          this.x = 250 + Math.sin(t) * Math.cos(g) * r;
          this.y = 250 + Math.cos(t) * r;
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
    [ 'n',      227 ],
    [ 'width',  500 ],
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
        g: 0, //i*Math.PI/5/this.n,
        radius: 3,
        border: null,
        arcWidth: 0
      });

      this.time$.sub(function() {
        p.t -= 0.01;
        p.g += 0.01;
        var on = Math.abs((this.time % this.n - i + this.n)%this.n) < 20
        p.glowRadius = on ? 8 : 0;
        var s = on ? 100 : 70;
        var l = on ? 70 : 30;
        p.color = this.hsl(i*365/this.n, s, l);
      }.bind(this));
      this.add(p);
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
