/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
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
        for ( var key = 0 ; key < this.LegendEntries.length ; key++ ) {
          maxSet = this.LegendEntries[ key ].seriesValues.reduce(function (a, b ) {
            return Math.max( a, b );
          });
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
    }
  ]
});
