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
            pattern = '\"' + props[i].cls_.unitPropName + '\"#,##.##';
          } else if ( props[i].cls_.id === 'foam.core.Date' ) {
            cellType = 'DATE';
            pattern = '';
          } else if ( props[i].cls_.id === 'foam.core.DateTime' ) {
            cellType = 'DATE_TIME';
            pattern = '';
          } else if ( props[i].cls_.id === 'foam.core.Time' ) {
            cellType = 'TIME';
            pattern = '';
          }

          var m = this.GoogleSheetsPropertyMetadata.create({
            columnName: props[i].label,
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
      code: function(obj, props) {
        //var props = this.getPropertyNames(obj.cls_);
        var propValues = [];
        for (var i = 0 ; i < props.length ; i++ ) {
          if(obj[props[i]]) {
            if ( obj[props[i]].toSummary )
              propValues.push(obj[props[i]].toSummary());
            else
              propValues.push(obj[props[i]].toString());
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