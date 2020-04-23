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
      name: 'allProperties',
      expression: function(allColumns, of) {
        var props = [];
        allColumns.map(axiomName => {//what is overridesMap??? can't find
          props.push(this.of.getAxiomByName(axiomName[0]));
          });
        
        return props;
      }
    },
    'isColumnChanged',
    {
      name: 'views',
      value: []
    }
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

      for (var i = 0; i < self.selectedColumns.length; i++) {
        this.views.push({ i: i, view: this.ColumnSelect.create({props: self.allProperties, selectedColumns:self.selectedColumns[i] })});
      }

      for (var v of this.views) {
        const v1 = v;
        v1.view.isPropertySelected$.sub(function() {
          self.isColumnChanged = true;
          self.selectedColumns[v1.i] = v1.view.selectedColumns;
          // while(currView && currView.currentProperty) {
          //   if ( foam.core.StringArray.isInstance(self.selectedColumns[0]) ) self.selectedColumns[v.i].push([ currView.currentProperty.name, null ]);
          //   else self.selectedColumns[v.i].push(currView.currentProperty.name);
          //   currView = currView.body;
          // }
        });
      }

      this
        .addClass(this.myClass())
        .forEach(this.views, function(v) {
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
