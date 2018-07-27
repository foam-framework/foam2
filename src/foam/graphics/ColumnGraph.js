/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS( {
  package: 'foam.graphics',
  name: 'ColumnGraph',
  extends: 'foam.graphics.GraphV',

  requires: [
    'foam.graphics.Box', 
	'foam.graphics.CView'    
  ],
  
  properties: [
    [ 'axisUnit' ],
    [ 'columnGap', 0 ],
    [ 'columnMaxLength', 1 ],
    [ 'columnWidth' ],
    [ 'dataToHighlight' ],
    [ 'graphColors' ],
  ],

  methods: [
    function initCView( x, y, dataSource, graphColors, columnWidth, columnGap, w, h, columnMaxLength, lengthX, lengthY, axisUnit ) {
      var legendBox, legendLabel;
      var simpleMargin = this.columnGap;
      this.columnGap = this.columnGap * this.dataSource.LegendEntries.length;

      var dataSourceN = this.dataSource.normalized();

      var legendBoxUnit, legendLabelUnit;
      for ( var i in this.dataSource.Horizontal ) {
        legendBoxUnit = foam.graphics.Box.create( {
          x: this.x + ( this.columnGap * i ),
          y: this.y + this.columnWidth,
          width: this.w || this.dataSource.Horizontal[ i ].length * 8,
          height: this.h || 16,
          color: this.bgTextColor, 
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
          color: this.textColor, 
          text: this.dataSource.Horizontal[ i ]
        } );

        this.add( legendBoxUnit, legendLabelUnit );
        this.invalidate();
      }

      for ( var key in this.dataSource.LegendEntries ) {
        legendBox = foam.graphics.Box.create( {
          x: ( this.x - this.columnWidth ) + ( this.columnGap * key ) , 
          y: this.y - this.columnMaxLength - 30 , 
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
          font: this.fontValue, 
          color: this.textColor, 
          text: this.dataSource.LegendEntries[ key ].seriesName
        } );
        this.selected = this.add( legendBox, legendLabel );
        this.invalidate();

        for ( var i in this.dataSource.LegendEntries[ key ].seriesValues ) {
          var presentationBox = foam.graphics.Box.create( {
            x: this.x + ( i * this.columnGap ) + ( 30 * key ),
            y: this.y,
            width: this.w || 30,
            height: this.h || -this.columnMaxLength * dataSourceN.LegendEntries[ key ].seriesValues[ i ],
            color: this.graphColors[ i ] || '#ffffff', 
            border: this.borderColor 
          } );
          this.selected = this.add( presentationBox );
          this.invalidate();
        }
      }
      this.createAxis( this.x, this.y, this.lengthX, this.lengthY );
      this.axisLabels( this.x, this.y, this.w, this.h, this.columnMaxLength, this.symbol, this.dataSource.max, simpleMargin, this.axisUnit ,this.textColor, this.bgTextColor,this.borderTextColor ,this.fontLabel);
      this.dashedLinesIndicator( this.x, this.y, this.w, this.h, this.columnMaxLength, this.lengthX, this.dataToHighlight, this.align, this.fontLabel,this.lineDash );
    },
  ]
} );
