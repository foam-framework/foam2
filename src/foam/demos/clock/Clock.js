/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demos.clock',
  name: 'Clock',
  extends: 'foam.graphics.Circle',

  documentation: 'Draw a clock. One of the first ever FOAM programs created in 2011.',

  implements: [ 'com.google.misc.Colors' ],

  requires: [ 'foam.graphics.Circle' ],

  properties: [
    [ 'radius',   100 ],
    [ 'x',        120 ],
    [ 'y',        120 ],
    [ 'color',    '#ffffff' ],
    [ 'arcWidth', 5 ],
    {
      class: 'Boolean',
      name: 'drawTicks'
    },
    {
      name: 'border',
      factory: function() { return this.BLUE; }
    },
    {
      name: 'minuteHand',
      hidden: 'true',
      factory: function() {
        return this.Hand.create({width:5, color: this.GREEN});
      }
    },
    {
      name: 'hourHand',
      hidden: 'true',
      factory: function() {
        return this.Hand.create({width:7, color: this.YELLOW});
      }
    },
    {
      name: 'secondHand',
      hidden: 'true',
      factory: function() {
        return this.Hand.create({width:3, color: this.RED});
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.add(this.hourHand, this.minuteHand, this.secondHand);
      this.tick();
    },

    function paintSelf(c) {
      this.SUPER(c);

      var date = new Date();

      this.secondHand.radius = this.radius-8;
      this.minuteHand.radius = this.radius-8;
      this.hourHand.radius   = this.radius-15;
      this.secondHand.angle  = Math.PI/2 - Math.PI*2 * date.getSeconds() / 60 ;
      this.minuteHand.angle  = Math.PI/2 - Math.PI*2 * date.getMinutes() / 60 ;
      this.hourHand.angle    = Math.PI/2 - Math.PI*2 * (date.getHours() % 12) / 12 + this.minuteHand.angle / 12;

      if ( ! this.drawTicks ) return;

      for ( var i = 0 ; i < 12 ; i++ ) {
        var a = Math.PI*2/12*i;
        var l = i % 3 ? 6 : 10;
        var w = i % 3 ? 2 : 3;
        c.beginPath();
        c.moveTo((this.radius-l)*Math.cos(a),-(this.radius-l)*Math.sin(a));
        c.lineTo((this.radius)*Math.cos(a),-(this.radius)*Math.sin(a));
        c.closePath();

        c.lineWidth = w;
        c.strokeStyle = this.border;
        c.stroke();
      }
    }
  ],

  listeners: [
    {
      name: 'tick',
      isMerged: true,
      mergeDelay: 1000,
      code: function() { this.invalidate(); this.tick(); }
    }
  ],

  classes: [
    {
      name: 'Hand',
      label: 'Clock Hand',
      extends: 'foam.graphics.CView',

      properties: [
        'angle',
        [ 'width', 5 ],
        'radius'
      ],

      methods: [
        function paint(canvas) {
          canvas.beginPath();
          canvas.moveTo(0,0);
          canvas.lineTo(this.radius*Math.cos(this.angle),-this.radius*Math.sin(this.angle));
          canvas.closePath();

          canvas.lineWidth   = this.width;
          canvas.strokeStyle = this.color;
          canvas.stroke();
        }
      ]
    }
  ]
});
