/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.column',
  name: 'CSVTableExportDriver',
  implements: [ 'foam.nanos.export.ExportDriver' ],

  requires: [
    'foam.nanos.column.TableColumnOutputter'
  ],

  methods: [
    async function exportFObject(X, obj) {
      var columnConfig = X.columnConfigToPropertyConverter;

      var props = X.filteredTableColumns ? X.filteredTableColumns : this.outputter.getAllPropertyNames(obj.cls);
      props = columnConfig.filterExportedProps(obj.cls_, props);

      var outputter  = this.TableColumnOutputter.create();
      return outputter.objectToTable(X, obj.cls_, columnConfig.returnProperties(obj.cls_, props), obj).then( ( values ) => {
        var ouputter = foam.nanos.column.CSVTableOutputter.create();
        return ouputter.arrayToCSV(values);
      });
    },
    async function exportDAO(X, dao) {
      var columnConfig = X.columnConfigToPropertyConverter;

      var props = X.filteredTableColumns ? X.filteredTableColumns : this.outputter.getAllPropertyNames(dao.of);
      props = columnConfig.filterExportedProps(dao.of, props);

      var outputter  = this.TableColumnOutputter.create();
      var expr = ( foam.nanos.column.ExpressionForArrayOfNestedPropertiesBuilder.create() ).buildExpr(dao.of, props);
      return dao.select(expr).then( (values) => {
        return outputter.returnTable(X, dao.of, columnConfig.returnProperties(dao.of, props), values.array).then( values => {
          var ouputter = foam.nanos.column.CSVTableOutputter.create();
          return ouputter.arrayToCSV(values);
        }); 
      });
    }
  ]
});
