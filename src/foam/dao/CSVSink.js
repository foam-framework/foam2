/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'CSVSink',
  extends: 'foam.dao.AbstractSink',

  documentation: 'Sink runs the csv outputter, and contains the resulting string in this.csv',

  implements: [
    'foam.core.Serializable'
  ],

  javaImports: [
    'foam.java.PropertyInfo'
  ],

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
      // class: List<foam.core.Property>
      name: 'props',
      class: 'FObjectArray',
      expression: function(of) {
        if ( this.axioms.length == 0 ) {
          return of.getAxiomsByClass(foam.core.Property)
            .filter( (p) => ! p.networkTransient );
        }
        return this.axioms.map((tableCol) => {
          return of.getAxiomByName(tableCol);
        });
      },
      visibility: 'HIDDEN'
    },
    // {
    //   name: 'javaProps',
    //   class: 'FObjectArray',
    //   of: 'foam.java.Field',
    //   expression: function(of) {
    //     if ( this.axioms.length == 0 ) {
    //       return of.getAxiomsByClass(foam.core.Property)
    //         .filter( (p) => ! p.networkTransient );
    //     }
    //     return this.axioms.map((tableCol) => {
    //       return of.getAxiomByName(tableCol);
    //     });
    //   },
    //   visibility: 'HIDDEN'
    // },
    {
      class: 'Boolean',
      name: 'isHeadersOutput',
      visibility: 'HIDDEN'
    },
    {
      class: 'Boolean',
      name: 'isNewLine',
      value: true,
      visibility: 'HIDDEN'
    },
    {
      name: 'axioms',
      factory: function() {
        return this.of.getAxiomByName('tableColumns').columns;
      }
    }
  ],

  methods: [
    {
      name: 'output',
      args: [
        { name: 'value' }
      ],
      code: function(value) {
        if ( ! this.isNewLine ) this.csv += ',';
        this.isNewLine = false;
        this.output_(value);
      },
      javaCode: `
        if ( ! getIsNewLine() ) setCsv(getCsv() + ",");
        setIsNewLine(false);
        output_(value);
      `

    },
    {
      name: 'output_',
      args: [
        { name: 'value' }
      ],
      code:
        foam.mmethod(
          {
            String: function(value) {
              this.csv += `\"${value.replace(/\"/g, '\"\"')}\"`;
            },
            Number: function(value) {
              this.csv += value.toString();
            },
            Boolean: function(value) {
              this.csv += value.toString();
            },
            Date: function(value) {
              this.output_(value.toDateString());
            },
            FObject: function(value) {
              this.output_(foam.json.Pretty.stringify(value));
            },
            Array: function(value) {
              this.output_(foam.json.Pretty.stringify(value));
            },
            Undefined: function(value) {},
            Null: function(value) {}
          }, function(value) {
            this.output_(value.toString());
        }),
      javaCode: `
        switch (value) {
          case value == null: 
            break;
          case value instanceof String:
            setCsv(getCsv() +  value.replace("\\"", "\\"\\""));
            break;
          case value instanceof Number:
            setCsv(getCsv() + value.toString());
            break;
          case value instanceof Boolean: 
            setCsv(getCsv() + value.toString());
            break;
          case value instanceof Date:
            output_(value.toDateString());
            break;
          case value instanceof Array:
            output_(foam.json.Pretty.stringify(value));
            break;
          case value instanceof FObject: 
            output_(foam.json.Pretty.stringify(value));
            break;
          default:
            output_(value.toString());
        }
      `
    },
    {
      name: 'newLine_',
      code: function() {
        this.csv += '\n';
        this.isNewLine = true;
      },
      javaCode: `
        setCsv(getCsv() + "\\n");
        setIsNewLine(true);
      `
    },
    {
      name: 'put',
      args: [
        { class: 'FObject', name: 'obj' }
      ],
      code: function(obj) {
        if ( ! this.of ) this.of = obj.cls_;

        if ( ! this.isHeadersOutput ) {
          this.props.forEach((element) => {
            element.toCSVLabel(this, element);
          });
          this.newLine_();
          this.isHeadersOutput = true;
        }

        this.props.forEach((element) => {
          element.toCSV(obj, this, element);
        });
        this.newLine_();
      },
      javaCode: `
        if ( ! isPropertySet(getOf()) ) setOf(obj.getClassInfo());
        FObjectArray props = getProps();
        if ( ! getIsHeadersOutput() ) {
          for (FObject element : props) {
            element.javaToCSVLabel(this, element);
          }
          newLine_();
          setIsHeadersOutput(true);
        }

        for (FObject element : props) {
          element.javaToCSV(obj, this, element);
        }
        newLine_();
      `
    },
    {
      name: 'reset',
      code: function() {
        ['csv', 'isNewLine', 'isHeadersOutput']
          .forEach( (s) => this.clearProperty(s) );
      },
      javaCode: `
        String[] propToClear = {"csv", "isNewLine", "isHeadersOutput"};
        for (String name : propToClean) {
          this.clearProperty(name);
        }
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
        outputter.output(obj ? obj[prop.name] : null);
      }
    },
    {
      name: 'toCSVLabel',
      class: 'Function',
      value: function(outputter, prop) {
        outputter.output(prop.name);
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
      name: 'javaToCSV',
      class: 'Function',
      value: function(obj, outputter, prop) {
        if ( ! prop.of ) {
          outputter.output(obj ? obj[prop.name] : null);
          return;
        }
        prop.of.getAxiomsByClass(foam.core.Property)
          .forEach((axiom) => {
            axiom.javaToCSV(obj ? obj[prop.name] : null, outputter, axiom);
          });
      }
    },
    {
      name: 'javaToCSVLabel',
      class: 'Function',
      value: function(outputter, prop) {
        if ( ! prop.of ) {
          outputter.output(prop.name);
          return;
        }
        // mini decorator
        var prefixedOutputter = {
          output: function(value) {
            outputter.output(prop.name + '.' + value);
          }
        };
        prop.of.getAxiomsByClass(foam.core.Property)
          .forEach((axiom) => {
            axiom.javaToCSVLabel(prefixedOutputter, axiom);
          });
      }
    }
  ]
});

  // foam.CLASS({
  //   package: 'foam.dao',
  //   name: 'PropertyInfoCSVRefinement',
  
  //   documentation: `Refinement on Properties to handle javaToCSV() and javaToCSVLabel().`,
  
  //   refines: 'foam.java.PropertyInfo',
  
  //   properties: [
  //     {
  //       name: 'javaToCSV',
  //       class: 'Function',
  //       value: function(obj, outputter, prop) {
  //         outputter.output(obj ? obj[prop.name] : null);
  //       }
  //     },
  //     {
  //       name: 'javaToCSVLabel',
  //       class: 'Function',
  //       value: function(outputter, prop) {
  //         outputter.output(prop.name);
  //       }
  //     }
  //   ]
  // });

//   foam.CLASS({
//   package: 'foam.dao',
//   name: 'FObjectPropertyCSVRefinement',

//   documentation: `Refinement on FObjects to override javaToCSV() and javaToCSVLabel().
//   Purpose is to output a dot annotated format, to handle the nested properties on the FObject.`,

//   refines: 'foam.core.FObjectProperty',

//   properties: [
//     {
//       name: 'javaToCSV',
//       class: 'Function',
//       value: function(obj, outputter, prop) {
//         if ( ! prop.of ) {
//           outputter.output(obj ? obj[prop.name] : null);
//           return;
//         }
//         prop.of.getAxiomsByClass(foam.core.Property)
//           .forEach((axiom) => {
//             axiom.toCSV(obj ? obj[prop.name] : null, outputter, axiom);
//           });
//       }
//     },
//     {
//       name: 'javaToCSVLabel',
//       class: 'Function',
//       value: function(outputter, prop) {
//         if ( ! prop.of ) {
//           outputter.output(prop.name);
//           return;
//         }
//         // mini decorator
//         var prefixedOutputter = {
//           output: function(value) {
//             outputter.output(prop.name + '.' + value);
//           }
//         };
//         prop.of.getAxiomsByClass(foam.core.Property)
//           .forEach((axiom) => {
//             axiom.toCSVLabel(prefixedOutputter, axiom);
//           });
//       }
//     }
//   ]
// });
