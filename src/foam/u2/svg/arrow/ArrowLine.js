/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

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

foam.CLASS({
  package: 'foam.u2.svg.arrow',
  name: 'SegmentedArrowLine',
  extends: 'foam.u2.svg.arrow.ArrowLine',

  properties: [
    { name: 'anchors', class: 'Array' },
    { name: 'startPos', class: 'Array' },
    { name: 'endPos', class: 'Array' },
    {
      name: 'lines',
      expression: function(startPos, anchors, endPos) {
        anchors = [...anchors, endPos];
        var lines = [];
        let lastNode = startPos;
        for ( let anchor of anchors ) {
          lines.push([
            lastNode[0], lastNode[1], // x1, y1
            anchor[0]  , anchor[1]    // x2, y2
          ]);
          lastNode = anchor;
        }
        return lines;
      }
    },
    { name: 'hoverState', class: 'Boolean' },
    { name: 'toggleState', class: 'Boolean' },
    {
      name: 'stroke',
      expression: function (hoverState, toggleState) {
        return ( hoverState && toggleState ) ? 'cyan' :
          toggleState ? 'blue' :
          hoverState ? 'green' :
          'black';
      }
    },
    'testing'
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .on('mouseover', () => { this.hoverState = true })
        .on('mouseleave', () => { this.hoverState = false })
        .on('click', () => { this.toggleState = ! this.toggleState; })
        .forEach(this.lines, function (line) {
          this
            .start('line')
              .attrs({
                x1: line[0],
                y1: line[1],
                x2: line[2],
                y2: line[3],
                stroke: this.stroke$,
                'stroke-width': 3,
              })
            .end()
            ;
        })
        ;
    }
  ]
});
