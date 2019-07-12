/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'CSVSink',
  extends: 'foam.dao.AbstractSink',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Sink runs the csv outputter, and contains the resulting string in this.csv',

  properties: [
    {
      class: 'String',
      name: 'csv',
      view: 'foam.u2.tag.TextArea'
    },
    {
      class: 'Class',
      name: 'of',
      visibility: 'HIDDEN'
    },
    {
      name: 'outputter',
      class: 'FObjectProperty',
      of: 'foam.lib.csv.CSVOutputter',
      transient: true,
      factory: function(of) {
        return foam.lib.csv.CSVOutputter.create({
          of: of
        });
      },
      javaFactory: `
        return new foam.lib.csv.CSVOutputter.Builder(getX()).setOf(getOf()).setProps(getProps()).build();
      `
    }
  ],

  methods: [
    {
      name: 'put',
      code: function(obj) {
        this.outputter.outputFObject(obj);
      },
      javaCode: `
        getOutputter().outputFObject((foam.core.FObject)obj);
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

  documentation: `Refinement on Properties to handle toCSV() and toCSVLabel().`,

  refines: 'foam.core.Property',

  properties: [
    {
      name: 'toCSV',
      class: 'Function',
      value: function(obj, outputter, prop) {
        outputter.outputValue(obj ? obj[prop.name] : null);
      }
    },
    {
      name: 'toCSVLabel',
      class: 'Function',
      value: function(outputter, prop) {
        outputter.outputValue(prop.name);
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'FObjectPropertyCSVRefinement',

  documentation: `Refinement on FObjects to override toCSV() and toCSVLabel().
  Purpose is to output a dot annotated format, to handle the nested properties on the FObject.`,

  refines: 'foam.core.FObjectProperty',

  properties: [
    {
      name: 'toCSV',
      class: 'Function',
      value: function(x, obj, outputter, prop) {
        if ( ! prop.of ) {
          outputter.outputValue(obj ? obj[prop.name] : null);
          return;
        }
        prop.of.getAxiomsByClass(foam.core.Property)
          .forEach((axiom) => {
            axiom.toCSV(x, obj ? obj[prop.name] : null, outputter, axiom);
          });
      }
    },
    {
      name: 'toCSVLabel',
      class: 'Function',
      value: function(outputter, prop) {
        if ( ! prop.of ) {
          outputter.outputValue(prop.name);
          return;
        }
        // mini decorator
        var prefixedOutputter = {
          output: function(value) {
            outputter.outputValue(prop.name + '.' + value);
          }
        };
        prop.of.getAxiomsByClass(foam.core.Property)
          .forEach((axiom) => {
            axiom.toCSVLabel(prefixedOutputter, axiom);
          });
      }
    }
  ]
});
