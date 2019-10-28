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
      tableCellFormatter: { class: 'foam.nanos.pm.PMTemperatureCellFormatter' }
    },
    {
      class: 'Boolean',
      name: 'capture'
    },
    {
      class: 'String',
      name: 'captureTrace',
      view: { class: 'io.c9.ace.Editor' },
      readPermissionRequired: true,
      writePermissionRequired: true
    }
  ],

  
});
