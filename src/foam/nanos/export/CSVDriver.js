/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.export',
  name: 'CSVDriver',
  implements: [ 'foam.nanos.export.ExportDriver' ],

  requires: [
    'foam.dao.CSVSink',
    'foam.lib.csv.CSVOutputter'
  ],

  documentation: 'Class for exporting data from a FObject or DAO, to CSV.',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.lib.csv.CSVOutputter',
      name: 'outputter',
      factory: function() {
        return this.CSVOutputter.create();
      }
    }
  ],

  methods: [
    function exportFObject(X, obj) {
      // if obj coming in is not from a model with tableColumns,
      // the outputter will not recognize any columns.
      this.outputter.outputFObject(obj);
      return this.outputter.toString();
    },
    function exportDAO(X, dao) {
      var sink = X.data.filteredTableColumns ?
        this.CSVSink.create({ props: X.data.filteredTableColumns }) :
        this.CSVSink.create();
      // passing in our CSVSink runs our CSV outputter and
      // s.csv is accessing our csv property string.
      return dao.select(sink).then( (s) => s.csv );
    }
  ]
});
