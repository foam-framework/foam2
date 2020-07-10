foam.CLASS({
  package: 'foam.u2.svg.arrow',
  name: 'ArrowHead',
  extends: 'foam.u2.Element',

  properties: [
    {
      name: 'nodeName',
      value: 'G'
    },
    {
      name: 'originPos',
      class: 'Array'
    },
    {
      name: 'angle',
      class: 'Float'
    },
    {
      name: 'size',
      class: 'Float'
    }
  ],
});

foam.CLASS({
  package: 'foam.u2.svg.arrow',
  name: 'SimpleArrowHead',
  extends: 'foam.u2.svg.arrow.ArrowHead',

  methods: [
    function initE() {
      this.SUPER();
      var a1 = this.angle + Math.PI + Math.PI/4;
      var a2 = this.angle + Math.PI - Math.PI/4;
      this
        .start('line')
          .attrs({
            x1: this.originPos[0],
            y1: this.originPos[1],
            x2: this.originPos[0] + Math.sin(a1) * this.size,
            y2: this.originPos[1] + Math.cos(a1) * this.size,
            stroke: 'black' // TODO: prop
          })
        .end()
        .start('line')
          .attrs({
            x1: this.originPos[0],
            y1: this.originPos[1],
            x2: this.originPos[0] + Math.sin(a2) * this.size,
            y2: this.originPos[1] + Math.cos(a2) * this.size,
            stroke: 'black' // TODO: prop
          })
        .end()
        ;
    }
  ]
})