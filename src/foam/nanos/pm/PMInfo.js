/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// TODO: rename properties to use camelCase
foam.CLASS({
  package: 'foam.nanos.pm',
  name: 'PMInfo',

  documentation: 'Performance Measurement database entry.',

  ids: [ 'clsname', 'pmname' ],

  searchColumns: [ ],

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
      tableCellFormatter: {
        class: {
          requires: [ 'foam.nanos.pm.TemperatureCView' ],
          methods: [
            function format(e, value, obj, axiom) {
              e.tag({ class: 'foam.nanos.pm.TemperatureCView', totalTime: value })
            }
          ]
        }
      }
    }
  ]
});
