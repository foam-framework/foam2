/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'foam.nanos.export',
  name: 'CSVTableExportDriver',
  implements: [ 'foam.nanos.export.ExportDriver' ],

  requires: [
    'foam.nanos.column.TableColumnOutputter'
  ],

  properties: [
    {
      name: 'outputter',
      factory: function() {
        return this.TableColumnOutputter.create();
      }
    }
  ],

  methods: [
    async function exportFObject(X, obj) {
      var columnConfig = X.columnConfigToPropertyConverter;

      var props = X.filteredTableColumns ? X.filteredTableColumns : this.outputter.getAllPropertyNames(obj.cls);
      props = columnConfig.filterExportedProps(obj.cls_, props);

      return this.outputter.objectToTable(X, obj.cls_, columnConfig.returnProperties(obj.cls_, props), obj).then( ( values ) => {
        var ouputter = foam.nanos.column.CSVTableOutputter.create();
        return ouputter.arrayToCSV(values);
      });
    },
    async function exportDAO(X, dao) {
      var columnConfig = X.columnConfigToPropertyConverter;

      var propNames = X.filteredTableColumns ? X.filteredTableColumns : this.outputter.getAllPropertyNames(dao.of);
      propNames = columnConfig.filterExportedProps(dao.of, propNames);

      var expr = ( foam.nanos.column.ExpressionForArrayOfNestedPropertiesBuilder.create() ).buildProjectionForPropertyNamesArray(dao.of, propNames);
      return dao.select(expr).then( (values) => {
        return this.outputter.returnTable(columnConfig.returnProperties(dao.of, propNames), values.array).then( values => {
          var ouputter = foam.nanos.column.CSVTableOutputter.create();
          return ouputter.arrayToCSV(values);
        }); 
      });
    }
  ]
});
