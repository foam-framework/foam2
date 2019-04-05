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
    },
    {
      name: 'selected'
    },
    {
      class: 'Boolean',
      name: 'displaySorted',
      value: false
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
      this.addClass(this.myClass());

      this.selected = [];

      for ( var i = 0; i < this.columns_.length; i++ ) {
        var cb = this.CheckBox.create({
          label: this.columns_[i].label,
          data: true
        });

        this.selected.push(cb.data$);
        var name = this.columns_[i].name;

        cb.data$.sub(this.updateTable.bind(this, name));

        this.add(cb);

        if ( i != this.columns_.length - 1 ) this.start('br').end();
      }
    }
  ],

  listeners: [
    function updateTable(changedProp) {
      var cols = [];

      for ( var i = 0; i < this.columns.length; i++ ) {
        var cbData = this.selected[i].obj.data;
        var isColShown = this.columns_.some((c) => c.name === this.columns[i]);
        var curProp = this.columns[i];

        if (
          ((changedProp == curProp) && cbData) ||
          ((changedProp != curProp) && isColShown)
        ) {
          cols.push(this.table.getAxiomByName(curProp));
        }
      }

      this.columns_ = cols;
    }
  ]
});
