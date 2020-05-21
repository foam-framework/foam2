/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.lib.csv',
  name: 'CSVOutputterImpl',

  implements: [
    'foam.lib.csv.CSVOutputter'
  ],

  javaImports: [
    'foam.core.*',
    'foam.nanos.column.ColumnConfigToPropertyConverter',
    'foam.nanos.column.ColumnPropertyValue',
    'java.util.Arrays',
    'java.util.List',
    'java.util.Date'
  ],

  properties: [
    {
      class: 'Class',
      name: 'of',
      required: true
    },
    {
      class: 'StringArray',
      name: 'props',
      factory: null,
      expression: function(of) {
        return of.getAxiomByName('tableColumns') 
          ? of.getAxiomByName('tableColumns').columns
          : of.getAxiomsByClass()
            .filter((p) => ! p.networkTransient)
            .map((p) => p.name);
      },
      javaFactory: `
        // TODO: Add tableColumns to java to give an opportunity for a better default.
        return ((List<PropertyInfo>)getOf().getAxiomsByClass(PropertyInfo.class)).stream()
          .filter(propI -> ! propI.getNetworkTransient())
          .map(propI -> propI.getName())
          .toArray(String[]::new);
      `
    },
    {
      class: 'Boolean',
      name: 'isFirstRow',
      value: true
    },
    {
      class: 'Boolean',
      name: 'isFirstColumn',
      value: true
    },
    {
      class: 'String',
      name: 'csv',
      view: 'foam.u2.tag.TextArea',
      flags: ['js']
    },
    {
      class: 'Object',
      name: 'sb',
      flags: ['java'],
      javaType: 'java.lang.StringBuilder',
      javaFactory: 'return new StringBuilder();'
    }
  ],

  methods: [
    {
      name: 'outputValue',
      code: function(value) {
        if ( ! this.isFirstColumn ) this.csv += ',';
        this.isFirstColumn = false;
        this.outputValue_(value);
      },
      javaCode: `
        if ( ! getIsFirstColumn() ) getSb().append(",");
        setIsFirstColumn(false);
        outputValue_(value);
      `
    },
    {
      name: 'outputValue_',
      args: [
        { type: 'Any', name: 'value' }
      ],
      code:
        foam.mmethod(
          {
            String: function(value) {
              if ( value.includes(',') ) value = `"${value.replace(/\"/g, '""')}"`;
              this.csv += value;
            },
            Date: function(value) {
              this.outputValue_(value.toDateString());
            },
            Undefined: function(value) {},
            Null: function(value) {}
          }, function(value) {
            this.outputValue_(value.toString());
        }),
      javaCode: `
        if ( value instanceof String ) {
          if ( ((String)value).contains(",") )
            value = '"' + ((String)value).replace("\\"", "\\"\\"") + '"';
          getSb().append(value);
        } else if ( value instanceof Date ) {
          getSb().append(value.toString());
        } else if ( value == null ) {
        } else {
          outputValue_(value.toString());
        }
      `
    },
    {
      name: 'newLine_',
      code: function() {
        this.csv += '\n';
        this.isFirstColumn = true;
      },
      javaCode: `
        getSb().append("\\n");
        setIsFirstColumn(true);
      `
    },
    {
      name: 'toString',
      code: function() {
        if ( this.isFirstRow ) this.outputHeader(this.__context__);
        return this.csv;
      },
      javaCode: `
        if ( getIsFirstRow() ) outputHeader(getX());
        return getSb().toString();
      `
    },
    {
      name: 'outputHeader',
      args: [
        { type: 'Context', name: 'x' },
        {
          type: 'PropertyInfo...',
          name: 'props'
        }
      ],
      code: function(x, propValues) {
        var columnConfig = x.columnConfigToPropertyConverter;
        if ( ! propValues ) {
          propValues = this.props
          .map((propName) => {
            var prop = propName;
            if ( foam.String.isInstance(prop) )
              prop = columnConfig.returnProperty(this.of, propName);
            return prop;
          });
        }
        propValues.forEach((p) => {
            if ( foam.core.Property.isInstance(p) ) p.toCSVLabel.call(p, x, this);
          });
        this.newLine_();
        this.isFirstRow = false;
      },
      javaCode: `
        ColumnConfigToPropertyConverter columnConfig = (ColumnConfigToPropertyConverter)x.get("columnConfigToPropertyConverter");
        if ( props.length == 0 ) {
          for ( String prop : getProps() ) {
            PropertyInfo p = columnConfig.returnProperty(getOf(), prop);
            if ( p != null && p instanceof PropertyInfo ) ((PropertyInfo)p).toCSVLabel(x, this);
          }
        } else {
          for ( PropertyInfo p : props ) {
            if ( p != null && p instanceof PropertyInfo ) ((PropertyInfo)p).toCSVLabel(x, this);
          }
        }
        
        newLine_();
        setIsFirstRow(false);
      `
    },
    {
      name: 'outputFObject',
      code: function(x, obj) {
        var self = this;
        if ( ! this.of ) this.of = obj.cls_;
        var columnPropValues = [];
        var columnConfig = x.columnConfigToPropertyConverter;
        var obj1 = obj;
        this.props
          .forEach((propName) => {
            if ( foam.String.isInstance(propName) ) {
              var col = columnConfig.returnPropertyAndObject(this.of, propName, obj1);
              columnPropValues.push(col);
            }
          });
         Promise.all(columnPropValues).then(values => {
          if ( this.isFirstRow ) self.outputHeader(x, values.map(c => c.propertyValue));
          for ( var columnPropValue of values ) {
            var prop = columnPropValue.propertyValue;
            if ( foam.core.Property.isInstance(prop) ) prop.toCSV.call(prop, x, obj1, self);
            self.newLine_();
          }
        });
        
      },
      javaCode: `
        if ( getOf() == null ) setOf(obj.getClassInfo());
        ColumnConfigToPropertyConverter columnConfig = (ColumnConfigToPropertyConverter)x.get("columnConfigToPropertyConverter");
        String[] propNames = getProps();
        ColumnPropertyValue[] columnPropValues = new ColumnPropertyValue[propNames.length];

        for ( int i = 0 ; i < propNames.length ; i++ ) {
          ColumnPropertyValue val = columnConfig.returnPropertyAndObject(x, getOf(), propNames[i], obj);
          columnPropValues[i] = val;
        }

        PropertyInfo[] props = Arrays.stream(columnPropValues)
          .map(ColumnPropertyValue::getPropertyValue)
          .toArray(PropertyInfo[]::new);
        if ( getIsFirstRow() ) outputHeader(x, props);
        for (String propName : getProps()) {
          ColumnPropertyValue val = columnConfig.returnPropertyAndObject(x, getOf(), propName, obj);
          if ( val.getPropertyValue() != null && val.getPropertyValue() instanceof PropertyInfo ) ((PropertyInfo)val.getPropertyValue()).toCSV(x, val.getObjValue(), this);
        }
        newLine_();
      `
    },
    {
      name: 'flush',
      code: function() {
        this.csv = '';
        this.isFirstColumn = undefined;
        this.isFirstRow = undefined;
      },
      javaCode: `
        getSb().setLength(0);
        clearIsFirstRow();
        clearIsFirstColumn();
      `
    }
  ]
});
