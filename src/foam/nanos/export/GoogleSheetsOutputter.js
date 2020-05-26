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
      code: async function(x, cls, propNames) {
        var metadata = [];
        var props = [];
        if ( ! propNames ) {
          props = cls.getAxiomsByClass(foam.core.Property);
          propNames = props.map(p => p.name);
        } else {
          var columnConfig = x.columnConfigToPropertyConverter;
          for ( var i = 0 ; i < propNames.length ; i++ ) {
            props.push(await columnConfig.returnProperty(cls, propNames[i]));
          }
        }
        
        for ( var i = 0 ; i < props.length ; i++ ) {
          // if ( ! props[i].networkTransient )
          //   continue;
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
          var val = await columnConfig.returnValue(cls, columnMetadata[i].propName, obj);
          values.push(await this.returnValueForMethadata(val, columnMetadata[i]));
        }
        return values;
      }
    },
    {
      name: 'outputStringForProperties',
      type: 'StringArray',
      code: async function(x, cls, obj, columnMetadata) {
        var values = [];
        for (var i = 0 ; i < columnMetadata.length ; i++ ) {
          values.push(await this.returnStringForMethadata(obj[i], columnMetadata[i]));
        }
        return values;
      }
    },
    {
      name: 'returnMetadataForProperty',
      code: function(prop, propName) {
          //to constants
          var cellType = 'STRING';
          var pattern = '';
          if ( foam.core.UnitValue.isInstance(prop) ) {
            cellType = 'CURRENCY';
            pattern = '\"$\"#0.00\" CAD\"';
          } else if ( foam.core.Date.isInstance(prop) ) {
            cellType = 'DATE';
            pattern = 'yyyy-mm-dd';
          } else if ( foam.core.DateTime.isInstance(prop) ) {
            cellType = 'DATE_TIME';
          } else if ( foam.core.Time.isInstance(prop) ) {
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
      name: 'returnStringForMethadata',
      type: 'String',
      code: async function(val, columnMethadata) {
        if ( val ) {
          if ( columnMethadata.cellType === 'CURRENCY' ) {
            columnMethadata.perValuePatternSpecificValues.push(val.destinationCurrency);
            return ( val / 100 ).toString();
          }
          else if ( columnMethadata.cellType === 'DATE' )
            return val.toISOString().substring(0, 10);
          else if ( columnMethadata.cellType === 'DATE_TIME' ) {
            columnMethadata.perValuePatternSpecificValues.push(val.toString().substring(24));
            return val.toString().substring(0, 24);
          }
          else if ( columnMethadata.cellType === 'TIME' ) {
            columnMethadata.perValuePatternSpecificValues.push(val.toString().substring(8));
            return val.toString().substring(0, 8);
          }
          else if ( val.toSummary ) {
            if ( val.toSummary() instanceof Promise )
              return await val.toSummary();
            else
              return val.toSummary();
          } else
            return val.toString();            
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
    },
    {
      name: 'outputStringArray',
      type: 'Array',
      code: async function(x, cls, arr, columnsMetadata) {
        var valuesArray = [];
        for ( var i = 0 ; i < arr.length ; i++ ) {
          valuesArray.push(await this.outputStringForProperties(x, cls, arr[i], columnsMetadata));
        }
        return valuesArray;
      }
    }
  ]
});