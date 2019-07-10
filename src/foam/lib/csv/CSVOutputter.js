/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.lib.csv',
  name: 'CSVOutputter',
  implements: [ 'foam.core.Serializable' ],

  javaImports: [
    'foam.core.*',
    'java.util.List',
    'java.lang.String',
    'java.util.Date'
  ],

  properties: [
    {
      class: 'String',
      name: 'csv',
      view: 'foam.u2.tag.TextArea',
      documentation: 'Used for js version of this outputter.'
    },
    {
      class: 'Class',
      name: 'of',
      visibility: 'HIDDEN'
    },
    {
      class: 'StringArray',
      name: 'props',
      factory: function() {
        return this.of.getAxiomByName('tableColumns').columns;
      },
      visibility: 'HIDDEN'
    },
    {
      class: 'Boolean',
      name: 'isFirstRow',
      value: true,
      visibility: 'HIDDEN'
    },
    {
      class: 'Boolean',
      name: 'isFirstColumn',
      value: true,
      visibility: 'HIDDEN'
    },
    {
      class: 'Object',
      name: 'sb',
      flags: ['java'],
      javaType: 'java.lang.StringBuilder',
      javaFactory: 'return new StringBuilder();',
      documentation: 'Used for java version of this outputter.',
      visibility: 'HIDDEN'
    }
  ],

  methods: [
    {
      name: 'outputValue',
      args: [
        { name: 'value' }
      ],
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
              this.csv += `"${value.replace(/\"/g, '""')}"`;
            },
            Number: function(value) {
              this.csv += value.toString();
            },
            Boolean: function(value) {
              this.csv += value.toString();
            },
            Date: function(value) {
              this.outputValue_(value.toDateString());
            },
            FObject: function(value) {
              this.outputValue_(foam.json.Pretty.stringify(value));
            },
            Array: function(value) {
              this.outputValue_(foam.json.Pretty.stringify(value));
            },
            Undefined: function(value) {},
            Null: function(value) {}
          }, function(value) {
            this.outputValue_(value.toString());
        }),
      javaCode: `
        if ( value instanceof String ) {
          getSb().append("\\"");
          getSb().append(((String)value).replace("\\"", "\\"\\""));
          getSb().append("\\"");
        } else if ( value instanceof Number ) {
          getSb().append(value.toString());
        } else if ( value instanceof Boolean ) {
          getSb().append(value.toString());
        } else if ( value instanceof Date ) {
          getSb().append(value.toString());
        } else if ( value instanceof FObject ) {
          outputValue_(value.toString());
        } else if ( value instanceof List ) {
          outputValue_(value.toString());
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
        return this.csv;
      },
      javaCode: 'return getSb().toString();'
    },
    {
      name: 'headerOutput',
      args: [
        { type: 'FObject', name: 'obj' }
      ],
      code: function() {
        var element;
        this.props.forEach((name) => {
          element = this.of.getAxiomByName(name);
          element.toCSVLabel(this, element);
        });
        this.newLine_();
        this.isFirstRow = false;
      },
      javaCode: `
        Object propObj;
        PropertyInfo columnProp;
        String[] tableColumnNames = getProps();

        for (String propName: tableColumnNames) {
          propObj = obj.getProperty(propName);
          columnProp = (PropertyInfo) getOf().getAxiomByName(propName);
          columnProp.toCSVLabel(this, propObj);
        }
        newLine_();
        setIsFirstRow(false);
      `
    },
    {
      name: 'outputFObject',
      args: [
        { type: 'FObject', name: 'obj' }
      ],
      code: function(obj) {
        var element;

        if ( ! this.of ) this.of = obj.cls_;

        if ( this.isFirstRow ) this.headerOutput();

        this.props.forEach((name) => {
          element = this.of.getAxiomByName(name);
          element.toCSV(x, obj, this, element);
        });

        this.newLine_();
      },
      javaCode: `
        Object propObj;
        PropertyInfo columnProp;
        String[] tableColumnNames = getProps();

        if ( ! isPropertySet("of") || getOf() == null ) setOf(obj.getClassInfo());

        if ( getIsFirstRow() ) headerOutput(obj);

        for (String propName : tableColumnNames) {
          propObj = obj.getProperty(propName);
          columnProp = (PropertyInfo) getOf().getAxiomByName(propName);
          columnProp.toCSV(getX(), obj, this, propObj);
        }

        newLine_();
      `
    },
    {
      name: 'flush',
      code: function() {
        ['csv', 'isFirstColumn', 'isFirstRow']
          .forEach( (s) => this.clearProperty(s) );
      },
      javaCode: `
        getSb().setLength(0);
        clearCsv();
        clearIsFirstRow();
        clearIsFirstColumn();
      `
    }
  ]
});
