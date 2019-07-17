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
    'foam.nanos.logger.Logger',
    'java.util.ArrayList',
    'java.util.List',
    'java.util.Date',
    'java.util.stream.Collectors'
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
      factory: function(of) {
        if ( of.getAxiomByName('tableColumns') ) return of.getAxiomByName('tableColumns').columns;
        return of.getAxiomsByClass()
          .filter(p => ! p.networkTransient)
          .map(p => p.name);
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
      code: function() { return this.csv; },
      javaCode: 'return getSb().toString();'
    },
    {
      name: 'outputHeader',
      args: [
        { type: 'Context', name: 'x' }
      ],
      code: function(x) {
        this.props
          .map(name => this.of.getAxiomByName(name))
          .forEach(p => p.toCSVLabel.call(p, x, this));
        this.newLine_();
        this.isFirstRow = false;
      },
      javaCode: `
        for (String name: getProps()) {
          PropertyInfo p = (PropertyInfo) getOf().getAxiomByName(name);
          if ( p == null ) {
            ((Logger) x.get("logger")).warning("Attempt to output unknown header: " + name);
            continue;
          }
          p.toCSVLabel(x, this);
        }
        newLine_();
        setIsFirstRow(false);
      `
    },
    {
      name: 'outputFObject',
      code: function(x, obj) {
        if ( ! this.of ) this.of = obj.cls_;
        if ( this.isFirstRow ) this.outputHeader(x);
        this.props
          .map(name => this.of.getAxiomByName(name))
          .forEach(p => p.toCSV.call(p, x, obj, this));
        this.newLine_();
      },
      javaCode: `
        if ( getOf() == null ) setOf(obj.getClassInfo());
        if ( getIsFirstRow() ) outputHeader(x);
        for (String name : getProps()) {
          PropertyInfo p = (PropertyInfo) getOf().getAxiomByName(name);
          if ( p == null ) {
            ((Logger) x.get("logger")).warning("Attempt to output unknown property: " + name);
            continue;
          }
          p.toCSV(x, obj, this);
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
