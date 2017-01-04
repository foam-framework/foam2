foam.CLASS({
  name: 'PyBranch',
  extends: 'foam.u2.Element',

  requires: [ 'PyBranch' ],

  imports: [ 'lScale', 'rScale', 'lTransform', 'rTransform', 'maxLvl' ],

  properties: [ 'w', 'transform', 'lvl' ],

  methods: [
    function initE() {
      this.setNodeName('g').
        attrs({transform: this.transform}).
        start('rect').
          setID('').
          attrs({width: 1, height: 1}).
          style({fill: this.fillColor(this.lvl)}).
        end();

      if ( this.lvl < this.maxLvl ) {
        var lW = this.w * this.lScale, rW = this.w * this.rScale;
        if ( lW > 1 ) this.add(this.PyBranch.create({w: lW, lvl: this.lvl+1, transform: this.lTransform}));
        if ( rW > 1 ) this.add(this.PyBranch.create({w: rW, lvl: this.lvl+1, transform: this.rTransform}));
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
    function initE() {
      this.setNodeName('svg').
        style({border: '1px solid lightgray'}).
        attrs({width: 1200, height: 600}).
        on('mousemove', this.onMouseMove).
        add(this.slot(function(heightFactor, lean) {
          var a = Math.atan2(heightFactor, .5-lean);
          var b = Math.atan2(heightFactor, .5+lean);

          this.lScale = Math.sqrt(heightFactor**2 + (.5-lean)**2);
          this.rScale = Math.sqrt(heightFactor**2 + (.5+lean)**2);

          this.lTransform = 'scale(' + this.lScale.toFixed(2) + ') translate(0 -1) rotate(' + this.radToDeg(-a) + ' 0 1)';
          this.rTransform = 'translate(1 0) scale(' + this.rScale.toFixed(2) + ') translate(-1 -1) rotate(' + this.radToDeg(b) + ' 1 1)';

          return this.PyBranch.create({lvl: 1, w: 80, transform: 'translate(560 510) scale(80)'});
        }));
    },

    function radToDeg(r) { return Math.floor(180*r/Math.PI); }
  ],

  listeners: [
    {
      name: 'onMouseMove',
      code: function(e) {
        this.heightFactor = (1 - e.clientY / this.getAttribute('height')) * 0.8;
        this.lean         = e.clientX / this.getAttribute('width') - 0.5;
      }
    }
  ]
});


PyTree.create().write();

