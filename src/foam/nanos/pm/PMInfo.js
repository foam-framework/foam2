/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.pm',
  name: 'PMInfo',

  documentation: 'Performance Measurement database entry.',

  ids: [ 'clsName', 'pmName' ],

  searchColumns: [ ],

  properties: [
    {
      class: 'String',
      name: 'clsName',
      label: 'Class'
    },
    {
      class: 'String',
      name: 'pmName',
      label: 'Name'
    },
    {
      class: 'Int',
      name: 'count',
      label: 'Count'
    },
    {
      class: 'Long',
      name: 'minTime',
      label: 'Min'
    },
    {
      class: 'Long',
      name: 'average',
      label: 'Avg',
      getter: function() { return (this.totalTime / this.count).toFixed(2); },
      javaGetter: `return (long) Math.round( ( getTotalTime() / getCount() ) * 100 ) / 100;`,
      transient: true
    },
    {
      class: 'Long',
      name: 'maxTime',
      label: 'Max'
    },
    {
      class: 'Long',
      name: 'totalTime',
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
