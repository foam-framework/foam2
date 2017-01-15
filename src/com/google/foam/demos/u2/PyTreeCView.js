foam.CLASS({
  name: 'PyBranch',
  extends: 'foam.graphics.Box',

  requires: [ 'PyBranch' ],

  imports: [ 'lTransform', 'rTransform', 'maxLvl' ],

  properties: [
    [ 'width', 1 ],
    [ 'height', 1 ],
    [ 'borderWidth', 0 ],
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
  extends: 'foam.graphics.CView',

  requires: [ 'PyBranch', 'foam.graphics.Transform' ],

  exports: [ 'lTransform', 'rTransform', 'maxLvl' ],

  properties: [
    [ 'width', 1600 ],
    [ 'height', 600 ],
    [ 'heightFactor', 0.55 ],
    [ 'lean', 0 ],
    [ 'maxLvl', 11 ],
    'lTransform',
    'rTransform'
  ],

  methods: [
    function initCView() {
      this.SUPER();
      this.orient();
      this.canvas.on('mousemove', this.onMouseMove);
      this.add(this.PyBranch.create({x: 560, y: 510, scaleX: 80, scaleY: 80, lvl: 1}));
    },

    function orient() {
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

    function distance(x, y) { return Math.sqrt(x*x + y*y); }
  ],

  listeners: [
    function onMouseMove(e) {
      this.heightFactor = (1 - e.clientY / this.height) * 0.8;
      this.lean         = e.clientX / this.width - 0.5;
      this.orient();
    }
  ]
});


PyTreeCView.create().write();
