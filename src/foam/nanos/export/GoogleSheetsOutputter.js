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
        var methadata = [];
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
          var cellType = 'String';
          var pattern = '';
          if ( props[i].cls_.id === "foam.core.UnitValue" ) {
            cellType = 'CURRENCY';
            pattern = '\"$\"###\" CAD\"';// + props[i].cls_.unitPropName;
          } else if ( props[i].cls_.id === 'foam.core.Date' ) {
            cellType = 'DATE';
            //m/d/yyy, h:m:s am/pm
            //3/11/2020, 8:27:41 AM
            //Fri Mar 27 2020"
            pattern = 'yyyy-mm-dd';
          } else if ( props[i].cls_.id === 'foam.core.DateTime' ) {
            cellType = 'DATE_TIME';
            pattern = 'm/d/yyyy, h:m:s am/pm';
          } else if ( props[i].cls_.id === 'foam.core.Time' ) {
            cellType = 'TIME';
            pattern = 'm/d/yyy, h:m:s am/pm';
          }

          var m = this.GoogleSheetsPropertyMetadata.create({
            columnName: props[i].name,
            columnLabel: props[i].label,
            columnWidth: props[i].tableWidth ? props[i].tableWidth : 0,
            cellType: cellType,
            pattern: pattern
          });
          
          methadata.push(m);
        }
        return methadata;
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
      name: 'getAllPropertyLabels',
      type: 'StringArray',
      code: function(cls) {
        var props = cls.getAxiomsByClass(foam.core.Property);
        var propNames = [];
        for ( var i = 0 ; i < props.length ; i++ ) {
          if ( ! props[i].networkTransient )
            propNames.push(props[i].label);
        }
        return propNames;
      }
    },
    {
      name: 'getSpecifiedPropertyWidth',
      type: 'StringArray',
      code: function(cls, propIds) {
        var propNames = [];
        for ( var i = 0 ; i < propIds.length ; i++ ) {
          var p = cls.getAxiomByName(propIds[i]);
          if ( ! p.networkTransient )
            propNames.push(p.tableWidth);
        }
        return propNames;
      }
    },
    {
      name: 'getSpecifiedPropertyLabels',
      type: 'StringArray',
      code: function(cls, propIds) {
        var propNames = [];
        for ( var i = 0 ; i < propIds.length ; i++ ) {
          var p = cls.getAxiomByName(propIds[i]);
          if ( ! p.networkTransient )
            propNames.push(p.label);
        }
        return propNames;
      }
    },
    {
      name: 'outputObjectForProperties',
      type: 'StringArray',
      code: function(obj, columnMethadata) {
        //var props = this.getPropertyNames(obj.cls_);
        var propValues = [];
        for (var i = 0 ; i < columnMethadata.length ; i++ ) {
          if(obj[columnMethadata[i].columnName]) {
            if ( columnMethadata[i].cellType === 'CURRENCY' )
              propValues.push(( obj[columnMethadata[i].columnName] / 100 ).toString());
              if ( columnMethadata[i].cellType === 'DATE' )
                propValues.push(obj[columnMethadata[i].columnName].toISOString().substring(0, 10));
              else
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
      code: function(arr, props) {
        var valuesArray = [];
        for ( var i = 0 ; i < arr.length ; i++ ) {
          valuesArray.push(this.outputObjectForProperties(arr[i], props));
        }
        return valuesArray;
      }
    }
  ]
});