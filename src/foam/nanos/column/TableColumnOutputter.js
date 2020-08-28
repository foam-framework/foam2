/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.column',
  name: 'TableColumnOutputter',


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
      code: async function(x, props, values, lengthOfPrimaryPropsRequested) {
        var stringValues = [];
        for ( var value of values ) {
          var stringArrayForValue = [];
          for ( var i = 0 ; i < lengthOfPrimaryPropsRequested ; i++ ) {
            if ( foam.core.UnitValue.isInstance(props[i]) ) {
              var indexOfUnitProp = props.findIndex(p => p.name === props[i].unitPropName);
              if ( indexOfUnitProp !== -1 ) {
                stringArrayForValue.push(await this.returnStringValueForProperty(x, props[i], value[i], value[indexOfUnitProp]));
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
      code: async function(x, of, propNames, values, lengthOfPrimaryPropsRequested) {
        var columnConfig = x.columnConfigToPropertyConverter;
        var props = columnConfig.returnProperties(of, propNames);
        var table =  [ this.getColumnHeaders(x, of, propNames.slice(0, lengthOfPrimaryPropsRequested)) ];
        var values = await this.arrayOfValuesToArrayOfStrings(x, props, values, lengthOfPrimaryPropsRequested);
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
    }
  ]
});