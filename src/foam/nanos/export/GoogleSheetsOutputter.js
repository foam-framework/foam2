foam.CLASS({
  package: 'foam.nanos.export',
  name: 'GoogleSheetsOutputter',
  methods: [
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