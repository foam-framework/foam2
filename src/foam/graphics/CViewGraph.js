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
      name: 'Horizontal' //Horizontal or Axis Labals [String]
    },
    {
      class: 'Array',
      of: 'LegendEntries',
      name: 'LegendEntries'
    } //LegendEntries  [ name ,  value [ float ] ]
  ],

  methods: [
    function initE() {
      this.SUPER();
    }
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
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
    }
  ]
} );

foam.CLASS( {
  package: 'foam.graphics',
  name: 'PieGraph',
extends: 'foam.graphics.CView',

  properties: [],

  methods: [
    function initE() {
      this.SUPER();
    },

    function createPieGraph( x, y, LegendEntrie, radius, marge, color, symbole ) {
      var total = LegendEntrie.seriesValues.reduce( ( prev, curr ) => prev + curr );
      var startAng = 0;

      if ( LegendEntrie.seriesValues.length > 1 ) {// if more than two section
        var firstLine = foam.graphics.Line.create( { 
          startX: x || 257,
          startY: y || 598.6,
          endX: Math.cos( 0 ) * radius + x || 1049,
          endY: Math.sin( 0 ) * radius + y || 598.6,
          color: 'black',
          lineWidth: 2
        } );
        this.selected = this.canvas.add( firstLine );
      }
      for ( var i in LegendEntrie.seriesValues ) {

        var circlePiePresentation = foam.graphics.Circle.create( {
          x: x || 277 + ( step * i ),
          y: y,
          radius: radius,
          start: startAng,
          end: ( 2 * Math.PI * LegendEntrie.seriesValues[ i ] / total ) + startAng,
          border: 'black',
          color: color[ i ] || '#FFFFFF' // TODO issue : fill just some part of the circle.
        } );

        rayLine = foam.graphics.Line.create( {
          startX: x || 257,
          startY: y || 598.6,
          endX: Math.cos( startAng ) * radius + x || 1049,
          endY: Math.sin( startAng ) * radius + y || 598.6,
          color: 'black',
          lineWidth: 2
        } );

        InfoData = foam.graphics.Label.create( {
          align: 'center',
          x: Math.cos( ( 2 * Math.PI * LegendEntrie.seriesValues[ i ] / total / 2 ) + startAng ) * ( radius * marge ) + x,
          y: Math.sin( ( 2 * Math.PI * LegendEntrie.seriesValues[ i ] / total / 2 ) + startAng ) * ( radius * marge ) + y,
          color: 'black',
          font: '16px Roboto',
          width: 50 || 200,
          height: 19 || 30,
          text: LegendEntrie.seriesValues[ i ] + symbole
        } );
        startAng = circlePiePresentation.end;

        this.canvas.add( InfoData, rayLine, circlePiePresentation );
        this.canvas.invalidate;

      }
    }
  ]
} );

foam.CLASS( {
  package: 'foam.graphics',
  name: 'CircleGraph',
extends: 'foam.graphics.CView',

  methods: [
    function initE() {
      this.SUPER();
    },

    function createCircleGraph( x, y, dataSource, step, w, h, unit, radius, lengthY ) { 
      var legendBox, legendLabel;
      var margeD = 30;
      var distanceBtw2seriesName = 50;

      var legendBoxUnit, legendLabelUnit;

      for ( var i in dataSource.Horizontal ) {
        legendBoxUnit = this.Box.create( {
          x: x + ( step * i ) || 266 + ( step * i ),
          y: y + margeD || 629,
          width: w || dataSource.Horizontal[ i ].length * 8,
          height: h || 16,
          color: '#ffffff' || this.UNSELECTED_COLOR,
          border: '#ffffff'
        } );

        //TODO add properties
        //line-height: 1.33;
        //letter-spacing: 0.2px;
        legendLabelUnit = foam.graphics.Label.create( {
          align: 'left',
          x: x + ( step * i ) || 266 + ( step * i ),
          y: y + margeD || 629,
          font: '12px Roboto',
          color: '#093649' || this.UNSELECTED_COLOR,
          text: dataSource.Horizontal[ i ]
        } );

        this.selected = this.canvas.add( legendBoxUnit, legendLabelUnit );
        this.canvas.invalidate;
      }

      for ( var key in dataSource.LegendEntries ) {
        legendBox = this.Box.create( {
          x: ( x - margeD ) + ( step * key ) || 220 + ( step * key ),
          y: y - lengthY - distanceBtw2seriesName || 250,
          width: w || dataSource.LegendEntries[ key ].seriesName.length * 8,
          height: h || 16,
          color: '#ffffff' || this.UNSELECTED_COLOR,
          border: '#ffffff'
        } );

        //TODO add properties
        //font-weight: bold;
        //letter-spacing: 0.2px;
        legendLabel = foam.graphics.Label.create( {
          align: 'left',
          x: ( x - margeD ) + ( step * key ) || 220 + ( step * key ),
          y: y - lengthY - distanceBtw2seriesName || 250,
          color: 'black',
          font: '14px Roboto',
          color: '#093649' || this.UNSELECTED_COLOR,
          text: dataSource.LegendEntries[ key ].seriesName
        } );
        this.selected = this.canvas.add( legendBox, legendLabel );
        this.canvas.invalidate;

        var lineP1P2;
        for ( var i in dataSource.LegendEntries[ key ].seriesValues ) {
          var presentationCircle = foam.graphics.Circle.create( {
            x: x + margeD + ( step * i ) || 277 + ( step * i ),
            y: -unit * dataSource.LegendEntries[ key ].seriesValues[ i ] + y || -unit * dataSource.LegendEntries[ key ].seriesValues[ i ] + 598,
            radius: radius,
            border: 'black',
            color: '#093649'
          } );

          this.setData( presentationCircle.x, presentationCircle.y, dataSource.LegendEntries[ key ].seriesValues[ i ] );
          this.selected = this.canvas.add( presentationCircle );
          this.canvas.invalidate;
          if ( i > 0 ) {
            lineP1P2 = foam.graphics.Line.create( {
              startX: presentationCircle.x - ( step ) || presentationCircle.x - ( step ),
              startY: -unit * dataSource.LegendEntries[ key ].seriesValues[ i - 1 ] + y || -unit * dataSource.LegendEntries[ key ].seriesValues[ i - 1 ] + 598,
              endX: presentationCircle.x || presentationCircle.x,
              endY: presentationCircle.y || presentationCircle.y,
              color: 'black',
              lineWidth: 2
            } );
            this.selected = this.canvas.add( lineP1P2 );
            this.canvas.invalidate;
          }
        }
      }
    }
  ]
} );
//TODO if we really need a box behind each text.
foam.CLASS( {
  package: 'foam.graphics',
  name: 'ColumnGraph',
extends: 'foam.graphics.CView',

  methods: [
    function initE() {
      this.SUPER();
    },

    function createColumnGraph( x, y, dataSource, color, step, w, h, unit, lengthY ) {
      var legendBox, legendLabel;
      var margeD = 30;
      var distanceBtw2seriesName = 50;
      var singleStep = 30;

      var legendBoxUnit, legendLabelUnit3;
      for ( var i in dataSource.Horizontal ) {
        legendBoxUnit = this.Box.create( {
          x: x + ( step * i ) || 266 + ( step * i ),
          y: y + margeD || 629,
          width: w || dataSource.Horizontal[ i ].length * 8,
          height: h || 16,
          color: '#ffffff' || this.UNSELECTED_COLOR,
          border: '#ffffff'
        } );

        //TODO add properties
        //line-height: 1.33;
        //letter-spacing: 0.2px;
        legendLabelUnit3 = foam.graphics.Label.create( {
          align: 'left',
          x: x + ( step * i ) || 266 + ( step * i ),
          y: y + margeD || 629,
          font: '12px Roboto',
          color: '#093649' || this.UNSELECTED_COLOR,
          text: dataSource.Horizontal[ i ]
        } );

        this.selected = this.canvas.add( legendBoxUnit, legendLabelUnit3 );
        this.canvas.invalidate;
      }

      for ( var key in dataSource.LegendEntries ) {
        legendBox = this.Box.create( {
          x: ( x - margeD ) + ( step * key ) || 220 + ( step * key ),
          y: y - lengthY - distanceBtw2seriesName || 250,
          width: w || dataSource.LegendEntries[ key ].seriesName.length * 8,
          height: h || 16,
          color: '#ffffff' || this.UNSELECTED_COLOR,
          border: '#ffffff'
        } );

        //TODO add properties
        //font-weight: bold;
        //letter-spacing: 0.2px;
        legendLabel = foam.graphics.Label.create( {
          align: 'left',
          x: ( x - margeD ) + ( step * key ) || 220 + ( step * key ),
          y: y - lengthY - distanceBtw2seriesName || 250,
          color: 'black',
          font: '14px Roboto',
          color: '#093649' || this.UNSELECTED_COLOR,
          text: dataSource.LegendEntries[ key ].seriesName
        } );
        this.selected = this.canvas.add( legendBox, legendLabel );
        this.canvas.invalidate;

        for ( var i in dataSource.LegendEntries[ key ].seriesValues ) {
          var presentationBox = foam.graphics.Box.create( {
            x: x + ( i * step ) + ( 30 * key ) || 277 + ( ( step * i ) - 15 ) + ( key * 30 ),
            y: y || 598, //
            width: w || 30,
            height: h || -unit * dataSource.LegendEntries[ key ].seriesValues[ i ],
            color: color[ i ] || '#ffffff', //this.UNSELECTED_COLOR,
            border: 'black'
          } );
          this.selected = this.canvas.add( presentationBox );
          this.canvas.invalidate;
        }
      }
    },
  ]
} );

foam.CLASS( {
  package: 'foam.graphics',
  name: 'BarGraph',
extends: 'foam.graphics.CView',

  methods: [
    function initE() {
      this.SUPER();
    },

    function createBarGraph( x, y, dataSource, step, w, h, unit, maxLength, color, symbole ) {      
      var margeD = 30;
      var legendBox, legendLabel;

      for ( var i in dataSource.Horizontal ) {
        legendBoxUnit = this.Box.create( { 
          x: x - ( margeD * 2 ) || 266 + ( step * i ),
          y: y - ( step * i ) - margeD / 2 || 629,
          width: w || dataSource.Horizontal[ i ].length * 8,
          height: h || 16,
          color: '#ffffff' || this.UNSELECTED_COLOR,
          border: '#ffffff'
        } );

        //TODO add properties
        //line-height: 1.33;
        //letter-spacing: 0.2px;
        legendLabelUnit3 = foam.graphics.Label.create( { 
          align: 'left',
          x: x - ( margeD * 2 ) || 266 + ( step * i ),
          y: y - ( step * i ) - margeD / 2 || 629,
          font: '12px Roboto',
          color: '#093649' || this.UNSELECTED_COLOR,
          text: dataSource.Horizontal[ i ]
        } );
        this.selected = this.canvas.add( legendBoxUnit, legendLabelUnit3 );
        this.canvas.invalidate;
      }

      for ( var key in dataSource.LegendEntries ) {
        legendBox = this.Box.create( {
          x: x + margeD || 20 + ( step * key ),
          y: y + ( step * key ) || 250,
          width: w || dataSource.LegendEntries[ key ].seriesName.length * 8,
          height: h || 16,
          color: '#ffffff' || this.UNSELECTED_COLOR,
          border: '#ffffff'
        } );

        //TODO add properties
        //font-weight: bold;
        //letter-spacing: 0.2px;
        legendLabel = foam.graphics.Label.create( {
          align: 'left',
          x: x + ( step * key ) || 220 + ( step * key ),
          y: y + margeD || 250,
          color: 'black',
          font: '14px Roboto',
          color: '#093649' || this.UNSELECTED_COLOR,
          text: dataSource.LegendEntries[ key ].seriesName
        } );
        this.selected = this.canvas.add( legendBox, legendLabel );
        this.canvas.invalidate;
        var legendBoxUnit, legendLabelUnit3;

        var total = dataSource.LegendEntries[ key ].seriesValues.reduce( ( prev, curr ) => prev + curr );

        for ( var i in dataSource.LegendEntries[ key ].seriesValues ) {
          var presentationBoxH = foam.graphics.Box.create( {
            x: x || 277,
            y: y - ( ( step * i + 30 ) ) - ( key * 30 ) || 598 + ( ( step * i ) - 15 ) + ( key * 30 ),
            width: w || dataSource.LegendEntries[ key ].seriesValues[ i ] * unit,
            height: h || 30,
            color: color[ i ] || '#ffffff', //|| this.UNSELECTED_COLOR
            border: 'black'
          } );

          LabelData = foam.graphics.Label.create( {
            align: 'left',
            x: presentationBoxH.x + presentationBoxH.width + margeD / 2 || 266 + ( step * i ),
            y: presentationBoxH.y + margeD / 2 || 629,
            color: presentationBoxH.color,
            font: '12px Roboto',
            color: '#093649' || this.UNSELECTED_COLOR,
            text: dataSource.LegendEntries[ key ].seriesValues[ i ] + symbole
          } );
          this.selected = this.canvas.add( presentationBoxH, LabelData );
          this.canvas.invalidate;
        }
      }
    }
  ]
} );
