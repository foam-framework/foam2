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
          var localStorageKey = this.table.id + '.' + columnName;
          var valueFromLocalStorage = localStorage.getItem(localStorageKey);

          // This will be true only when seeing a new model for the first time.
          if ( valueFromLocalStorage === null ) {
            localStorage.setItem(localStorageKey, 'Y');
            valueFromLocalStorage = true;
          }

          var checkBox = this.CheckBox.create({
            label: axiom.label,

            // Double negate to cast String to Boolean.
            data: !! valueFromLocalStorage
          });

          checkBox.data$.sub(this.updateCols(axiom, index++, localStorageKey));

          this.start().tag(checkBox).end();
        });
    }
  ],

  listeners: [
    function updateCols(axiom, index, localStorageKey) {
      return (_, __, ___, propSlot) => {
        var checked = propSlot.get();
        if ( checked ) {
          // Any truthy string will suffice.
          localStorage.setItem(localStorageKey, 'Y');

          // Put the column back in the correct position.
          this.columns_.splice(index, 0, axiom);

          // Force the view to update.
          this.columns_ = this.columns_.slice();
        } else {
          // Set to the only falsey string. We can't just set the items to true
          // and false because localStorage only stores strings as values.
          localStorage.setItem(localStorageKey, '');

          this.columns_ = this.columns_.filter((col) => col.name !== axiom.name);
        }
      };
    }
  ]
});
