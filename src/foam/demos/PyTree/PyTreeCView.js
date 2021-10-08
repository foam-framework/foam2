/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// Dancing Pythagoras Tree
// Ported from: https://swizec.com/blog/animating-svg-nodes-react-preact-inferno-vue/swizec/7311
foam.CLASS({
  name: 'PyBranch',
  extends: 'foam.graphics.Box',

  requires: [ 'PyBranch' ],

  imports: [ 'lTransform', 'rTransform', 'maxLvl' ],

  properties: [
    [ 'width',  1 ],
    [ 'height', 1 ],
    [ 'border', null ],
    { name: 'color', factory: function() { return this.fillColor(this.lvl); } },
    'lvl'
  ],

  methods: [
    function init() {
      this.SUPER();

      if ( this.lvl < this.maxLvl ) {
        this.add(
          this.PyBranch.create({lvl: this.lvl+1, transform$: this.lTransform$}),
          this.PyBranch.create({lvl: this.lvl+1, transform$: this.rTransform$}));
      }
    },

    {
      name: 'fillColor',
      code: foam.Function.memoize1(function(lvl) {
        return 'hsl(' + Math.floor(lvl/this.maxLvl*180) + ',70%,70%)';
      })
    }
  ]
});


foam.CLASS({
  name: 'PyTreeCView',
  extends: 'foam.graphics.Box',

  requires: [ 'PyBranch', 'foam.graphics.Transform' ],

  exports: [ 'lTransform', 'rTransform', 'maxLvl' ],

  properties: [
    [ 'heightFactor', 0.55 ],
    [ 'lean', 0 ],
    [ 'maxLvl', 11 ],
    [ 'width', 1200 ],
    [ 'height', 600 ],
    [ 'border', 'lightgray' ],
    [ 'borderWidth', 1 ],
    'lTransform',
    'rTransform'
  ],

  methods: [
    function initCView() {
      this.SUPER();
      this.canvas.on('mousemove', this.onMouseMove);
      this.add(this.PyBranch.create({x: 560, y: 510, scaleX: 80, scaleY: 80, lvl: 1}));
      this.redraw();
    },

    function distance(x, y) { return Math.sqrt(x*x + y*y); }
  ],

  listeners: [
    function redraw() {
      var heightFactor = this.heightFactor, lean = this.lean;
      var a      = Math.atan2(heightFactor,    .5+lean);
      var b      = Math.atan2(heightFactor,    .5-lean);
      var lScale = this.distance(heightFactor, .5+lean);
      var rScale = this.distance(heightFactor, .5-lean);

      this.lTransform = this.Transform.create().
        scale(lScale).rotate(a).translate(0, -1);

      this.rTransform = this.Transform.create().
        translate(1, 0).scale(rScale).rotate(-b).translate(-1, -1);
    },

    function onMouseMove(e) {
      this.heightFactor = (1 - e.clientY / this.height) * 0.8;
      this.lean         = e.clientX / this.width - 0.5;
      this.redraw();
    }
  ]
});
