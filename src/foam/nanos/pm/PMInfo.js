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
      tableWidth: 70
    },
    {
      class: 'Duration',
      name: 'minTime',
      aliases: ['min'],
      label: 'Min'
    },
    {
      class: 'Duration',
      name: 'average',
      label: 'Avg',
      aliases: ['avg'],
      getter: function() { return (this.totalTime / this.count).toFixed(2); },
      javaGetter: `return (long) (Math.round( ( (float)getTotalTime() / (float)getCount() ) * 100.0 ) / 100.0);`,
      storageTransient: true
    },
    {
      class: 'Duration',
      name: 'maxTime',
      aliases: ['max'],
      label: 'Max'
    },
    {
      class: 'Long',
      name: 'totalTime',
      label: 'Total',
      aliases: ['total'],
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
  ],

  methods: [
    {
      name: 'fold',
      type: 'void',
      args: [ 'PM pm' ],
      javaCode: `
      if ( pm.getTime() < getMinTime() ) setMinTime(pm.getTime());
      if ( pm.getTime() > getMaxTime() ) setMaxTime(pm.getTime());

      setCount(getCount() + 1);
      setTotalTime(getTotalTime() + pm.getTime());
      `
    },
    {
      name: 'reduce',
      type: 'void',
      args: [ 'PMInfo other' ],
      javaCode: `
        setCount(getCount() + other.getCount());
        setTotalTime(getTotalTime() + other.getTotalTime());
        setMinTime(Math.min(getMinTime(), other.getMinTime()));
        setMaxTime(Math.max(getMaxTime(), other.getMaxTime()));
        if ( foam.util.SafetyUtil.isEmpty(other.getCaptureTrace()) ) {
          setCaptureTrace(other.getCaptureTrace());
          setCapture(false);
        }
      `
    }
  ]
});
