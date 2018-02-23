/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS( {
  package: 'foam.graphics',
  name: 'PieGraph',
  extends: 'foam.graphics.CView',

  requires: [
    'foam.graphics.Box',
    'foam.graphics.CView'
  ],

  properties: [
    [ 'align', 'center' ],
    [ 'fontValue', '16px Roboto' ],
    [ 'graphColors', 'black' ],
    [ 'h' ],
    [ 'height', 500 ],
    [ 'lineColor', 'black' ],
    [ 'lineWidth', 2 ],
    [ 'margin', 0 ],
    [ 'radius', 4 ],
    [ 'seriesValues' ],
    [ 'symbol' ],
    [ 'textColor', 'black' ],
    [ 'w' ],
    [ 'width', 500 ],
  ],

  methods: [
    function initCView( x, y, seriesValues, radius, margin, graphColors, symbol, lineColor, w, h, lineWidth, fontValue, align ) {
      var total = this.seriesValues.reduce( ( prev, curr ) => prev + curr );
      var startAng = 0;

      if ( this.seriesValues.length > 1 ) { // if more than two section
        var firstLine = foam.graphics.Line.create( {
          startX: this.x,
          startY: this.y,
          endX: Math.cos( 0 ) * this.radius + this.x,
          endY: Math.sin( 0 ) * this.radius + this.y,
          color: this.lineColor,
          lineWidth: this.lineWidth
        } );
        this.selected = this.add( firstLine );
      }
      for ( var i in this.seriesValues ) {

        var circlePiePresentation = foam.graphics.Arc.create( {
          x: this.x,
          y: this.y,
          radius: this.radius,
          start: startAng,
          end: ( 2 * Math.PI * this.seriesValues[ i ] / total ) + startAng,
          border: this.lineColor,
          color: this.graphColors[ i ] || '#FFFFFF'
        } );

        rayLine = foam.graphics.Line.create( {
          startX: this.x,
          startY: this.y,
          endX: Math.cos( startAng ) * this.radius + this.x,
          endY: Math.sin( startAng ) * this.radius + this.y,
          color: this.lineColor,
          lineWidth: this.lineWidth
        } );

        InfoData = foam.graphics.Label.create( {
          align: this.align,
          x: Math.cos( ( 2 * Math.PI * this.seriesValues[ i ] / total / 2 ) + startAng ) * ( this.radius * this.margin ) + this.x,
          y: Math.sin( ( 2 * Math.PI * this.seriesValues[ i ] / total / 2 ) + startAng ) * ( this.radius * this.margin ) + this.y,
          color: this.textColor,
          font: this.fontValue,
          width: w || 50,
          height: h || 19,
          text: symbol ? this.seriesValues[ i ] + this.symbol : this.seriesValues[ i ]
        } );
        startAng = circlePiePresentation.end;
        this.add( InfoData, rayLine, circlePiePresentation );
        this.invalidate();
      }
    }
  ]
} );
