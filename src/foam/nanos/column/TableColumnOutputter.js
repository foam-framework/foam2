/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.column',
  name: 'TableColumnOutputter',

  javaImports: [
    'java.util.ArrayList',
    'java.util.List',
    'java.util.StringJoiner',
    'org.apache.commons.lang.ArrayUtils',
    'org.apache.commons.lang3.StringUtils'
  ], 

  documentation: 'Class for returning 2d-array ( ie table ) for array of values ',

  methods: [
    {
      name: 'returnStringValueForProperty',
      type: 'String',
      documentation: 'Method that converts value to string',
      code: async function(x, prop, val, unitPropName, addUnitPropValueToStr) {
        if ( val == 0 || val ) {
          if ( foam.Array.isInstance(val) ) {
            var stringArr = [];
            for ( var i = 0 ; i < val.length ; i++ ) {
              stringArr.push(await this.valueToString(val[i]));
            }
            return stringArr.join(' ');
          }
          if ( foam.core.UnitValue.isInstance(prop) ) {
            if ( addUnitPropValueToStr ) {
              if ( unitPropName ) {
                if ( prop.unitPropValueToString ) {
                  return await prop.unitPropValueToString(x, val, unitPropName);
                }
                return unitPropName + ' ' + ( val / 100 ).toString();
              }
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
      code: async function(x, props, values, lengthOfPrimaryPropsRequested, addUnitPropValueToStr) {
        var stringValues = [];
        for ( var value of values ) {
          var stringArrayForValue = [];
          for ( var i = 0 ; i < lengthOfPrimaryPropsRequested ; i++ ) {
            if ( foam.core.UnitValue.isInstance(props[i]) ) {
              var indexOfUnitProp = props.findIndex(p => p.name === props[i].unitPropName);
              if ( indexOfUnitProp !== -1 ) {
                stringArrayForValue.push(await this.returnStringValueForProperty(x, props[i], value[i], value[indexOfUnitProp], addUnitPropValueToStr));
                continue;
              }
            }
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
      code: async function(x, of, propNames, obj, lengthOfPrimaryPropsRequested) {
        var values = await this.objToArrayOfStringValues(x, of, propNames, obj);
        return this.returnTable(x, of, propNames, values, lengthOfPrimaryPropsRequested);
      }
    },
    {
      name: 'returnTable',
      code: async function(x, of, propNames, values, lengthOfPrimaryPropsRequested, addUnitPropValueToStr) {
        var columnConfig = x.columnConfigToPropertyConverter;
        var props = columnConfig.returnProperties(of, propNames);
        var table =  [ this.getColumnHeaders(x, of, propNames.slice(0, lengthOfPrimaryPropsRequested)) ];
        var values = await this.arrayOfValuesToArrayOfStrings(x, props, values, lengthOfPrimaryPropsRequested, addUnitPropValueToStr);
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
          for ( int j = 0 ; j < metadata.length ; j++ ) {
            row.add(returnStringValueForMetadata(x, metadata[j], arrOfObjectValues.get(i)[metadata[j].getProjectionIndex()], null));
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
      if ( obj == null || obj == "" )
        return "";

      switch(metadata.getCellType()) {
        case "STRING":
        case "NUMBER":
        case "BOOLEAN":
          return obj;
        case "CURRENCY":
          return new Long(obj.toString()) / 100.0 ;
        case "DATE":
          return obj.toString().substring(0, 10);
        case "DATETIME":
          return obj.toString().substring(0, 24);
        case "TIME":
          return obj.toString().substring(0, 8);
        case "ENUM":
          return obj.toString();
        case "ARRAY":
          StringJoiner strJ = new StringJoiner(", ");
          Object[] arr = (Object[])obj;
          for ( int i = 0; i < arr.length; i++ ) {
            if ( arr[i] == null ) {
              strJ.add("");
              continue;
            }
            strJ.add(arr[i].toString());
          }
          return strJ.toString();
        default:
          return ((foam.core.FObject)obj).toSummary();
      }
      `
    }
  ]
});