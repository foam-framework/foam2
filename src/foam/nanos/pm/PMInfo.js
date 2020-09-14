/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.pm',
  name: 'PMInfo',

  documentation: 'Performance Measurement database entry.',

  ids: [ 'key', 'name' ],

  tableColumns: [ 'key', 'name', 'count', 'minTime', 'average', 'maxTime', 'totalTime' ],

  searchColumns: [ 'key', 'name' ],

  properties: [
    {
      class: 'String',
      name: 'key',
      label: 'Class',
      tableWidth: 170,
      tableCellFormatter: function(cls) {
        // strip out common prefixes to make easier to read in TableView
        this.add(cls.replace(/foam\./,'').replace(/dao\.|http\.|pool\.|boot\.|ruler\.|script\./,'').replace(/ThreadPoolAgency\$/,'').replace(/nanos\./,''));
      }
    },
    {
      class: 'String',
      name: 'name',
      tableWidth: 320
    },
    {
      class: 'Int',
      name: 'count',
      label: 'Count',
      tableWidth: 60
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
      javaGetter: `return (long) (Math.round( ( (float)getTotalTime() / (float)getCount() ) * 100.0 ) / 100.0);`,
      storageTransient: true
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
