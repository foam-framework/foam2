/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.pm',
  name: 'PMInfo',

  documentation: 'Performance Measurement database entry.',

  ids: [ 'clsname', 'pmname' ],

  properties: [
    {
      class: 'String',
      name: 'clsname',
      label: 'Class'
    },
    {
      class: 'String',
      name: 'pmname',
      label: 'Name'
    },
    {
      class: 'Int',
      name: 'numoccurrences',
      label: 'Count'
    },
    {
      class: 'Long',
      name: 'mintime',
      label: 'Min'
    },
    {
      class: 'Long',
      name: 'average',
      label: 'Avg',
      getter: function() { return (this.totaltime / this.numoccurrences).toFixed(2); },
      javaGetter: `return (long) Math.round( ( getTotaltime() / getNumoccurrences() ) * 100 ) / 100;`,
      transient: true
    },
    {
      class: 'Long',
      name: 'maxtime',
      label: 'Max'
    },
    {
      class: 'Long',
      name: 'totaltime',
      label: 'Total',
      tableCellFormatter: function(value) {
        this.tag({class: 'foam.nanos.pm.TemperatureCView'}).add(' ', value);
      }
    }
  ]
});
