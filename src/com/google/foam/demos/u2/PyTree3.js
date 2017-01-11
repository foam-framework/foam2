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
          attrs({width: 1, height: 1}).
          style({fill: this.fillColor(this.lvl)}).
        end();

      if ( this.lvl < this.maxLvl ) {
        this.add(this.PyBranch.create({lvl: this.lvl+1}).cssClass('l'));
        this.add(this.PyBranch.create({lvl: this.lvl+1}).cssClass('r'));
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
    'heightFactory', 'lean', 'css',
    { name: 'maxLvl', value: 11 },
  ],

  methods: [
    function initE() {
      this.installCSS('');
      this.css = this.document.head.lastChild;

      this.setNodeName('svg').
        style({border: '1px solid lightgray'}).
        attrs({width: 1200, height: 600}).
        on('mousemove', this.onMouseMove).
        add(this.PyBranch.create({lvl: 1, w: 80}).attrs({transform: 'translate(560 510) scale(80)'}));

      this.redraw();
    }
  ],

  listeners: [
    {
      name: 'redraw',
      isFramed: true,
      code: function() {
        var heightFactor = this.heightFactor, lean = this.lean;
        var a = Math.atan2(heightFactor, .5+lean);
        var b = Math.atan2(heightFactor, .5-lean);
        var lScale = Math.sqrt(heightFactor**2 + (.5+lean)**2);
        var rScale = Math.sqrt(heightFactor**2 + (.5-lean)**2);

        this.css.innerText =
          '.l { transform: scale(' + lScale + ') rotate(' + -a + 'rad) translate(0, -1px) }\n' +
          '.r { transform: translate(1px, 0) scale(' + rScale + ') rotate(' + b + 'rad) translate(-1px, -1px) }';
      }
    },

    function onMouseMove(e) {
      this.heightFactor = (1 - e.offsetY / this.getAttribute('height')) * 0.8;
      this.lean         = e.offsetX / this.getAttribute('width') - 0.5;
      this.redraw();
    }
  ]
});
