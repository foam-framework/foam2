/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS( {
  package: 'foam.graphics',
  name: 'PlotGraph',
  extends: 'foam.graphics.GraphV',

  requires: [
    'foam.graphics.Box',
    'foam.graphics.CView'
  ],

  properties: [
    [ 'axisUnit' ],
    [ 'color' ],
    [ 'columnMaxLength' ],
    {
      name: 'elementMap'
    },
    [ 'lineColor', 'black' ],
    [ 'lineWidth', 2 ],
    [ 'dataToHighlight' ],
    [ 'pointGap', 0 ],
    [ 'radius', 0 ],
  ],

  methods: [
    function initCView( x, y, dataSource, radius, pointGap, w, h, columnMaxLength, lengthX, lengthY, dataToHighlight, axisUnit, color, lineColor, lineWidth ) { 
      var legendBox, legendLabel;
      var legendBoxUnit, legendLabelUnit;
      var simpleMargin = this.pointGap;
      var dataSourceN = this.dataSource.normalized();

      this.elementMap = new Map();
      this.pointGap = this.pointGap * 2;

      for ( var i in this.dataSource.Horizontal ) {
        legendBoxUnit = foam.graphics.Box.create( {
          x: this.x + ( this.pointGap * i ),
          y: this.y + simpleMargin,
          width: this.w || this.dataSource.Horizontal[ i ].length * 8,
          height: this.h || 16,
          color: this.bgTextColor || '#ffffff',
          border: this.borderTextColor
        } );

        //TODO add properties
        //line-height: 1.33;
        //letter-spacing: 0.2px;
        legendLabelUnit = foam.graphics.Label.create( {
          align: this.align,
          x: legendBoxUnit.x,
          y: legendBoxUnit.y,
          font: this.fontLabel,
          color: this.color,
          text: this.dataSource.Horizontal[ i ]
        } );

        this.selected = this.add( legendBoxUnit, legendLabelUnit );
        this.invalidate();
      }

      for ( var key in this.dataSource.LegendEntries ) {
        legendBox = foam.graphics.Box.create( {
          x: ( this.x - simpleMargin ) + ( this.pointGap * key ),
          y: this.y - this.columnMaxLength - 30,
          width: this.w || this.dataSource.LegendEntries[ key ].seriesName.length * 8,
          height: this.h || 16,
          color: this.bgTextColor,
          border: this.borderTextColor
        } );

        //TODO add properties
        //font-weight: bold;
        //letter-spacing: 0.2px;
        legendLabel = foam.graphics.Label.create( {
          align: this.align,
          x: legendBox.x,
          y: legendBox.y,
          color: this.lineColor,
          font: this.fontLabel,
          color: this.color,
          text: this.dataSource.LegendEntries[ key ].seriesName
        } );
        this.selected = this.add( legendBox, legendLabel );
        this.invalidate();

        var lineP1P2;
        for ( var i in this.dataSource.LegendEntries[ key ].seriesValues ) {
          var presentationCircle = foam.graphics.Circle.create( {
            x: this.x + simpleMargin + ( this.pointGap * i ),
            y: -this.columnMaxLength * dataSourceN.LegendEntries[ key ].seriesValues[ i ] + this.y,
            radius: this.radius,
            border: this.borderColor,
            color: this.color
          } );

          this.setData( presentationCircle.x, presentationCircle.y, this.dataSource.LegendEntries[ key ].seriesValues[ i ] ); //TODO add the mapping property for all graph
          this.selected = this.add( presentationCircle );
          this.invalidate();
          if ( i > 0 ) {
            lineP1P2 = foam.graphics.Line.create( {
              startX: presentationCircle.x - ( this.pointGap ),
              startY: -this.columnMaxLength * dataSourceN.LegendEntries[ key ].seriesValues[ i - 1 ] + this.y,
              endX: presentationCircle.x,
              endY: presentationCircle.y,
              color: this.lineColor,
              lineWidth: this.lineWidth
            } );
            this.selected = this.add( lineP1P2 );
            this.invalidate();
          }
        }
      }
      this.createAxis( this.x, this.y, this.lengthX, this.lengthY );
      this.axisLabels( this.x, this.y, this.w, this.h, this.columnMaxLength, this.symbol, this.dataSource.max, simpleMargin, this.axisUnit );
      this.dashedLinesIndicator( this.x, this.y, this.w, this.h, this.columnMaxLength, this.lengthX, this.dataToHighlight, this.lineDash );
    },
    function setData( mapDataX, mapDataY, info ) { 
      this.elementMap.set( {
        x: mapDataX,
        y: mapDataY
      }, info );
    },
  ],

} );
