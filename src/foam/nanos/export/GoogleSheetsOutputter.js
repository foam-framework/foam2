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
      code: function(cls, propsName) {
        var metadata = [];
        var props = [];
        if ( ! propsName ) {
          props = cls.getAxiomsByClass(foam.core.Property);
        } else {
          for ( var i = 0; i < propsName.length ; i++ ) {
            props.push(cls.getAxiomByName(propsName[i]));
          }
        }
        
        for ( var i = 0 ; i < props.length ; i++ ) {
          if ( props[i].networkTransient )
            continue;
          if ( props[i].cls_.id === "foam.core.Action" )
            continue;
          var cellType = 'STRING';
          var pattern = '';
          if ( props[i].cls_.id === "foam.core.UnitValue" ) {
            cellType = 'CURRENCY';
            pattern = '\"$\"#0.00\" CAD\"';
          } else if ( props[i].cls_.id === 'foam.core.Date' ) {
            cellType = 'DATE';
            pattern = 'yyyy-mm-dd';
          } else if ( props[i].cls_.id === 'foam.core.DateTime' ) {
            cellType = 'DATE_TIME';
          } else if ( props[i].cls_.id === 'foam.core.Time' ) {
            cellType = 'TIME';
          }

          var m = this.GoogleSheetsPropertyMetadata.create({
            columnName: props[i].name,
            columnLabel: props[i].label,
            columnWidth: props[i].tableWidth ? props[i].tableWidth : 0,
            cellType: cellType,
            pattern: pattern
          });
          
          metadata.push(m);
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
      code: async function(obj, columnMethadata) {
        var propValues = [];
        for (var i = 0 ; i < columnMethadata.length ; i++ ) {
          if ( obj[columnMethadata[i].columnName] ) {
            if ( columnMethadata[i].cellType === 'CURRENCY' ) {
              propValues.push(( obj[columnMethadata[i].columnName] / 100 ).toString());
              columnMethadata[i].perValuePatternSpecificValues.push(obj.destinationCurrency);
            }
            else if ( columnMethadata[i].cellType === 'DATE' )
              propValues.push(obj[columnMethadata[i].columnName].toISOString().substring(0, 10));
            else if ( columnMethadata[i].cellType === 'DATE_TIME' ) {
              propValues.push(obj[columnMethadata[i].columnName].toString().substring(0, 24));
              columnMethadata[i].perValuePatternSpecificValues.push(obj[columnMethadata[i].columnName].toString().substring(24));
            }
            else if ( columnMethadata[i].cellType === 'TIME' ) {
              propValues.push(obj[columnMethadata[i].columnName].toString().substring(0, 8));
              columnMethadata[i].perValuePatternSpecificValues.push(obj[columnMethadata[i].columnName].toString().substring(8));
            }
            else if ( obj[columnMethadata[i].columnName].toSummary ) {
              if ( obj[columnMethadata[i].columnName].toSummary() instanceof Promise )
                propValues.push(await obj[columnMethadata[i].columnName].toSummary());
              else
                propValues.push(obj[columnMethadata[i].columnName].toSummary());
            } else
              propValues.push(obj[columnMethadata[i].columnName].toString());            
          }
          else
            propValues.push('');
        }
        return propValues;
      }
    },
    {
      name: 'outputArray',
      type: 'Array',
      code: async function(arr, props) {
        var valuesArray = [];
        for ( var i = 0 ; i < arr.length ; i++ ) {
          valuesArray.push(await this.outputObjectForProperties(arr[i], props));
        }
        return valuesArray;
      }
    }
  ]
});