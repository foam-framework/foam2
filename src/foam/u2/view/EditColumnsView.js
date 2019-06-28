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
    'foam.core.SimpleSlot',
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
          var axiom = typeof columnName === 'string'
            ? this.table.getAxiomByName(columnName)
            : columnName;
          var localStorageKey = this.table.id + '.' + columnName;

          var slot = this.SimpleSlot.create();

          this
            .start()
              .tag(this.CheckBox, {
                label: axiom.label,
                data: localStorage.getItem(localStorageKey) === null
              }, slot)
            .end();

          this.onDetach(slot.value.data$.sub(this.updateCols(axiom, index++, localStorageKey)));
        });
    }
  ],

  listeners: [
    function updateCols(axiom, index, localStorageKey) {
      return (_, __, ___, propSlot) => {
        var checked = propSlot.get();
        if ( checked ) {
          localStorage.removeItem(localStorageKey);

          // Put the column back in the correct position.
          this.columns_.splice(index, 0, axiom);

          // Force the view to update.
          this.columns_ = this.columns_.slice();
        } else {
          // The string isn't important, all that matters is that there's some
          // value for this key.
          localStorage.setItem(localStorageKey, 'Y');
          this.columns_ = this.columns_.filter((col) => col.name !== axiom.name);
        }
      };
    }
  ]
});
