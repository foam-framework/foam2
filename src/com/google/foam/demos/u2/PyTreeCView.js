foam.CLASS({
  name: 'PyBranch',
  extends: 'foam.graphics.CView',

  requires: [ 'PyBranch', 'foam.graphics.Box' ],

  imports: [ 'lScale', 'rScale', 'lTransform', 'rTransform', 'maxLvl' ],

  properties: [ 'w', 'transform', 'lvl' ],

  methods: [
    function init() {
      this.add(this.Box.create({width: 1, height: 1, color: this.fillColor(this.lvl)}));

      if ( this.lvl < this.maxLvl ) {
        var lW = this.w * this.lScale, rW = this.w * this.rScale;
        this.add(this.PyBranch.create({id: null, w: lW, lvl: this.lvl+1, transform: this.lTransform}));
        this.add(this.PyBranch.create({id: null, w: rW, lvl: this.lvl+1, transform: this.rTransform}));
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
  extends: 'foam.graphics.CView',

  requires: [ 'PyBranch', 'foam.graphics.Transform' ],

  exports: [ 'lScale', 'rScale', 'lTransform', 'rTransform', 'maxLvl' ],

  properties: [
    { name: 'heightFactor', value: 0.55 },
    { name: 'lean',         value: 0 },
    { name: 'maxLvl',       value: 11 },
    'lScale',
    'rScale',
    'lTransform',
    'rTransform'
  ],

  methods: [
    function init() {
      this.el().on('mousemove', this.onMouseMove);

      this.setNodeName('svg').
        style({border: '1px solid lightgray'}).
        attrs({width: 1200, height: 600}).
        add(this.slot(function(heightFactor, lean) {
          var a = Math.atan2(heightFactor, .5+lean);
          var b = Math.atan2(heightFactor, .5-lean);

          this.lScale = Math.sqrt(heightFactor**2 + (.5+lean)**2);
          this.rScale = Math.sqrt(heightFactor**2 + (.5-lean)**2);

          this.lTransform = this.Transform.create().
              scale(this.lScale, this.lScale).
              translate(0, -1).
              rotateAround(this.radToDeg(-a), 0, 1);

          this.rTransform = this.Transform.create().
              translate(1, 0).
              scale(this.rScale, this.rScale).
              translate(-1, -1).
              rotateAround(this.radToDeg(b), 1, 1);

          return this.PyBranch.create({lvl: 1, w: 80, transform: 'translate(560 510) scale(80)'});
        }));
    },

    function radToDeg(r) { return 180*r/Math.PI; }
  ],

  listeners: [
    function onMouseMove(e) {
      this.heightFactor = (1 - e.offsetY / this.getAttribute('height')) * 0.8;
      this.lean         = e.offsetX / this.getAttribute('width') - 0.5;
    }
]
});


PyTreeCView.create().write();
