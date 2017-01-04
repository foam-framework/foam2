foam.CLASS({
  name: 'PyBranch',
  extends: 'foam.u2.Element',

  requires: [ 'PyBranch' ],

  imports: [ 'lScale', 'rScale', 'lTransform', 'rTransform', 'maxLvl' ],

  properties: [ 'w', 'transform', 'lvl' ],

  methods: [
    function initE() {
      this.SUPER();

      this.setNodeName('g').
          attrs({transform: this.transform}).
          start('rect').
            attrs({width: 1, height: 1}).
            style({fill: 'hsl(' + this.lvl/this.maxLvl*180 + ',70%,70%)'}).
          end();

      if ( this.lvl < this.maxLvl && this.w > 5 ) {
        this.add(
          this.PyBranch.create({w: this.w * this.lScale, lvl: this.lvl+1, transform: this.lTransform}),
          this.PyBranch.create({w: this.w * this.rScale, lvl: this.lvl+1, transform: this.rTransform}));
      }
    }
  ]
});


foam.CLASS({
  name: 'PyTree',
  extends: 'foam.u2.Element',

  requires: [ 'PyBranch' ],

  exports: [ 'lScale', 'rScale', 'lTransform', 'rTransform', 'maxLvl' ],

  properties: [
    { name: 'heightFactor', value: 0.55 },
    { name: 'lean', value: 0 },
    { name: 'maxLvl', value: 11 },
    'lScale',
    'rScale',
    'lTransform',
    'rTransform'
  ],

  methods: [
    function initE() {
      this.SUPER();

      this.setNodeName('svg').
        attrs({width: 1600, height: 800}).
        on('mousemove', this.onMouseMove).
        add(this.slot(function(heightFactor, lean) {
          var a = Math.atan2(heightFactor, .5-lean);
          var b = Math.atan2(heightFactor, .5+lean);

          this.lScale = Math.sqrt(heightFactor**2 + (.5-lean)**2);
          this.rScale = Math.sqrt(heightFactor**2 + (.5+lean)**2);

          this.lTransform = 'scale(' + this.lScale + ') translate(0 -1) rotate(' + this.radToDeg(-a) + ' 0 1)';
          this.rTransform = 'translate(1 0) scale(' + this.rScale + ') translate(-1 -1) rotate(' + this.radToDeg(b) + ' 1 1)';

          return this.PyBranch.create({lvl: 1, w: 80, transform: 'translate(760 500) scale(80)'});
        }));
    },

    function radToDeg(r) { return 180*r/Math.PI; }
  ],

  listeners: [
    {
      name: 'onMouseMove',
      code: function(e) {
        this.heightFactor = e.clientY / this.getAttribute('height') * 0.8;
        this.lean         = e.clientX / this.getAttribute('width') - 0.5;
      }
    }
  ]
});


PyTree.create().write();

