/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS( {
  package: 'foam.graphics',
  name: 'BarGraph',
  extends: 'foam.graphics.GraphH',

  properties: [
    [ 'columnGap', 0 ],
    [ 'columnMaxLength', 1 ],
    [ 'columnWidth', 0 ],
    [ 'graphColors' ], 
  ],

  methods: [
    function initCView( x, y, dataSource, graphColors, columnWidth, columnGap, w, h, columnMaxLength ) {

      var legendBox, legendLabel;
      var dataSourceN = this.dataSource.normalized();
      this.columnGap = this.columnGap * this.dataSource.LegendEntries.length;

      for ( var i in this.dataSource.Horizontal ) {
        legendBoxUnit = foam.graphics.Box.create( {
          x: this.x - ( this.columnWidth * 2 ),
          y: this.y - ( this.columnGap * i ) - this.columnWidth / 2,
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
        this.selected = this.add( legendBoxUnit, legendLabelUnit );
        this.invalidate();
      }

      for ( var key in this.dataSource.LegendEntries ) {
        legendBox = foam.graphics.Box.create( {
          x: this.x + ( this.columnGap * key ),
          y: this.y + this.columnWidth,
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
          font: this.fontLabel, 
          color: this.textColor,
          text: this.dataSource.LegendEntries[ key ].seriesName
        } );
        this.selected = this.add( legendBox, legendLabel );
        this.invalidate();

        var legendBoxUnit;
        var total = this.dataSource.LegendEntries[ key ].total

        for ( var i in this.dataSource.LegendEntries[ key ].seriesValues ) {
          var presentationBoxH = foam.graphics.Box.create( {
            x: this.x,
            y: this.y - ( ( this.columnGap * i + 30 ) ) - ( key * 30 ),
            width: this.w || dataSourceN.LegendEntries[ key ].seriesValues[ i ] * this.columnMaxLength,
            height: this.h || 30,
            color: this.graphColors[ i ] || '#ffffff',
            border: this.borderColor
          } );

          LabelData = foam.graphics.Label.create( {
            align: this.align,
            x: presentationBoxH.x + presentationBoxH.width + this.columnWidth / 2,
            y: presentationBoxH.y + this.columnWidth / 2,
            font: this.fontValue, 
            color: this.textColor, 
            text: this.symbol ? this.dataSource.LegendEntries[ key ].seriesValues[ i ] + this.symbol : this.dataSource.LegendEntries[ key ].seriesValues[ i ] 
          } );
          this.selected = this.add( presentationBoxH, LabelData );
          this.invalidate();
        }
      }
      this.createAxis( this.x, this.y, this.lengthX, this.lengthY );
    }
  ]
} );
