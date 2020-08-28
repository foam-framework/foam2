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
      }
    },
    {
      name: 'columnHandler',
      class: 'FObjectProperty',
      of: 'foam.nanos.column.CommonColumnHandler',
      factory: function() {
        return foam.nanos.column.CommonColumnHandler.create();
      }
    },
    {
      name: 'columnConfigToPropertyConverter',
      factory: function() {
        if ( ! this.__context__.columnConfigToPropertyConverter )
          return foam.nanos.column.ColumnConfigToPropertyConverter.create();
        return this.__context__.columnConfigToPropertyConverter;
      }
    }
  ],

  methods: [
    async function exportFObject(X, obj) {
      // var columnConfig = X.columnConfigToPropertyConverter;

      // var props = X.filteredTableColumns ? X.filteredTableColumns : this.outputter.getAllPropertyNames(obj.cls);
      // props = columnConfig.filterExportedProps(obj.cls_, props);

      // return this.outputter.objectToTable(X, obj.cls_, columnConfig.returnProperties(obj.cls_, props), obj).then( ( values ) => {
      //   var ouputter = foam.nanos.column.CSVTableOutputter.create();
      //   return ouputter.arrayToCSV(values);
      // });
    },
    async function exportDAO(X, dao) {
      var propNames = X.filteredTableColumns ? X.filteredTableColumns : this.outputter.getAllPropertyNames(dao.of);
      propNames = this.columnConfig.filterExportedProps(dao.of, propNames);
      var propToColumnMapping = this.columnConfigToPropertyConverter.returnPropertyColumnMappings(dao.of, propNames);
      var nastedPropertyNamesAndItsIndexes = this.columnHandler.buildArrayOfNestedPropertyNamesAndCorrespondingIndexesInArray(propertyNamesToQuery);
      //depending on props will retrive info about columns that are required to perform toSummary/toString/... 
      var propertyNamesToQuery = this.columnHandler.returnPropNamesToQuery(propToColumnMapping);
      
      var expr = ( foam.nanos.column.ExpressionForArrayOfNestedPropertiesBuilder.create() ).buildProjectionForPropertyNamesArray(dao.of, propertyNamesToQuery);
      var sink = await dao.select(expr);
      for ( var i = 0 ; i < sink.projection.length ; i++ ) {
        var nestedPropertyValues = this.columnHandler.filterOutValuesForNotNestedProperties(sink.projection[i], nastedPropertyNamesAndItsIndexes[1]);
        var nestedPropertiesObjsMap = this.columnHandler.groupObjectsThatAreRelatedToNestedProperties(dao.of, nastedPropertyNamesAndItsIndexes[0], nestedPropertyValues);
        var obj = sink.array[i];
        for ( var  j = 0 ; j < propNames.length ; j++  ) {
          var objForCurrentProperty = obj;
          var propName = this.columnHandler.checkIfArrayAndReturnPropertyNamesForColumn(propNames[j]);
          var prop = this.props.find(p => p.fullPropertyName === propName);
          //check if current column is a nested property
          //if so get object for it
          if ( prop && prop.fullPropertyName.includes('.') ) {
            objForCurrentProperty = nestedPropertiesObjsMap[this.columnHandler.getNestedPropertyNameExcludingLastProperty(prop.fullPropertyName)];
          }

          prop = prop ? prop.property : dao.of.getAxiomByName(propName);
        }
      }
    }
  ]
});
