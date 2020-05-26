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
    function exportFObject(X, obj) {
      var allColumns = obj.cls_.getAxiomsByClass(foam.core.Property).map(p => p.name);
      var props = X.filteredTableColumns ? X.filteredTableColumns.filter(c => allColumns.includes(c.split('.')[0])) : this.outputter.getAllPropertyNames(obj.cls_);

      var outputter  = this.TableColumnOutputter.create();
      return outputter.objectToTable(X, obj.cls_, props, obj).then( ( values ) => {
        var ouputter = foam.nanos.column.CSVTableOutputter.create();
        return ouputter.arrayToCSV(values);
      });
    },
    function exportDAO(X, dao) {
      var allColumns = dao.of.getAxiomsByClass(foam.core.Property).map(p => p.name);
      var columnConfig = X.columnConfigToPropertyConverter;
      var props = X.filteredTableColumns ? X.filteredTableColumns.filter(c => allColumns.includes(c.split('.')[0])) : this.outputter.getAllPropertyNames(dao.of);
      var outputter  = this.TableColumnOutputter.create();
      var expr = ( foam.nanos.column.ExpressionForArrayOfNestedPropertiesBuilder.create() ).buildExpr(dao.of, props);
      return dao.select(expr).then( (values) => {
        return outputter.returnTable(X, dao.of, props, values.array).then( values => {
          var ouputter = foam.nanos.column.CSVTableOutputter.create();
          return ouputter.arrayToCSV(values);
        }); 
      });
    }
  ]
});
