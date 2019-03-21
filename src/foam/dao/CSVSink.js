foam.CLASS({
  package: 'foam.dao',
  name: 'CSVSink',
  extends: 'foam.dao.AbstractSink',

  documentation: ``,

  requires: [
    'foam.core.FObject',
    'foam.dao.AbstractSink',
    'foam.lib.json.OutputterMode',
    'foam.util.SafetyUtil'
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
      name: 'props',
      expression: function(of) {
        return of.getAxiomsByClass(foam.core.Property)
          .filter( (p) => ! p.transient || ! p.storageTransient );
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
    }
  ],

  methods: [
    function output(value) {
      if ( ! this.isNewLine ) this.csv += ',';
      this.isNewLine = false;
      this.output_(value);
    },
    {
      name: 'output_',
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
          })
    },

    function newLine_() {
      this.csv += '\n';
      this.isNewLine = true;
    },

    function put(obj) {
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

    function reset() {
      ['csv', 'isNewLine', 'isHeadersOutput']
        .forEach( (s) => this.clearProperty(s) );
      return this;
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'PropertyCSVRefinement',

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

  refines: 'foam.core.FObjectProperty',

  properties: [
    {
      name: 'toCSV',
      class: 'Function',
      value: function(obj, outputter, prop) {
        if ( ! prop.of ) return; // TODO JSON
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
        if ( ! prop.of ) return; // TODO JSON
        var prefixedOutputter = {
          output: function(value) {
            outputter.output(`${prop.name}.${value}`);
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
