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
    'foam.lib.csv.CSVOutputterImpl',
    'foam.nanos.column.TableColumnOutputter'
  ],

  documentation: 'Class for exporting data from a FObject or DAO, to CSV.',

  methods: [
    function exportFObject(X, obj) {
      var outputter = this.CSVOutputterImpl.create();
      outputter.outputFObject(X, obj);
      return outputter.toString();
    },
    function exportDAO(X, dao) {
      var columnConfig = X.columnConfigToPropertyConverter;
      var outputter = this.TableColumnOutputter.create();

      var props = X.filteredTableColumns ? X.filteredTableColumns : outputter.getAllPropertyNames(dao.of);
      props = columnConfig.filterExportedProps(dao.of, props);

      return dao.select(this.CSVSink.create({
        of: dao.of,
        props: props
      }, X)).then( (s) => s.csv );
    }
  ]
});
