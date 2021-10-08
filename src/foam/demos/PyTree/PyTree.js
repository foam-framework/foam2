/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// Dancing Pythagoras Tree
// Ported from: https://swizec.com/blog/animating-svg-nodes-react-preact-inferno-vue/swizec/7311
foam.CLASS({
  name: 'PyBranch',
  extends: 'foam.u2.Element',

  requires: [ 'PyBranch' ],

  imports: [ 'maxLvl' ],

  properties: [ 'lvl' ],

  methods: [
    function initE() {
      this.setNodeName('g').
        start('rect').
          setID(null).
          attrs({width: 1, height: 1}).
          style({fill: this.fillColor(this.lvl)}).
        end();

      if ( this.lvl < this.maxLvl ) {
        this.add(
            this.PyBranch.create({lvl: this.lvl+1}).setID(null).addClass('l'),
            this.PyBranch.create({lvl: this.lvl+1}).setID(null).addClass('r'));
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
  name: 'PyTree',
  extends: 'foam.u2.Element',

  requires: [ 'PyBranch' ],

  imports: [ 'document', 'installCSS' ],

  exports: [ 'maxLvl' ],

  properties: [
    [ 'heightFactor', 0.55 ],
    [ 'lean', 0 ],
    { name: 'maxLvl', factory: function() {
      // Firefox has a bug which causes it to crash when svg is too deeply
      // nested, so dial it back to 9 on Firefox until fixed.
      //
      // https://bugzilla.mozilla.org/show_bug.cgi?id=943243
      return navigator.userAgent.indexOf('Firefox') == -1 ? 11 : 9;
    }},
    'cssEl',
  ],

  methods: [
    function initE() {
      this.installCSS('');
      this.cssEl = this.document.head.lastChild;

      this.setNodeName('svg').
        style({border: '1px solid lightgray'}).
        attrs({width: 1200, height: 600}).
        on('mousemove', this.onMouseMove).
        add(this.PyBranch.create({lvl: 1}).attrs({transform: 'translate(560 510) scale(80)'}));

      this.redraw();
    },

    function distance(x, y) { return Math.sqrt(x*x + y*y); }
  ],

  listeners: [
    {
      name: 'redraw',
      isFramed: true,
      code: function() {
        var heightFactor = this.heightFactor, lean = this.lean;
        var a      = Math.atan2(heightFactor,    .5+lean);
        var b      = Math.atan2(heightFactor,    .5-lean);
        var lScale = this.distance(heightFactor, .5+lean);
        var rScale = this.distance(heightFactor, .5-lean);

        this.cssEl.innerText =
          '.l { transform: scale(' + lScale + ') rotate(' + -a + 'rad) translate(0, -1px) }\n' +
          '.r { transform: translate(1px, 0) scale(' + rScale + ') rotate(' + b + 'rad) translate(-1px, -1px) }';
      }
    },

    function onMouseMove(e) {
      this.heightFactor = (1 - e.clientY / this.getAttribute('height')) * 0.8;
      this.lean         = e.clientX / this.getAttribute('width') - 0.5;
      this.redraw();
    }
  ]
});
