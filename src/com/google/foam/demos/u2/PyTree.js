foam.CLASS({
  name: 'PyTree',
  extends: 'foam.u2.Element',

  properties: [
    { class: 'Float', name: 'w', value: 80 },
    { class: 'Float', name: 'x' },
    { class: 'Float', name: 'y' },
    { name: 'rotate' },
    { name: 'heightFactor', value: 0.6 },
    { name: 'lean', value: 0 },
    { name: 'lvl', value: 1 },
    { name: 'maxlvl', value: 9 }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this.setNodeName('g').
          attrs({transform: 'translate(' + this.x + ' ' + this.y + ') ' + this.rotate}).
          start('rect').
            attrs({width: this.w, height: this.w, x: 0, y: 0}).
            style({fill: 'hsl(' + this.lvl/this.maxlvl*360 + ',70%,70%)'}).
          end();

      if ( this.lvl < this.maxlvl ) {
        var lean      = this.lean, w = this.w;
        var trigH     = this.heightFactor * w;
        var nextRight = Math.sqrt(trigH**2 + (w * (.5+lean))**2);
        var nextLeft  = Math.sqrt(trigH**2 + (w * (.5-lean))**2);
        var A         = Math.atan(trigH / ((.5-lean) * w))*180/Math.PI;
        var B         = Math.atan(trigH / ((.5+lean) * w))*180/Math.PI;

//        console.log('****', nextRight, nextLeft, A, B);
        this.add(
            this.cls_.create({
              x: 0,
              y: -nextLeft,
              w: nextLeft,
              rotate: 'rotate(' + -A + ' 0 ' + nextLeft + ')',
              lvl: this.lvl+1,
              maxlvl: this.maxlvl,
              heightFactor: this.heightFactor,
              lean: this.lean
            }),
            this.cls_.create({
              x: 0,
              y: -nextRight,
              w: nextRight,
              rotate: 'rotate(' + B + ' ' + nextRight + ' ' + nextRight + ')',
              lvl: this.lvl+1,
              maxlvl: this.maxlvl,
              heightFactor: this.heightFactor,
              lean: this.lean
            }));
      }
    }
  ]
});


var tree = PyTree.create();
foam.__context__.E('svg').style({padding: 500}).add(tree).write();
