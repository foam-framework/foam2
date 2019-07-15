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
    'java.util.ArrayList',
    'java.util.List',
    'java.util.stream.Collectors'
  ],

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
      class: 'StringArray',
      name: 'props',
      factory: function(of) {
        if ( ! of ) return;
        if ( of.getAxiomByName('tableColumns') ) return of.getAxiomByName('tableColumns').columns;
        return of.getAxiomsByClass()
          .map((p) => p.name )
          .filter((p) => ! p.networkTransient)
          .flat();
      },
      javaFactory: `
        if ( ! isPropertySet("of") ) {
          propsIsSet_ = false;
          return null;
        }

        ArrayList<String> propInfoArrayList = ((List<PropertyInfo>)getOf().getAxioms()).stream()
          .filter((propI) -> ! ((PropertyInfo)propI).getNetworkTransient())
          .map((propI) -> ((PropertyInfo)propI).getName())
          .collect(Collectors.toCollection(ArrayList::new));
        return propInfoArrayList.toArray(new String[propInfoArrayList.size()]);
      `
    },
    {
      name: 'outputter',
      class: 'FObjectProperty',
      of: 'foam.lib.csv.CSVOutputter',
      transient: true,
      factory: function(of, props) {
        var csvOutputter = foam.lib.csv.CSVOutputter.create();
        if ( of ) {
          csvOutputter.of = of;
          csvOutputter.props = props;
        }
        return csvOutputter;
      },
      javaFactory: `
      foam.lib.csv.CSVOutputter csvOutputter = new foam.lib.csv.CSVOutputter.Builder(getX()).build();
      if ( isPropertySet("of") ) {
        csvOutputter.setOf(getOf());
        csvOutputter.setProps(getProps());
      }
      return csvOutputter;
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
      value: function(obj, outputter) {
        outputter.outputValue(obj ? obj[this.name] : null);
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
      value: function(x, obj, outputter) {
        if ( ! this.of ) {
          outputter.outputValue(obj ? obj[this.name] : null);
          return;
        }
        this.of.getAxiomsByClass(foam.core.Property)
          .forEach((axiom) => {
            axiom.toCSV(x, obj ? obj[this.name] : null, outputter, axiom);
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
          outputValue: function(value) {
            outputter.outputValue(prop.name + '.' + value);
          }
        };
        prop.of.getAxiomsByClass(foam.core.Property)
          .forEach((axiom) => {
            axiom.toCSVLabel(prefixedOutputter, axiom);
          });
      },
      // javaToCSVLabel: `
      //   if ( prop.of == null || ! prop.isPropertySet("of") ) {
      //     outputter.outputValue(prop.getName());
      //     return;
      //   }
      //   // // mini decorator
      //   // var prefixedOutputter = {
      //   //   outputValue: function(value) {
      //   //     outputter.outputValue(prop.name + '.' + value);
      //   //   }
      //   // };
      //   prop.of.getAxiomsByClass(foam.core.Property)
      //     .forEach((axiom) => {
      //       axiom.toCSVLabel(prefixedOutputter, axiom);
      //     });
      // `
    }
  ]
});
