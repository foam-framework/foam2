/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.graphics',
  name: 'GraphH',
  extends: 'foam.graphics.Graph',

  methods: [
    function createAxis( x, y, lengthX, lengthY, axisColor, axisLineWidth ) {
      var XLine, YLine;
      XLine = foam.graphics.Line.create({
        startX: x,
        startY: y,
        endX: x + lengthY,
        endY: y,
        color: this.axisColor,
        lineWidth: this.axisLineWidth
      });

      YLine = foam.graphics.Line.create({
        startX: x,
        startY: y,
        endX: x,
        endY: y - lengthX,
        color: this.axisColor,
        lineWidth: this.axisLineWidth
      });

      this.selected = this.add(XLine, YLine);
    }
  ]
});
