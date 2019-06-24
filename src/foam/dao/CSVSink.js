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
    'foam.core.PropertyInfo',
    'java.lang.StringBuilder'
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
      class: 'FObjectArray',
      of: 'foam.core.PropertyInfo',
      name: 'columns',
      expression: function(of) {
        if ( this.columns ) return this.columns;
        if ( this.columns_.length == 0 ) {
          return of ? of.getAxiomsByClass(foam.core.Property)
          .filter( (p) => ! p.networkTransient ) : [];
        }
        return this.columns_.map((tableCol) => {
          return of.getAxiomByName(tableCol);
        });
      },
      visibility: 'HIDDEN'
    },
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
      class: 'FObjectArray',
      of: 'foam.core.PropertyInfo',
      name: 'columns_',
      expression: function(of) {
        if ( this.columns_ ) return this.columns_;
        return of ? of.getAxiomByName('tableColumns').columns : [];
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
        console.log('in output @csvSink - js');
        console.log(`this.CSV ${this.csv} - js`);
        if ( ! this.isNewLine ) this.csv += ',';
        this.isNewLine = false;
        this.output_(value);
      },
      javaCode: `
      System.out.println("in output @csvSink");
      System.out.println("in output @csvSink csv = " + getCsv());
        StringBuilder sb = new StringBuilder();
        if ( ! getIsNewLine() ) {
          sb.append(getCsv());
          sb.append(",");
          setCsv(sb.toString());
        }
        setIsNewLine(false);
        output_(value);
      `
    },
    {
      name: 'output_',
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
        System.out.println("in output_ @csvSink");
        StringBuilder sb = new StringBuilder();
        String s = value.toString();
        if (s.indexOf("\\"") != -1) {
          sb.append("\\"");
          sb.append(s);
          sb.append("\\"");
        }
        else {
          sb.append(s);
        }
        setCsv(sb.toString());
      `
    },
    {
      name: 'newLine_',
      code: function() {
        this.csv += '\n';
        this.isNewLine = true;
      },
      javaCode: `
        StringBuilder sb = new StringBuilder();
        sb.append(getCsv());
        sb.append("\\n");
        setCsv(sb.toString());
        sb.setLength(0);
        setIsNewLine(true);
      `
    },
    {
      name: 'put',
      args: [
        { type: 'FObject', name: 'obj' }
      ],
      code: function(obj) {
        console.log('in the put of the CSvsink - js');
        if ( ! this.of ) this.of = obj.cls_;

        if ( ! this.isHeadersOutput ) {
          this.columns.forEach((element) => {
            element.toCSVLabel(this, element);
          });
          this.newLine_();
          this.isHeadersOutput = true;
        }

        this.columns.forEach((element) => {
          element.toCSV(obj, this, element);
        });
        this.newLine_();
      },
      javaCode: `
        System.out.println("in the put of the CSvsink");
        if ( ! isPropertySet("of") ) setOf(obj.getClassInfo());
        PropertyInfo[] columns = getColumns();
        if ( ! getIsHeadersOutput() ) {
          for (PropertyInfo element : columns) {
            element.toCSVLabel(this, element);
          }
          newLine_();
          setIsHeadersOutput(true);
        }

        for (PropertyInfo element : columns) {
          element.toCSV(obj, this, element);
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
        clearCsv();
        clearIsNewLine();
        clearIsHeadersOutput();
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
      name: 'toCSV',
      class: 'Function',
      value: function(obj, outputter, prop) {
        if ( ! prop.of ) {
          outputter.output(obj ? obj[prop.name] : null);
          return;
        }
        prop.of.getAxiomsByClass(foam.core.Property)
          .forEach((axiom) => {
            axiom.toCSV(obj ? obj[prop.name] : null, outputter, axiom);
          });
      }
    },
    {
      name: 'toCSVLabel',
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
            axiom.toCSVLabel(prefixedOutputter, axiom);
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
  //       name: 'toCSV',
  //       class: 'Function',
  //       value: function(outputter, prop) {
  //         outputter.output(prop);
  //       },
  //       javaFactory: `

  //       `
  //     },
  //     {
  //       name: 'toCSVLabel',
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
//       value: function(outputter, prop) {
//         if ( ! prop.of ) {
//           outputter.output(prop);
//           return;
//         }
//         prop.of.getAxiomsByClass(foam.java.PropertyInfo)
//           .forEach((axiom) => {
//             axiom.javaToCSV(outputter, axiom);
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
//         prop.of.getAxiomsByClass(foam.java.PropertyInfo)
//           .forEach((axiom) => {
//             axiom.javaToCSVLabel(prefixedOutputter, axiom);
//           });
//       }
//     }
//   ]
// });
