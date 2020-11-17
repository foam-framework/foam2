/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.export',
  name: 'TableExportDriver',
  implements: [ 'foam.nanos.export.ExportDriver' ],

  requires: [
    'foam.nanos.column.TableColumnOutputter'
  ],

  properties: [
    {
      name: 'outputter',
      hidden: true,
      factory: function() {
        return this.TableColumnOutputter.create();
      },
      flags: ['js']
    },
    {
      name: 'columnHandler',
      class: 'FObjectProperty',
      of: 'foam.nanos.column.CommonColumnHandler',
      factory: function() {
        return foam.nanos.column.CommonColumnHandler.create();
      },
      hidden: true,
      flags: ['js']
    },
    {
      name: 'columnConfigToPropertyConverter',
      factory: function() {
        if ( ! this.__context__.columnConfigToPropertyConverter )
          return foam.nanos.column.ColumnConfigToPropertyConverter.create();
        return this.__context__.columnConfigToPropertyConverter;
      },
      hidden: true,
      flags: ['js']
    },
  ],

  methods: [
    async function exportFObjectAndReturnTable(X, obj, propNames) {
      var propToColumnMapping = this.columnConfigToPropertyConverter.returnPropertyColumnMappings(obj.cls_, propNames);
      var propertyNamesToQuery = this.columnHandler.returnPropNamesToQuery(propToColumnMapping);

      return await this.outputter.objectToTable(X, obj.cls_, propertyNamesToQuery, obj, propNames.length);
    },
    async function exportDAOAndReturnTable(X, dao, propNames) {
      var propToColumnMapping = this.columnConfigToPropertyConverter.returnPropertyColumnMappings(dao.of, propNames);
      var propertyNamesToQuery = this.columnHandler.returnPropNamesToQuery(propToColumnMapping);
      
      var expr = ( foam.nanos.column.ExpressionForArrayOfNestedPropertiesBuilder.create() ).buildProjectionForPropertyNamesArray(dao.of, propertyNamesToQuery);
      var sink = await dao.select(expr);
      return await this.outputter.returnTable(X, dao.of, propertyNamesToQuery, sink.projection, propNames.length, true);
    },
    function getPropName(X, of) {
      var propNames = X.filteredTableColumns ? X.filteredTableColumns : this.outputter.getAllPropertyNames(of);
      return this.columnConfigToPropertyConverter.filterExportedProps(of, propNames);
    }
  ]
});
