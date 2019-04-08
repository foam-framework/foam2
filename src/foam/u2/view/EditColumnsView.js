/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'EditColumnsView',
  extends: 'foam.u2.Element',

  requires: [
    'foam.u2.md.CheckBox'
  ],

  properties: [
    {
      name: 'columns'
    },
    {
      name: 'table'
    },
    {
      name: 'columns_'
    }
  ],

  css: `
    ^ {
      text-align: left;
      padding: 10px;
      width: 125px;
    }
    ^ label {
      margin-top: 5px;
    }
  `,

  methods: [
    function initE() {
      var index = 0;
      this
        .addClass(this.myClass())
        .forEach(this.columns, function(columnName) {
          var axiom = this.table.getAxiomByName(columnName);
          var checkBox = this.CheckBox.create({
            label: axiom.label,
            data: true // TODO: Load from localStorage.
          });

          checkBox.data$.sub(this.updateCols(axiom, index++));

          this.start().tag(checkBox).end();
        });
    }
  ],

  listeners: [
    function updateCols(axiom, index) {
      return (_, __, ___, propSlot) => {
        var checked = propSlot.get();
        if ( checked ) {
          this.columns_.splice(index, 0, axiom);

          // Force the view to update.
          this.columns_ = this.columns_.slice();
        } else {
          this.columns_ = this.columns_.filter((col) => col.name !== axiom.name);
        }
      };
    }
  ]
});
