foam.CLASS({
  package: 'foam.u2.svg.arrow',
  name: 'ArrowLine',
  extends: 'foam.u2.Element',

  properties: [
    {
      name: 'nodeName',
      value: 'G'
    },
    {
      name: 'startPos',
      class: 'Array'
    },
    {
      name: 'endPos',
      class: 'Array'
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.svg.arrow',
  name: 'VHVArrowLine',
  extends: 'foam.u2.svg.arrow.ArrowLine',

  methods: [
    function initE() {
      console.log('amaline', this)
      this.SUPER();
      var dy = Math.abs(this.endPos[1] - this.startPos[1]);
      var dx = Math.abs(this.endPos[0] - this.startPos[0]);
      var lines = [
        // x1 y1 x2 y2
        [
          this.startPos[0],
          this.startPos[1],
          this.startPos[0],
          this.startPos[1] + 0.5 * dy,
        ],
        [
          this.endPos[0],
          this.endPos[1] - 0.5 * dy,
          this.endPos[0],
          this.endPos[1],
        ],
        [
          this.startPos[0],
          this.startPos[1] + 0.5 * dy,
          this.endPos[0],
          this.endPos[1] - 0.5 * dy,
        ],
      ];
      this
        .forEach(lines, function (line) {
          this
            .start('line')
              .attrs({
                x1: line[0],
                y1: line[1],
                x2: line[2],
                y2: line[3],
                stroke: 'black' // TODO: prop
              })
            .end()
            ;
        })
        ;
    }
  ]
});