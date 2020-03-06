/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'CSVSink',
  extends: 'foam.dao.AbstractSink',
  implements: [
    'foam.core.Serializable'
  ],
  javaImports: [
    'foam.core.PropertyInfo',
    'java.util.List'
  ],

  documentation: 'Sink runs the csv outputter, and contains the resulting string in this.csv',

  properties: [
    {
      class: 'String',
      name: 'csv',
      view: 'foam.u2.tag.TextArea',
      factory: function() { return this.outputter.toString(); },
      javaGetter: 'return getOutputter().toString();'
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
        if ( ! this.of ) return [];
        if ( tc = this.of.getAxiomByName('tableColumns') ) return tc.columns;
        return this.of.getAxiomsByClass(foam.core.Property)
          .filter((p) => ! p.networkTransient)
          .map((p) => p.name);
      },
      javaFactory: `
        if ( getOf() == null ) return new String[]{};

        return ((List<PropertyInfo>)getOf().getAxiomsByClass(PropertyInfo.class))
          .stream()
          .filter(propI -> ! propI.getNetworkTransient())
          .map(propI -> propI.getName())
          .toArray(String[]::new);
      `
    },
    {
      name: 'outputter',
      class: 'FObjectProperty',
      of: 'foam.lib.csv.CSVOutputter',
      transient: true,
      factory: function() {
        return foam.lib.csv.CSVOutputterImpl.create({
          of: this.of,
          props: this.props
        });
      },
      javaFactory: `
        return new foam.lib.csv.CSVOutputterImpl.Builder(getX())
          .setOf(getOf())
          .setProps(getProps())
          .build();
      `
    }
  ],

  methods: [
    {
      name: 'put',
      code: function(obj) {
        this.outputter.outputFObject(this.__context__, obj);
      },
      javaCode: `
        setCsv("");
        getOutputter().outputFObject(getX(), (foam.core.FObject)obj);
      `
    },

    {
      name: 'eof',
      code: function() {
        this.csv = this.outputter.toString();
      },
      javaCode: `
        setCsv(getOutputter().toString());
      `
    },

    {
      name: 'reset',
      code: function() {
        this.outputter.flush();
        this.csv = '';
      },
      javaCode: `
        getOutputter().flush();
        setCsv("");
      `
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'PropertyCSVRefinement',
  refines: 'foam.core.Property',
  properties: [
    {
      class: 'Function',
      name: 'toCSV',
      value: function(x, obj, outputter) {
        outputter.outputValue(obj ? this.f(obj) : null);
      }
    },
    {
      class: 'Function',
      name: 'toCSVLabel',
      value: function(x, outputter) {
        outputter.outputValue(this.name);
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'FObjectPropertyCSVRefinement',
  documentation: `
    Provides FObjectProperties with the behavior to output to multiple columns
    with the property name as a prefix.
  `,
  requires: [
    'foam.lib.csv.PrefixedCSVOutputter'
  ],
  refines: 'foam.core.FObjectProperty',
  properties: [
    {
      name: 'toCSV',
      value: function(x, obj, outputter) {
        if ( ! this.of ) {
          outputter.outputValue(obj ? this.f(obj) : null);
          return;
        }
        this.of.getAxiomsByClass(foam.core.Property)
          .forEach((p) => {
            p.toCSV.call(p, x, obj ? this.f(obj) : null, outputter);
          });
      }
    },
    {
      name: 'javaToCSV',
      class: 'String',
      value: `
        if ( of() instanceof foam.core.EmptyClassInfo ) {
          outputter.outputValue(obj != null ? f(obj) : null);
          return;
        }
        for ( foam.core.PropertyInfo p : (java.util.List<foam.core.PropertyInfo>) of().getAxiomsByClass(foam.core.PropertyInfo.class) ) {
          p.toCSV(x, obj != null ? f(obj) : null, outputter);
        }
      `
    },
    {
      name: 'toCSVLabel',
      class: 'Function',
      value: function(x, outputter) {
        if ( ! this.of ) {
          outputter.outputValue(this.name);
          return;
        }
        outputter = this.PrefixedCSVOutputter.create({
          prefix: this.name + '.',
          delegate: outputter
        });
        this.of.getAxiomsByClass(foam.core.Property)
          .forEach(p => {
            p.toCSVLabel.call(p, x, outputter);
          });
      },
    },
    {
      name: 'javaToCSVLabel',
      class: 'String',
      value: `
        if ( of() instanceof foam.core.EmptyClassInfo ) {
          outputter.outputValue(getName());
          return;
        }
        outputter = new foam.lib.csv.PrefixedCSVOutputter.Builder(x)
          .setPrefix(getName() + ".")
          .setDelegate(outputter)
          .build();
        for ( foam.core.PropertyInfo p : (java.util.List<foam.core.PropertyInfo>) of().getAxiomsByClass(foam.core.PropertyInfo.class) ) {
          p.toCSVLabel(x, outputter);
        }
      `
    }
  ]
});
