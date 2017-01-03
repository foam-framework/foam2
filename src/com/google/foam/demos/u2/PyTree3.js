foam.CLASS({
  name: 'PyBranch',
  extends: 'foam.u2.Element',

  requires: [ 'PyBranch' ],

  imports: [ 'ltScale', 'rtScale', 'ltTransform', 'rtTransform', 'maxLvl' ],

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

      if ( this.lvl < this.maxLvl ) {
        this.add(
          this.PyBranch.create({w: this.w * this.ltScale, lvl: this.lvl+1, transform: this.ltTransform}),
          this.PyBranch.create({w: this.w * this.rtScale, lvl: this.lvl+1, transform: this.rtTransform}));
      }
    }
  ]
});


foam.CLASS({
  name: 'PyTree',
  extends: 'foam.u2.Element',

  requires: [ 'PyBranch' ],

  exports: [ 'ltScale', 'rtScale', 'ltTransform', 'rtTransform', 'maxLvl' ],

  properties: [
    { name: 'heightFactor', value: 0.55 },
    { name: 'lean', value: 0 },
    { name: 'maxLvl', value: 11 },
    'ltScale',
    'rtScale',
    'ltTransform',
    'rtTransform'
  ],

  methods: [
    function initE() {
      this.SUPER();

      this.setNodeName('svg').
        attrs({width: 1600, height: 800}).
        on('mousemove', this.onMouseMove).
        add(this.slot(function(heightFactor, lean) {
          var hf      = this.heightFactor;
          var a       = Math.atan2(hf, .5-lean);
          var b       = Math.atan2(hf, .5+lean);
          var ltScale = this.rtScale = Math.sqrt(hf**2 + (.5+lean)**2);
          var rtScale = this.ltScale = Math.sqrt(hf**2 + (.5-lean)**2);

          this.ltTransform = 'translate(0 ' + (-ltScale) + ') rotate(' + this.radToDeg(-a) + ' 0 ' + ltScale + ') scale(' + ltScale + ')';
          this.rtTransform = 'translate(' + Math.cos(a)*ltScale + ' ' + (-rtScale - Math.sin(a)*ltScale) + ') rotate(' + this.radToDeg(b) + ' 0 ' + rtScale + ') scale(' + rtScale + ')';

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

