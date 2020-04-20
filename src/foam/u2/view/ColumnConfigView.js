/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

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
        .add(this.ColumnSelect.create({currentProperty: this.data.axiom, props: this.data.of.getAxiomsByClass(foam.core.Property), headerProp: this.data.axiom.name}));
        // .start('span').call(this.data.axiom.tableHeaderFormatter, [this.data.axiom]).end()
        // .tag(this.data.VISIBILITY);
    }
  ]
});
