/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS( {
  package: 'foam.graphics',
  name: 'DataSource',
  extends: 'foam.core.Property',

  documentation: 'DataSource is composed by [ Horizontal [ String ] , LegendEntries [ seriesName : String, seriesValues [ Float ] ]',

  properties: [ {
      class: 'Array',
      of: 'String',
      name: 'Horizontal' //Horizontal or Axis Labels [String]
    },
    {
      class: 'Array',
      of: 'foam.graphics.LegendEntries',
      name: 'LegendEntries'
    }, //LegendEntries  [ name ,  value [ float ] ]
    {
      name: 'max',
      factory: function () {
        var max = 0;
        for ( var key = 0; key < this.LegendEntries.length; key++ ) {
          maxSet = this.LegendEntries[ key ].seriesValues.reduce( function ( a, b ) {
            return Math.max( a, b );
          } );
          if ( max < maxSet )
            max = maxSet;
        }
        return max;
      }
    }
  ],

  methods: [
    function normalized() {
      var dataSourceNormalized = foam.graphics.DataSource.create( {} );
      dataSourceNormalized.Horizontal = this.Horizontal.slice();

      for ( var key = 0; key < this.LegendEntries.length; key++ ) {
        dataSourceNormalized.LegendEntries[ key ] = foam.graphics.LegendEntries.create( {} );
        for ( var i in this.LegendEntries[ key ].seriesValues ) {
          dataSourceNormalized.LegendEntries[ key ].seriesValues[ i ] = this.LegendEntries[ key ].seriesValues[ i ] / this.max;
        }
      }
      return dataSourceNormalized
    },
  ]
} );

foam.CLASS( {
  package: 'foam.graphics',
  name: 'LegendEntries',
  extends: 'foam.core.Property',

  documentation: 'LegendEntries  [ name ,  value [ float ] ]',

  properties: [ {
      class: 'String',
      name: 'seriesName'
    },
    {
      class: 'Array',
      of: 'Float',
      name: 'seriesValues'
    },
    {
      name: 'total',
      factory: function () {
        return this.seriesValues.reduce( ( prev, curr ) => prev + curr );
      }
    }
  ],
} );

foam.CLASS( {
  package: 'foam.graphics',
  name: 'Graph',
  extends: 'foam.graphics.CView',

  properties: [
    [ 'align', 'left' ],
    [ 'axisColor', 'black' ],
    [ 'axisLineWidth', 2 ],
    [ 'borderColor', 'black' ],
    [ 'borderTextColor', '#ffffff' ],
    [ 'bgTextColor', '#ffffff' ],
    {
      name: 'dataSource',
      required: true
    },
    [ 'fontLabel', '12px Roboto' ],
    [ 'fontValue', '14px Roboto' ],
    [ 'h', 0 ],
    [ 'height', 500 ],
    [ 'lengthY', 0 ],
    [ 'lengthX', 0 ],
    [ 'symbol' ],
    [ 'textColor', 'black' ],
    [ 'w', 0 ],
    [ 'width', 500 ],
  ],

  methods: [

  ]
} );

foam.CLASS( {
  package: 'foam.graphics',
  name: 'GraphV',
  extends: 'foam.graphics.Graph',

  documentation: '',

  properties: [
    [ 'lineDash', [ 10, 12 ] ],
  ],

  methods: [
    function createAxis( x, y, lengthX, lengthY, axisColor, axisLineWidth ) {
      var XLine, YLine;

      XLine = foam.graphics.Line.create( {
        startX: x,
        startY: y,
        endX: x + lengthX,
        endY: y,
        color: this.axisColor,
        lineWidth: this.axisLineWidth
      } );

      YLine = foam.graphics.Line.create( {
        startX: x,
        startY: y - lengthY,
        endX: x,
        endY: y,
        color: this.axisColor,
        lineWidth: this.axisLineWidth
      } );
      this.selected = this.add( XLine, YLine );
    },

    function axisLabels( x, y, w, h, columnMaxLength, symbol, max, Margin, axisUnit, align, textColor, bgTextColor, borderTextColor ) {

      for ( i = 0; i < axisUnit.length; i++ ) {
        var legendBoxUnit = foam.graphics.Box.create( {
          x: x - ( Margin * 2 ),
          y: -columnMaxLength * axisUnit[ i ] + y - ( Margin / 2 ),
          width: w || 32,
          height: h || 16,
          color: this.bgTextColor,
          border: this.borderTextColor
        } );

        //TODO added those properties
        //line-height: 1.33;
        //letter-spacing: 0.2px;
        var legendLabelUnit = foam.graphics.Label.create( {
          align: this.align,
          x: legendBoxUnit.x,
          y: legendBoxUnit.y,
          font: this.fontLabel,
          width: w || 0,
          height: h || 0,
          color: this.textColor || this.UNSELECTED_COLOR, //add the prop UNSELECTED_COLOR
          text: symbol ? max * axisUnit[ i ] + ' ' + symbol : max * axisUnit[ i ]
        } );
        this.selected = this.add( legendBoxUnit, legendLabelUnit );
      }
    },

    function dashedLinesIndicator( x, y, w, h, columnMaxLength, lengthX, dataToHighlight, align, lineDash ) {

      for ( i = 0; i < dataToHighlight.values.length; i++ ) {

        var dashedLine = foam.graphics.Line.create( {
          startX: x,
          startY: -columnMaxLength * dataToHighlight.values[ i ] + y,
          endX: x + lengthX,
          endY: -columnMaxLength * dataToHighlight.values[ i ] + y,
          color: dataToHighlight.colors[ i ],
          lineWidth: this.axisLineWidth,
          lineDash: this.lineDash
        } );

        var legendLabelLineSeparator = foam.graphics.Label.create( {
          align: this.align,
          x: x,
          y: -columnMaxLength * dataToHighlight.values[ i ] + y - 15, 
          font: this.fontLabel,
          color: dataToHighlight.colors[ i ] || this.UNSELECTED_COLOR, 
          text: dataToHighlight.labels[ i ]
        } );

        this.selected = this.add( dashedLine, legendLabelLineSeparator );

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
    },
  ]
} );

foam.CLASS( {
  package: 'foam.graphics',
  name: 'GraphH',
  extends: 'foam.graphics.Graph',

  methods: [
    function createAxis( x, y, lengthX, lengthY, axisColor, axisLineWidth ) {
      var XLine, YLine;
      XLine = foam.graphics.Line.create( {
        startX: x,
        startY: y,
        endX: x + lengthY,
        endY: y,
        color: this.axisColor,
        lineWidth: this.axisLineWidth
      } );

      YLine = foam.graphics.Line.create( {
        startX: x,
        startY: y,
        endX: x,
        endY: y - lengthX,
        color: this.axisColor,
        lineWidth: this.axisLineWidth
      } );

      this.selected = this.add( XLine, YLine );
    },
  ]
} );

//PI
/*foam.CLASS( {
  package: 'foam.graphics',
  name: 'PieGraph',
  extends: 'foam.graphics.CView',

  requires: [
    'foam.graphics.CView',
    'foam.graphics.Box as Rectangle'
  ],

  implements: [ 'foam.physics.Physical' ],

  properties: [
    [ 'seriesValues' ],
    [ 'radius', 4 ],
    [ 'margin', 0 ],
    [ 'colors', 'black' ],
    [ 'symbol' ],
    [ 'width', 500 ],
    [ 'height', 500 ],
  ],

  methods: [
    function initCView( x, y, seriesValues, radius, margin, colors, symbol ) {
      var total = this.seriesValues.reduce( ( prev, curr ) => prev + curr );
      var startAng = 0;

      if ( this.seriesValues.length > 1 ) { // if more than two section
        var firstLine = foam.graphics.Line.create( {
          startX: this.x || 257,
          startY: this.y || 598.6,
          endX: Math.cos( 0 ) * this.radius + this.x || 1049,
          endY: Math.sin( 0 ) * this.radius + this.y || 598.6,
          color: 'black',
          lineWidth: 2
        } );
        this.selected = this.add( firstLine );
      }
      for ( var i in this.seriesValues ) {

        var circlePiePresentation = foam.graphics.Circle.create( {
          x: this.x,
          y: this.y,
          radius: this.radius,
          start: startAng,
          end: ( 2 * Math.PI * this.seriesValues[ i ] / total ) + startAng,
          border: 'black',
          color: this.colors[ i ] || '#FFFFFF'
        } );

        rayLine = foam.graphics.Line.create( {
          startX: this.x || 257,
          startY: this.y || 598.6,
          endX: Math.cos( startAng ) * this.radius + this.x || 1049,
          endY: Math.sin( startAng ) * this.radius + this.y || 598.6,
          color: 'black',
          lineWidth: 2
        } );

        InfoData = foam.graphics.Label.create( {
          align: 'center',
          x: Math.cos( ( 2 * Math.PI * this.seriesValues[ i ] / total / 2 ) + startAng ) * ( this.radius * this.margin ) + this.x,
          y: Math.sin( ( 2 * Math.PI * this.seriesValues[ i ] / total / 2 ) + startAng ) * ( this.radius * this.margin ) + this.y,
          color: 'black',
          font: '16px Roboto',
          width: 50,
          height: 19,
          text: this.seriesValues[ i ] + this.symbol
        } );
        startAng = circlePiePresentation.end;
        this.add( InfoData, rayLine, circlePiePresentation );
        this.invalidate();
      }
    }
  ]
} );*/

//Circle
/*foam.CLASS( {
  package: 'foam.graphics',
  name: 'PlotGraph',
  extends: 'foam.graphics.GraphV',

  requires: [
    'foam.graphics.CView',
    'foam.graphics.Box as Rectangle'
  ],

  properties: [
    [ 'radius', 0 ],
    [ 'pointGap', 0 ],
    [ 'columnMaxLength' ],
    [ 'dataToHighlight' ],
    [ 'axisUnit' ],
    {
      name: 'elementMap'
    },
  ],

  methods: [
    function initCView( x, y, dataSource, radius, pointGap, w, h, columnMaxLength, lengthX, lengthY, dataToHighlight, axisUnit ) {
      var legendBox, legendLabel;
      var legendBoxUnit, legendLabelUnit;
      var simpleMargin = this.pointGap;
      var dataSourceN = this.dataSource.normalized();

      this.elementMap = new Map();
      this.pointGap = this.pointGap * 2;

      this.createAxis( this.x, this.y, this.lengthX, this.lengthY );
      this.axisLabels( this.x, this.y, this.w, this.h, this.columnMaxLength, 'M', this.dataSource.max, simpleMargin, this.axisUnit );
      this.dashedLinesIndicator( this.x, this.y, this.w, this.h, this.columnMaxLength, this.lengthX, this.dataToHighlight );

      for ( var i in this.dataSource.Horizontal ) {
        legendBoxUnit = foam.graphics.Box.create( {
          x: this.x + ( this.pointGap * i ) || 266 + ( this.pointGap * i ),
          y: this.y + simpleMargin || 629,
          width: this.w || this.dataSource.Horizontal[ i ].length * 8,
          height: this.h || 16,
          color: '#ffffff' || this.UNSELECTED_COLOR,
          border: '#ffffff'
        } );

        //TODO add properties
        //line-height: 1.33;
        //letter-spacing: 0.2px;
        legendLabelUnit = foam.graphics.Label.create( {
          align: 'left',
          x: this.x + ( this.pointGap * i ) || 266 + ( this.pointGap * i ),
          y: this.y + simpleMargin || 629,
          font: '12px Roboto',
          color: '#093649',
          text: this.dataSource.Horizontal[ i ]
        } );

        this.selected = this.add( legendBoxUnit, legendLabelUnit );
        this.invalidate();
      }

      for ( var key in this.dataSource.LegendEntries ) {
        legendBox = foam.graphics.Box.create( {
          x: ( this.x - simpleMargin ) + ( this.pointGap * key ) || 220 + ( this.pointGap * key ),
          y: this.y - this.columnMaxLength - 30 || 250,
          width: this.w || this.dataSource.LegendEntries[ key ].seriesName.length * 8,
          height: this.h || 16,
          color: '#ffffff',
          border: '#ffffff'
        } );

        //TODO add properties
        //font-weight: bold;
        //letter-spacing: 0.2px;
        legendLabel = foam.graphics.Label.create( {
          align: 'left',
          x: ( this.x - simpleMargin ) + ( this.pointGap * key ) || 220 + ( this.pointGap * key ),
          y: this.y - this.columnMaxLength - 30 || 250,
          color: 'black',
          font: '14px Roboto',
          color: '#093649',
          text: this.dataSource.LegendEntries[ key ].seriesName
        } );
        this.selected = this.add( legendBox, legendLabel );
        this.invalidate();

        var lineP1P2;
        for ( var i in this.dataSource.LegendEntries[ key ].seriesValues ) {
          var presentationCircle = foam.graphics.Circle.create( {
            x: this.x + simpleMargin + ( this.pointGap * i ) || 277 + ( this.pointGap * i ),
            y: -this.columnMaxLength * dataSourceN.LegendEntries[ key ].seriesValues[ i ] + this.y || -this.columnMaxLength * dataSourceN.LegendEntries[ key ].seriesValues[ i ] + 598,
            radius: this.radius,
            border: 'black',
            color: '#093649'
          } );

          this.setData( presentationCircle.x, presentationCircle.y, this.dataSource.LegendEntries[ key ].seriesValues[ i ] );
          this.selected = this.add( presentationCircle );
          this.invalidate();
          if ( i > 0 ) {
            lineP1P2 = foam.graphics.Line.create( {
              startX: presentationCircle.x - ( this.pointGap ) || presentationCircle.x - ( this.pointGap ),
              startY: -this.columnMaxLength * dataSourceN.LegendEntries[ key ].seriesValues[ i - 1 ] + this.y || -this.columnMaxLength * dataSourceN.LegendEntries[ key ].seriesValues[ i - 1 ] + 598,
              endX: presentationCircle.x,
              endY: presentationCircle.y,
              color: 'black',
              lineWidth: 2
            } );
            this.selected = this.add( lineP1P2 );
            this.invalidate();
          }
        }
      }
    },
    function setData( mapDataX, mapDataY, info ) {
      this.elementMap.set( {
        x: mapDataX,
        y: mapDataY
      }, info );
    },
  ],

} );*/

//column
/*foam.CLASS( {
  package: 'foam.graphics',
  name: 'ColumnGraph',
  extends: 'foam.graphics.GraphV',

  requires: [
    'foam.graphics.CView',
    'foam.graphics.Box as Rectangle'
  ],
  implements: [ 'foam.physics.Physical' ],
  properties: [
    [ 'colors' ],
    [ 'columnGap', 0 ],
    [ 'columnMaxLength' ],
    [ 'columnWidth' ],
    [ 'dataToHighlight' ],
    [ 'axisUnit' ],
  ],

  methods: [
    function initCView( x, y, dataSource, colors, columnWidth, columnGap, w, h, columnMaxLength, lengthX, lengthY, axisUnit ) {
      var legendBox, legendLabel;
      var simpleMargin = this.columnGap;
      this.columnGap = this.columnGap * this.dataSource.LegendEntries.length;

      var dataSourceN = this.dataSource.normalized();
      this.createAxis( this.x, this.y, this.lengthX, this.lengthY );
      this.axisLabels( this.x, this.y, this.w, this.h, this.columnMaxLength, 'M', this.dataSource.max, simpleMargin, this.axisUnit );
      this.dashedLinesIndicator( this.x, this.y, this.w, this.h, this.columnMaxLength, this.lengthX, this.dataToHighlight );

      var legendBoxUnit, legendLabelUnit;
      for ( var i in this.dataSource.Horizontal ) {
        legendBoxUnit = foam.graphics.Box.create( {
          x: this.x + ( this.columnGap * i ) || 266 + ( this.columnGap * i ),
          y: this.y + this.columnWidth || 629,
          width: this.w || this.dataSource.Horizontal[ i ].length * 8,
          height: this.h || 16,
          color: '#ffffff',
          border: '#ffffff'
        } );

        //TODO add properties
        //line-height: 1.33;
        //letter-spacing: 0.2px;
        legendLabelUnit = foam.graphics.Label.create( {
          align: 'left',
          x: this.x + ( this.columnGap * i ) || 266 + ( this.columnGap * i ),
          y: this.y + this.columnWidth || 629,
          font: '12px Roboto',
          color: '#093649',
          text: this.dataSource.Horizontal[ i ]
        } );

        this.add( legendBoxUnit, legendLabelUnit );
        this.invalidate();
      }

      for ( var key in this.dataSource.LegendEntries ) {
        legendBox = foam.graphics.Box.create( {
          x: ( this.x - this.columnWidth ) + ( this.columnGap * key ) || 220 + ( this.columnGap * key ),
          y: this.y - this.columnMaxLength - 30 || 250,
          width: this.w || this.dataSource.LegendEntries[ key ].seriesName.length * 8,
          height: this.h || 16,
          color: '#ffffff',
          border: '#ffffff'
        } );

        //TODO add properties
        //font-weight: bold;
        //letter-spacing: 0.2px;
        legendLabel = foam.graphics.Label.create( {
          align: 'left',
          x: ( this.x - this.columnWidth ) + ( this.columnGap * key ) || 220 + ( this.columnGap * key ),
          y: this.y - this.columnMaxLength - 30 || 250,
          color: 'black',
          font: '14px Roboto',
          color: '#093649',
          text: this.dataSource.LegendEntries[ key ].seriesName
        } );
        this.selected = this.add( legendBox, legendLabel );
        this.invalidate();

        for ( var i in this.dataSource.LegendEntries[ key ].seriesValues ) {
          var presentationBox = foam.graphics.Box.create( {
            x: this.x + ( i * this.columnGap ) + ( 30 * key ) || 277 + ( ( this.columnGap * i ) - 15 ) + ( key * 30 ),
            y: this.y || 598, //
            width: this.w || 30,
            height: this.h || -this.columnMaxLength * dataSourceN.LegendEntries[ key ].seriesValues[ i ],
            color: this.colors[ i ] || '#ffffff',
            border: 'black'
          } );
          this.selected = this.add( presentationBox );
          this.invalidate();
        }
      }
    },
  ]
} );*/

//bar
/*foam.CLASS( {
  package: 'foam.graphics',
  name: 'BarGraph',
  extends: 'foam.graphics.GraphH',

  properties: [
    [ 'columnGap', 0 ],
    [ 'columnMaxLength' ],
    [ 'columnWidth', 0 ],
    [ 'colors' ],
    [ 'symbol', 0 ],
  ],

  methods: [
    function initCView( x, y, dataSource, colors, columnWidth, columnGap, w, h, columnMaxLength, symbol ) {

      var legendBox, legendLabel;
      var dataSourceN = this.dataSource.normalized();
      this.columnGap = this.columnGap * this.dataSource.LegendEntries.length;

      this.createAxis( this.x, this.y, this.lengthX, this.lengthY );

      for ( var i in this.dataSource.Horizontal ) {
        legendBoxUnit = foam.graphics.Box.create( {
          x: this.x - ( this.columnWidth * 2 ) || 266 + ( this.columnGap * i ),
          y: this.y - ( this.columnGap * i ) - this.columnWidth / 2 || 629,
          width: this.w || this.dataSource.Horizontal[ i ].length * 8,
          height: this.h || 16,
          color: '#ffffff',
          border: '#ffffff'
        } );

        //TODO add properties
        //line-height: 1.33;
        //letter-spacing: 0.2px;
        legendLabelUnit = foam.graphics.Label.create( {
          align: 'left',
          x: this.x - ( this.columnWidth * 2 ) || 266 + ( this.columnGap * i ),
          y: this.y - ( this.columnGap * i ) - this.columnWidth / 2 || 629,
          font: '12px Roboto',
          color: '#093649',
          text: this.dataSource.Horizontal[ i ]
        } );
        this.selected = this.add( legendBoxUnit, legendLabelUnit );
        this.invalidate();
      }

      for ( var key in this.dataSource.LegendEntries ) {
        legendBox = foam.graphics.Box.create( {
          x: this.x + this.columnWidth || 20 + ( this.columnGap * key ),
          y: this.y + ( this.columnGap * key ) || 250,
          width: this.w || this.dataSource.LegendEntries[ key ].seriesName.length * 8,
          height: this.h || 16,
          color: '#ffffff',
          border: '#ffffff'
        } );

        //TODO add properties
        //font-weight: bold;
        //letter-spacing: 0.2px;
        legendLabel = foam.graphics.Label.create( {
          align: 'left',
          x: this.x + ( this.columnGap * key ) || 220 + ( this.columnGap * key ),
          y: this.y + this.columnWidth || 250,
          color: 'black',
          font: '14px Roboto',
          color: '#093649',
          text: this.dataSource.LegendEntries[ key ].seriesName
        } );
        this.selected = this.add( legendBox, legendLabel );
        this.invalidate();

        var legendBoxUnit;
        var total = this.dataSource.LegendEntries[ key ].total

        for ( var i in this.dataSource.LegendEntries[ key ].seriesValues ) {
          var presentationBoxH = foam.graphics.Box.create( {
            x: this.x || 277,
            y: this.y - ( ( this.columnGap * i + 30 ) ) - ( key * 30 ) || 598 + ( ( this.columnGap * i ) - 15 ) + ( key * 30 ),
            width: this.w || dataSourceN.LegendEntries[ key ].seriesValues[ i ] * this.columnMaxLength,
            height: this.h || 30,
            color: this.colors[ i ] || '#ffffff',
            border: 'black'
          } );

          LabelData = foam.graphics.Label.create( {
            align: 'left',
            x: presentationBoxH.x + presentationBoxH.width + this.columnWidth / 2 || 266 + ( columnGap * i ),
            y: presentationBoxH.y + this.columnWidth / 2 || 629,
            color: presentationBoxH.color,
            font: '12px Roboto',
            color: '#093649',
            text: this.dataSource.LegendEntries[ key ].seriesValues[ i ] + this.symbol
          } );
          this.selected = this.add( presentationBoxH, LabelData );
          this.invalidate();
        }
      }
    }
  ]
} );*/
