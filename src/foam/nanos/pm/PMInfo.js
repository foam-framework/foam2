/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.pm',
  name: 'PMInfo',

  documentation: 'Performance Measurement database entry.',

  ids: [ 'clsName', 'name' ],

  tableColumns: [ 'clsName', 'name', 'count', 'minTime', 'maxTime', 'average', 'totalTime' ],

  searchColumns: [ 'clsName', 'name' ],

  properties: [
    {
      class: 'String',
      name: 'clsName',
      label: 'Class'
    },
    {
      class: 'String',
      name: 'name',
    },
    {
      class: 'Int',
      name: 'count',
      label: 'Count'
    },
    {
      class: 'Duration',
      name: 'minTime',
      label: 'Min'
    },
    {
      class: 'Duration',
      name: 'average',
      label: 'Avg',
      getter: function() { return (this.totalTime / this.count).toFixed(2); },
      javaGetter: `return (long) Math.round( ( getTotalTime() / getCount() ) * 100 ) / 100;`,
      transient: true
    },
    {
      class: 'Duration',
      name: 'maxTime',
      label: 'Max'
    },
    {
      class: 'Long',
      name: 'totalTime',
      label: 'Total',
      tableCellFormatter: { class: 'foam.nanos.pm.PMTemperatureCellFormatter' }
    },
    {
      class: 'Boolean',
      name: 'capture'
    },
    {
      class: 'Code',
      name: 'captureTrace',
      readPermissionRequired: true,
      writePermissionRequired: true
    }
  ]
});
