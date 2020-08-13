/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.export',
  name: 'GoogleSheetsOutputter',
  extends: 'foam.nanos.column.TableColumnOutputter',
  requires: [
    'foam.nanos.column.ColumnConfigToPropertyConverter',
    'foam.nanos.export.GoogleSheetsPropertyMetadata',
  ],
  methods: [
    {
      name: 'getColumnMetadata',
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
          if ( props[i].cls_.id === "foam.core.Action" )
            continue;
          
          metadata.push(this.returnMetadataForProperty(x, cls, props[i], propNames[i]));
        }
        return metadata;
      }
    },
    {
      name: 'outputStringForProperties',
      type: 'StringArray',
      code: async function(x, cls, obj, columnMetadata) {
        var values = [];
        var columnConfig = x.columnConfigToPropertyConverter;

        var props = columnConfig.returnProperties(cls, columnMetadata.map(m => m.propName));
        values.push(await this.arrayOfValuesToArrayOfStrings(x, obj, props));
        return values;
      }
    },
    {
      name: 'returnMetadataForProperty',
      code: function(x, of, prop, propName) {
        var columnConfig = x.columnConfigToPropertyConverter;
          //to constants?
          var cellType = '';
          var pattern = '';
          var unitProp;
          if ( foam.core.UnitValue.isInstance(prop) ) {
            cellType = 'CURRENCY';
            pattern = '\"$\"#0.00\" CAD\"';
            unitProp = of.getAxiomByName(prop.unitPropName).name;
          } else if ( foam.core.Date.isInstance(prop) ) {
            cellType = 'DATE';
            pattern = 'yyyy-mm-dd';
          } else if ( foam.core.DateTime.isInstance(prop) ) {
            cellType = 'DATE_TIME';
          } else if ( foam.core.Time.isInstance(prop) ) {
            cellType = 'TIME';
          } else if ( foam.core.String.isInstance(prop) ) {
            cellType = 'STRING';
          } else if ( foam.core.Int.isInstance(prop) || foam.core.Float.isInstance(prop) || foam.core.Long.isInstance(prop) || foam.core.Double.isInstance(prop) || foam.core.String.isInstance(prop) || foam.core.Boolean.isInstance(prop) ) {
            cellType = 'PRIMITIVE';
          } else if ( foam.core.Enum.isInstance(prop) || foam.core.AbstractEnum.isInstance(prop) ) {
            cellType = "ENUM";
          }

          return this.GoogleSheetsPropertyMetadata.create({
            columnName: prop.name,
            columnLabel: columnConfig.returnColumnHeader(of, propName),
            columnWidth: prop.tableWidth ? prop.tableWidth : 0,
            cellType: cellType,
            pattern: pattern,
            propName: propName,
            prop: prop,
            unitPropName: unitProp
          });
      }
    }
  ]
});