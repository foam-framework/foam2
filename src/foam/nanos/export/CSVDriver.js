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
    'foam.lib.csv.CSVOutputterImpl'
  ],

  documentation: 'Class for exporting data from a FObject or DAO, to CSV.',

  methods: [
    function exportFObject(X, obj) {
      var outputter = this.CSVOutputterImpl.create();
      outputter.outputFObject(X, obj);
      return outputter.toString();
    },
    function exportDAO(X, dao) {
      return dao.select(this.CSVSink.create({
          of: dao.of,
          props: X.filteredTableColumns || undefined
        })).then( (s) => s.csv );
    }
  ]
});
