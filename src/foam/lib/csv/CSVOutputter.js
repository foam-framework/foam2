/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.lib.csv',
  name: 'CSVOutputter',

  javaImports: [
    'foam.core.*',
    'foam.nanos.logger.Logger',
    'java.util.ArrayList',
    'java.util.List',
    'java.util.Date',
    'java.util.stream.Collectors'
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
      factory: function(of) {
        if ( ! of ) console.error('csvOutputter does not know the \'of\' of an object');
        if ( of.getAxiomByName('tableColumns') ) return of.getAxiomByName('tableColumns').columns;
        return of.getAxiomsByClass().map((p) => p.name ).filter((p) => ! p.networkTransient).flat();
      },
      javaFactory: `
        if ( ! isPropertySet("of") ) {
          ((Logger)getX().get("logger"))
            .error("csvOutputter does not know the 'of' of an object");
        }

        ArrayList<String> propInfoArrayList =((List<PropertyInfo>)getOf().getAxioms()).stream()
          .filter((propI) -> ! propI.getNetworkTransient())
          .map((propI) -> propI.getName())
          .collect(Collectors.toCollection(ArrayList::new));
        return propInfoArrayList.toArray(new String[propInfoArrayList.size()]);
      `,
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
              this.csv += `${value.replace(/\"/g, '""')}`;
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
          getSb().append(((String)value).replace("\\"", "\\"\\""));
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
        }  else if ( value == null ) {
          // Do nothing
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
      name: 'outputHeader',
      args: [
        { type: 'FObject', name: 'obj' }
      ],
      code: function() {
        this.props.forEach((name) => {
          let prop = this.of.getAxiomByName(name);
          prop.toCSVLabel(this, prop);
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
        if ( ! this.of ) this.of = obj.cls_;

        if ( this.isFirstRow ) this.outputHeader();

        this.props.forEach((name) => {
          let prop = this.of.getAxiomByName(name);
          prop.toCSV(x, obj, this, prop);
        });

        this.newLine_();
      },
      javaCode: `
        if ( ! isPropertySet("of") || getOf() == null ) setOf(obj.getClassInfo());

        PropertyInfo prop;

        if ( getIsFirstRow() ) outputHeader(obj);

        for (String name : getProps()) {
          prop = (PropertyInfo) getOf().getAxiomByName(name);
          prop.toCSV(getX(), obj, this, null);
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
