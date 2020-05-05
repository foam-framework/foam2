/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.export',
  name: 'GoogleSheetsOutputter',
  requires: [
    'foam.nanos.export.GoogleSheetsPropertyMetadata'
  ],
  methods: [
    {
      name: 'getColumnMethadata',
      type: 'foam.nanos.export.GoogleSheetsPropertyMetadata[]',
      code: function(x, cls, propNames) {
        var metadata = [];
        var props = [];
        if ( ! propNames ) {
          props = cls.getAxiomsByClass(foam.core.Property);
          propNames = props.map(p => p.name);
        } else {
          var columnConfig = x.columnConfigToPropertyConverter;
          for ( var i = 0; i < propNames.length ; i++ ) {
            props.push(columnConfig.returnProperty(cls, propNames[i]));
          }
        }
        
        for ( var i = 0 ; i < props.length ; i++ ) {
          if ( props[i].networkTransient )
            continue;
          if ( props[i].cls_.id === "foam.core.Action" )
            continue;
          
          metadata.push(this.returnMetadataForProperty(props[i], propNames[i]));
        }
        return metadata;
      }
    },
    {
      name: 'getAllPropertyNames',
      type: 'StringArray',
      code: function(cls) {
        var props = cls.getAxiomsByClass(foam.core.Property);
        var propNames = [];
        for ( var i = 0 ; i < props.length ; i++ ) {
          if ( ! props[i].networkTransient )
            propNames.push(props[i].name);
        }
        return propNames;
      }
    },
    {
      name: 'outputObjectForProperties',
      type: 'StringArray',
      code: async function(x, cls, obj, columnMetadata) {
        var values = [];
        var columnConfig = x.columnConfigToPropertyConverter;
        for (var i = 0 ; i < columnMetadata.length ; i++ ) {
          var val = columnConfig.returnValue(cls, columnMetadata[i].propName, obj);
          values.push(await this.returnValueForMethadata(val, columnMetadata[i]));
        }
        return values;
      }
    },
    {
      name: 'returnMetadataForProperty',
      code: function(prop, propName) {
          var cellType = 'STRING';
          var pattern = '';
          if ( prop.cls_.id === "foam.core.UnitValue" ) {
            cellType = 'CURRENCY';
            pattern = '\"$\"#0.00\" CAD\"';
          } else if ( prop.cls_.id === 'foam.core.Date' ) {
            cellType = 'DATE';
            pattern = 'yyyy-mm-dd';
          } else if ( prop.cls_.id === 'foam.core.DateTime' ) {
            cellType = 'DATE_TIME';
          } else if ( prop.cls_.id === 'foam.core.Time' ) {
            cellType = 'TIME';
          }

          return this.GoogleSheetsPropertyMetadata.create({
            columnName: prop.name,
            columnLabel: prop.label,
            columnWidth: prop.tableWidth ? prop.tableWidth : 0,
            cellType: cellType,
            pattern: pattern,
            propName: propName
          });
      }
    },
    {
      name: 'returnValueForMethadata',
      type: 'String',
      code: async function(obj, columnMethadata) {
        if ( obj[columnMethadata.columnName] ) {
          if ( columnMethadata.cellType === 'CURRENCY' ) {
            columnMethadata.perValuePatternSpecificValues.push(obj.destinationCurrency);
            return ( obj[columnMethadata.columnName] / 100 ).toString();
          }
          else if ( columnMethadata.cellType === 'DATE' )
            return obj[columnMethadata.columnName].toISOString().substring(0, 10);
          else if ( columnMethadata.cellType === 'DATE_TIME' ) {
            columnMethadata.perValuePatternSpecificValues.push(obj[columnMethadata.columnName].toString().substring(24));
            return obj[columnMethadata.columnName].toString().substring(0, 24);
          }
          else if ( columnMethadata.cellType === 'TIME' ) {
            columnMethadata.perValuePatternSpecificValues.push(obj[columnMethadata.columnName].toString().substring(8));
            return obj[columnMethadata.columnName].toString().substring(0, 8);
          }
          else if ( obj[columnMethadata.columnName].toSummary ) {
            if ( obj[columnMethadata.columnName].toSummary() instanceof Promise )
              return await obj[columnMethadata.columnName].toSummary();
            else
              return obj[columnMethadata.columnName].toSummary();
          } else
            return obj[columnMethadata.columnName].toString();            
        }
        else
          return '';
      }
    },
    {
      name: 'outputArray',
      type: 'Array',
      code: async function(x, cls, arr, columnsMetadata) {
        var valuesArray = [];
        for ( var i = 0 ; i < arr.length ; i++ ) {
          valuesArray.push(await this.outputObjectForProperties(x, cls, arr[i], columnsMetadata));
        }
        return valuesArray;
      }
    }
  ]
});