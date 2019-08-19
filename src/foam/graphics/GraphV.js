/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.graphics',
  name: 'GraphV',
  extends: 'foam.graphics.Graph',

  documentation: '',

  properties: [
    [ 'lineDash', [ 10, 12 ] ]
  ],

  methods: [
    function createAxis( x, y, lengthX, lengthY, axisColor, axisLineWidth ) {
      var XLine, YLine;

      XLine = foam.graphics.Line.create({
        startX:    x,
        startY:    y,
        endX:      x + lengthX,
        endY:      y,
        color:     this.axisColor,
        lineWidth: this.axisLineWidth
      });

      YLine = foam.graphics.Line.create({
        startX:    x,
        startY:    y - lengthY,
        endX:      x,
        endY:      y,
        color:     this.axisColor,
        lineWidth: this.axisLineWidth
      });
      this.selected = this.add(XLine, YLine);
    },

    function axisLabels(x, y, w, h, columnMaxLength, symbol, max, Margin, axisUnit, align, textColor, bgTextColor, borderTextColor) {

      for ( i = 0 ; i < axisUnit.length ; i++ ) {
        var legendBoxUnit = foam.graphics.Box.create({
          x:     x - ( Margin * 2 ),
          y:     -columnMaxLength * axisUnit[ i ] + y - ( Margin / 2 ),
          width:  w || 32,
          height: h || 16,
          color:  this.bgTextColor,
          border: this.borderTextColor
        });

        //TODO added those properties
        //line-height: 1.33;
        //letter-spacing: 0.2px;
        var legendLabelUnit = foam.graphics.Label.create({
          align:  this.align,
          x:      legendBoxUnit.x,
          y:      legendBoxUnit.y,
          font:   this.fontLabel,
          width:  w || 0,
          height: h || 0,
          color:  this.textColor || this.UNSELECTED_COLOR, //add the prop UNSELECTED_COLOR
          text:   symbol ? max * axisUnit[ i ] + ' ' + symbol : max * axisUnit[ i ]
        });
        this.selected = this.add( legendBoxUnit, legendLabelUnit );
      }
    },

    function dashedLinesIndicator( x, y, w, h, columnMaxLength, lengthX, dataToHighlight, align, lineDash ) {

      for ( i = 0; i < dataToHighlight.values.length; i++ ) {
        var dashedLine = foam.graphics.Line.create({
          startX:    x,
          startY:    -columnMaxLength * dataToHighlight.values[ i ] + y,
          endX:      x + lengthX,
          endY:      -columnMaxLength * dataToHighlight.values[ i ] + y,
          color:     dataToHighlight.colors[ i ],
          lineWidth: this.axisLineWidth,
          lineDash:  this.lineDash
        });

        var legendLabelLineSeparator = foam.graphics.Label.create({
          align: this.align,
          x:     x,
          y:     -columnMaxLength * dataToHighlight.values[ i ] + y - 15,
          font:  this.fontLabel,
          color: dataToHighlight.colors[ i ] || this.UNSELECTED_COLOR,
          text:  dataToHighlight.labels[ i ]
        });

        this.selected = this.add(dashedLine, legendLabelLineSeparator);
      }
      //  width: 792px;
      //	height: 2px;
      //opacity: 0.2;
      /* lastLine = foam.graphics.Line.create( {
         startX: x ,
         startY: -columnMaxLength * 1 + y ,
         endX: x + lengthX ,
         endY: -columnMaxLength * 1 + y ,
         color: '#232425',
         lineWidth: this.axisLineWidth//
       } );
       this.selected = this.add( lastLine );*/
    }
  ]
});
