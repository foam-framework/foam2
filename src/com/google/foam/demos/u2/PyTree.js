foam.CLASS({
  name: 'PyTree',
  extends: 'foam.u2.Element',

  properties: [
    { class: 'Float', name: 'w', value: 80 },
    { class: 'Float', name: 'x' },
    { class: 'Float', name: 'y' },
    { class: 'Float', name: 'rotate', value: 0 },
    { name: 'heightFactor', value: 0.5 },
    { name: 'lvl', value: 1 },
    { name: 'maxlvl', value: 7 }
  ],

  methods: [
    function initE() {
      this.SUPER();

      var x = this.x, y = this.y, rotate = this.rotate;
      this.setNodeName('g').
          attrs({transform: 'translate(' + this.x + ' ' + this.y + ') rotate(' + this.rotate + ')'}).
          start('rect').
            attrs({width: this.w, height: this.w, x: 0, y: 0}).
            style({fill: 'hsl(' + this.lvl/this.maxlvl*360 + ',70%,70%)'}).
          end();

      if ( this.lvl < this.maxlvl ) {
        this.add(this.cls_.create({
          x: 0,
          y: -this.w * this.heightFactor,
          w: this.w * this.heightFactor,
          lvl: this.lvl+1,
          maxlvl: this.maxlvl,
          heightFactor: this.heightFactor,
        }));
        this.add(this.cls_.create({
          x: this.w/2,
          y: -this.w * this.heightFactor,
          w: this.w * this.heightFactor,
          lvl: this.lvl+1,
          maxlvl: this.maxlvl,
          heightFactor: this.heightFactor,
        }));
      }
    }
  ]
});


var tree = PyTree.create();
foam.__context__.E('svg').style({padding: 500}).add(tree).write();
