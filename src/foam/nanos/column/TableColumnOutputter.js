/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.column',
  name: 'TableColumnOutputter',

  javaImports: [
    'java.util.ArrayList'
  ], 

  documentation: 'Class for returning 2d-array ( ie table ) for array of values ',

  methods: [
    {
      name: 'returnStringValueForProperty',
      type: 'String',
      documentation: 'Method that converts value to string',
      code: async function(x, prop, val, unitPropName) {
        if ( val == 0 || val ) {
          if ( foam.Array.isInstance(val) ) {
            var stringArr = [];
            for ( var i = 0 ; i < val.length ; i++ ) {
              stringArr.push(await this.valueToString(val[i]));
            }
            return stringArr.join(' ');
          }
          if ( foam.core.UnitValue.isInstance(prop) ) {
            if ( unitPropName ) {
              if ( prop.unitPropValueToString ) {
                return await prop.unitPropValueToString(x, val, unitPropName);
              }
              return unitPropName + ' ' + ( val / 100 ).toString();
            }
            return ( val / 100 ).toString();
          }
          if ( foam.core.Date.isInstance(prop) && val.toISOString ) {
            return val.toISOString().substring(0, 10);
          }
          if ( foam.core.DateTime.isInstance(prop) ) {
            return val.toString().substring(0, 24);
          }
          if ( foam.core.Time.isInstance(prop) ) {
            return val.toString().substring(0, 8);
          }
          return await this.valueToString(val);
        }
        return ''; 
      }
    },
    async function valueToString(val) {
      if ( val.toSummary ) {
        if ( val.toSummary() instanceof Promise )
          return await val.toSummary();
        return val.toSummary();
      }
      return val.toString();
    },
    {
      name: 'arrayOfValuesToArrayOfStrings',
      code: async function(x, props, values) {
        var stringValues = [];
        for ( var value of values ) {
          var stringArrayForValue = [];
          for ( var i = 0 ; i < value.length ; i++ ) {
            stringArrayForValue.push(await this.returnStringValueForProperty(x, props[i], value[i]));
          }
          stringValues.push(stringArrayForValue);
        }
        return stringValues;
      }
    },
    async function objToArrayOfStringValues(x, of, propNames, obj) {
      var columnConfig = x.columnConfigToPropertyConverter;
      var values = [];
      for ( var propName of  propNames ) {
        values.push(await columnConfig.returnValueForPropertyName(x, of, propName, obj));
      }
      return values;
    },
    {
      name: 'objectToTable',
      code: async function(x, of, propNames, obj) {
        var columnConfig = x.columnConfigToPropertyConverter;
        var filteredPropNames = columnConfig.filterExportedProps(obj.cls_, propNames);
        var values = await this.objToArrayOfStringValues(x, of, filteredPropNames, obj);
        return this.returnTable(x, of, filteredPropNames, values);
      }
    },
    {
      name: 'returnTable',
      code: async function(x, of, propNames, values) {
        var columnConfig = x.columnConfigToPropertyConverter;
        var props = columnConfig.returnProperties(of, propNames);
        var table =  [ this.getColumnHeaders(x, of, propNames) ];
        var values = await this.arrayOfValuesToArrayOfStrings(x, props, values);
        table = table.concat(values);
        return table;
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
      name: 'getColumnHeaders',
      type: 'String',
      code: function(x, of, arrOfPropNames) {
        var columnConfig = x.columnConfigToPropertyConverter;
        var columnHeaders = [];
        for ( var propName of  arrOfPropNames ) {
          columnHeaders.push(columnConfig.returnColumnHeader(of, propName));
        }
        return columnHeaders;
      }
    },
    {
      name: 'returnTableForMetadata',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'metadata',
          type: 'foam.nanos.export.GoogleSheetsPropertyMetadata[]'
        },
        {
          name: 'arrOfObjectValues',
          javaType: 'java.util.List<Object[]>'
        }
      ],
      javaType: 'java.util.List<java.util.List<Object>>',
      javaCode: `
        java.util.List<java.util.List<Object>> result = new ArrayList<>();
      
        java.util.List<Object> columnHeaders = new ArrayList<>();

        for ( int i = 0 ; i < metadata.length ; i++ ) {
          columnHeaders.add(metadata[i].getColumnLabel());
        }
        result.add(columnHeaders);

        for ( int i = 0 ; i < arrOfObjectValues.size() ; i++ ) {
          java.util.List<Object> row = new ArrayList<>();
          for ( int j = 0 ; j < arrOfObjectValues.get(i).length ; j++ ) {
            row.add(returnStringValueForMetadata(x, metadata[j], arrOfObjectValues.get(i)[j], null));
          }
          result.add(row);
        }

        return result;
      `
    },
    {
      name: 'returnStringValueForMetadata',
      type: 'Object',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'metadata',
          type: 'foam.nanos.export.GoogleSheetsPropertyMetadata'
        },
        {
          name: 'obj',
          javaType: 'Object'
        },
        {
          name: 'unitPropValue',
          type: 'String'
        }
      ],
      javaCode: `
      if ( obj == null )
        return "";

      switch(metadata.getCellType()) {
        case "STRING":
        case "PRIMITIVE":
        case "CURRENCY"://make sure commas added in GS pattern
          return obj;
        case "DATE":
          return obj.toString().substring(0, 10);
        case "DATETIME":
          return obj.toString().substring(0, 24);
        case "TIME":
          return obj.toString().substring(0, 8);
        default:
          return ((foam.core.FObject)obj).toSummary();
      }
      `
    }
  ]
});