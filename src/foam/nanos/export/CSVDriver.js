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
      this.outputter.outputFObject(obj);
      return this.outputter.toString();
    },
    function exportDAO(X, dao) {
      return dao.select(this.CSVSink.create({
          of: dao.of,
          props: X.data.filteredTableColumns || undefined
        })).then( (s) => s.csv );
    }
  ]
});
