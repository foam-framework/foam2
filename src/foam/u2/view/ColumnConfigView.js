/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.u2.view',
  name: 'ColumnsConfigView',
  extends: 'foam.u2.View',

  documentation: 'A view for configuring table columns.',

  requires: [
    'foam.u2.tag.ColumnSelect'
  ],

  properties: [
    'of',
    'allColumns',
    'selectedColumns',
    {
      name: 'properties',
      expression: function(selectedColumns) {
        var props = [];
        this.selectedColumns.map(axiomName => {//what is overridesMap??? can't find
            const axiom = this.of.getAxiomByName(axiomName);
            props.push(axiom);
          });
        return props;
      }
    },
    {
      name: 'allProperties',
      expression: function(allColumns) {
        var props = [];
        this.allColumns.map(axiomName => {//what is overridesMap??? can't find
          props.push(this.of.getAxiomByName(axiomName[0]));
          });
        
        return props;
      }
    },
    'isColumnChanged'
  ],

  css: `
    ^ {
      padding: 8px 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
    ^ > * {
      align-self: center;
    }
  `,

  methods: [
    function initE() {
      var self = this;
      this.SUPER();
      var views  = [];


      for (var i = 0; i < self.properties.length; i++) {
        views.push({ i: i, view: this.ColumnSelect.create({currentProperty: self.properties[i], props: self.allProperties})});
      }

      for (var v of views) {
        v.view.currentProperty$.sub(function() {
          self.isColumnChanged = true;
          if ( foam.core.StringArray.isInstance(self.selectedColumns[0]) ) self.selectedColumns[v.i] = [ v.view.currentProperty.name, null ];
          else self.selectedColumns[v.i] = v.view.currentProperty.name;
        });
      }

      this
        .addClass(this.myClass())
        .forEach(views, function(v) {
          self.add(v.view);
        });
        //.add(this.ColumnSelect.create({currentProperty$: this.data.axiom$, props: this.data.of.getAxiomsByClass(foam.core.Property), headerProp: this.data.axiom.name}));
        // .start('span').call(this.data.axiom.\tableHeaderFormatter, [this.data.axiom]).end()
        // .tag(this.data.VISIBILITY);
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ColumnConfigView',
  extends: 'foam.u2.View',

  documentation: 'A view for configuring table columns.',

  requires: [
    'foam.u2.tag.ColumnSelect'
  ],

  css: `
    ^ {
      padding: 8px 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
    ^ > * {
      align-self: center;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .add(this.ColumnSelect.create({currentProperty$: this.data.axiom$, props: this.data.of.getAxiomsByClass(foam.core.Property), headerProp: this.data.axiom.name}));
        // .start('span').call(this.data.axiom.tableHeaderFormatter, [this.data.axiom]).end()
        // .tag(this.data.VISIBILITY);
    }
  ]
});
