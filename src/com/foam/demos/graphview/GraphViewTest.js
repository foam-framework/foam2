/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS( {
  package: 'com.foam.demos.graphview',
  name: 'GraphViewTest',
  extends: 'foam.u2.Element',

  requires: [
    'foam.graphics.Box',
    'foam.graphics.Circle',
  ],

  exports: [ 'as data' ],

  constants: {
    SELECTED_COLOR: '#ddd',
    UNSELECTED_COLOR: 'white'
  },

  properties: [
    /*{
      name: 'canvas',
      factory: function() {
        return this.Box.create({width: 600, height: 500, color: '#f3f3f3'});
      }
    },*/
  ],

  methods: [
    function initE() {
      this.SUPER();

      this.
      add( com.google.foam.demos.graphview.GraphView.create( {} ) );
    }
  ]
} );

foam.CLASS( {
  package: 'com.google.foam.demos.graphview',
  name: 'GraphView',
  extends: 'foam.u2.View',

  requires: [
    'foam.graphics.Box',
    'foam.graphics.BarGraph',
    'foam.graphics.ColumnGraph',
    'foam.graphics.DataSource',
    'foam.graphics.PieGraph',
    'foam.graphics.PlotGraph',
  ],

  axioms: [
    foam.u2.CSS.create( {
      code: function () {
        /*
              ^ {
                background: #607d8b;
                border: none;
                border-radius: 2px;
                color: white;
                display: block;
                margin: 10px;
                padding: 30px 20px;
                text-align: center;
                min-width: 100px;
              }
              ^:hover {
                background: #eee;
                color: #607d8b;
              }
        	  ^:Box {
                background: #eee;
                color: #607d8b;
              }
        	  ^ .foam-u2-ActionView-onClick{
                position: relative;
                top: -40px;
                width: 125px;
                cursor: pointer;
                opacity: 0.01;
              }
              */
      }
    } )
  ],

  properties: [ {
      name: 'elementMap'
    },
    {
      name: 'elementSelectedInGraphMap'
    },
    {
      name: 'canvas'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this.elementSelectedInGraphMap = new Map();
      var dataSource = foam.graphics.DataSource.create( {} );

      dataSource.Horizontal = [ 'Nov 07', 'NOV 08', 'NOV 09' ];

      dataSource.LegendEntries[ 0 ] = foam.graphics.LegendEntries.create( {} );
      dataSource.LegendEntries[ 0 ].seriesName = 'Day';
      dataSource.LegendEntries[ 0 ].seriesValues = [ 10, 20, 30, 20, 20 ] 

      dataSource.LegendEntries[ 1 ] = foam.graphics.LegendEntries.create( {} );
      dataSource.LegendEntries[ 1 ].seriesName = 'Month';
      dataSource.LegendEntries[ 1 ].seriesValues = [ 0.0212, 0.0964, 0.3690, 1.00, 1.5, 1.7, 1.8 ];

      dataSource.LegendEntries[ 2 ] = foam.graphics.LegendEntries.create( {} );
      dataSource.LegendEntries[ 2 ].seriesName = 'Years';
      dataSource.LegendEntries[ 2 ].seriesValues = [ 0.5, 0.2, 1.2, 1.1, 1.5, 1.7, 1.8 ];

      var graphColors = [ '#d81e05', '#093649', '#59a5d5', '#2cab70' ];

      var highlightedValues = [ 0.25, 0.5, 0.75 ]
      var colors = [ '#d71c06', '#2cab70', '#59a5d5' ]
      var labels = [ 'Average Minimum', 'Average', 'Average Maximum' ]

      var dataToHighlight = {
        values: highlightedValues,
        colors: colors,
        labels: labels
      }

      var axisUnit = [ 0.25, 0.5, 0.75, 1 ]

      var gap = 30;
      var margin = 1.3;
      var lengthX = 792,
        lengthY = 300;
      var columnMaxLength = 200; 

      var w, h;

      var presentationSelectCircle = foam.graphics.PieGraph.create( {
        x: 150,
        y: 150,
        seriesValues: dataSource.LegendEntries[ 0 ].seriesValues,
        radius: 200,
        margin: margin,
        graphColors: graphColors, 
        symbol: '%',
        fontValue: '16px Roboto'
      } ); //support just one set of values
      this.add( presentationSelectCircle );

      var presentationColumnGraph = foam.graphics.ColumnGraph.create( {
        x: 150,
        y: 250,
        dataSource: dataSource,
        graphColors: graphColors,
        columnWidth: 30,
        columnGap: gap,
        columnMaxLength: columnMaxLength,
        lengthX: lengthX,
        lengthY: lengthY,
        dataToHighlight: dataToHighlight,
        axisUnit: axisUnit,
        symbol: 'M',
        textColor: '#093649',
        lineDash: [ 10, 12 ]
      } );
      this.add( presentationColumnGraph );

      var presentationPlotGraph = foam.graphics.PlotGraph.create( {
        x: 150,
        y: 350,
        dataSource: dataSource,
        radius: 4,       
        pointGap: gap,
        w: w,
        h: h,
        columnMaxLength: columnMaxLength,
        lengthX: lengthX,
        lengthY: lengthY,
        dataToHighlight: dataToHighlight,
        axisUnit: axisUnit,
        color: '#093649',
        symbol: 'M',
        lineDash: [ 10, 12 ]
      } );      
      this.canvas = presentationPlotGraph;

      var presentationBarGraph = foam.graphics.BarGraph.create( {
        x: 150,
        y: 450,
        dataSource: dataSource,
        graphColors: graphColors,
        columnWidth: 30,
        columnGap: gap,
        w: w,
        h: h,
        columnMaxLength: columnMaxLength,
        symbol: '%',
        lengthX: lengthX,
        lengthY: lengthY,
        color: '#093649',
        bgTextColor: '#ffffff'
      } );
      this.add( presentationBarGraph );

      this.addClass( this.myClass() ).start( this.canvas ).
      on( 'click', this.onClick ).
      end()
    },
  ],

  listeners: [
    function onClick( evt ) {
      var x = evt.offsetX,
        y = evt.offsetY;

      var c = this.canvas.findFirstChildAt( x, y );

      if ( c == undefined || c == this.canvas ) {
        return;
      }
      var xd, yd;
      var xc = c.x;
      var yc = c.y;

      //Delete the last selected element from the graph

      for ( var [ key, value ] of this.elementSelectedInGraphMap.entries() ) {
        for ( var i in value ) {
          if ( value[ i ] !== undefined ) {
            if ( i == 0 ) {
              xd = value[ i ].x;
              yd = value[ i ].y;
            }
            this.selected = this.canvas.remove( value[ i ] );
          }
        }
      }
      this.canvas.invalidate();
      this.elementSelectedInGraphMap.clear();

      var presentationSelectCircle, BoxInfo, BoxInfoData;
      for ( var [ key, value ] of this.canvas.elementMap.entries() ) {

        if ( key.x === xc && key.y === yc ) {

          presentationSelectCircle = foam.graphics.Circle.create( {
            x: xc,
            y: yc,
            radius: 8,
            border: 'black',
            color: '#093649'
          } );

          //TODO
          //opacity: 0.04;
          BoxHighlightedPoint = foam.graphics.Box.create( {
            x: xc - 50 || 277,
            y: this.canvas.y - 250,
            width: 99.1,
            height: 294.1,
            color: '#232425' || this.UNSELECTED_COLOR,
            border: 'black'
          } );

          BoxInfo = foam.graphics.Box.create( {
            x: xc - 20 || 277,
            y: yc - 100,
            width: 74,
            height: 58,
            color: '#093649' || this.UNSELECTED_COLOR,
            border: 'black'
          } );
          BoxInfoData = foam.graphics.Label.create( {
            align: 'center',
            x: BoxInfo.x + 1 || 0,
            y: BoxInfo.y + 1,
            color: '#ffffff',
            font: '16px Roboto',
            width: 50 || 200,
            height: 19 || 30,
            text: value
          } );
          this.selected = this.canvas.addChildren( BoxInfo, BoxInfoData );

          this.selected = this.canvas.addChildren( presentationSelectCircle ); //TODO ,BoxHighlightedPoint
        }
      }

      this.elementSelectedInGraphMap.set( {
        x: xc,
        y: yc
      }, [ presentationSelectCircle, BoxInfo, BoxInfoData ] ); //TODO ,BoxHighlightedPoint
    }
  ]
} );
