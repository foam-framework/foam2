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
  
  methods: [
    function initE() {
      // if ( this.displaySorted ) {
      //   // TODO: How should this block be tested?
      //   var props = this.properties;
      //   props = this.properties.slice();
      //   props.sort(function(a, b) {
      //     return a.label.toLowerCase().compareTo(b.label.toLowerCase());
      //   });
      // } else { ...

      this.selected = []

      for ( var i = 0 ; i < this.columns_.length ; i++ ) {
        var cb = this.CheckBox.create({
          label: this.columns_[i].label,
          data: true
        });

        this.selected.push(cb.data$);
        var name = this.columns_[i].name;

        // Subscribes updateTable listener to checkbox data
        cb.data$.sub(this.updateTable.bind(this, name));

        this.add(cb);

        // Ensures each selection is on a new line
        if ( i != this.columns_.length - 1 ) this.start('br').end();
      }
    }
  ],

  listeners: [
    function updateTable(changedProp) {
      var cols = [];

      // if ( this.displaySorted ) {
      //   // TODO: How should this block be tested?
      //   out = this.selectedProperties.slice();
      //   if ( nu && !selected[changedProp.name] ) {
      //     out.push(changedProp);
      //   }
      //   if ( !nu && selected[changedProp.name] ) {
      //     out.splice(out.indexOf(changedProp), 1);
      //   }
      // }
      // else { ...

      for ( var i = 0 ; i < this.columns.length ; i++ ) {
        var cbData = this.selected[i].obj.data;
        var isColShown = this.columns_.some(c => c.name === this.columns[i]);
        var curProp = this.columns[i];

        // Determines if the curProp is the one which has changed,
        // if so adds col if cb is checked. Otherwise if curProp hasn't
        // changed, then checks if it was previously shown, if so, keeps in view.
        if ( ((changedProp == curProp) && cbData) ||
             ((changedProp != curProp) && isColShown) ) {
          // Gets the table column from the column name, and pushes to cols array
          cols.push(this.table.getAxiomByName(curProp))
        }
      }

      this.columns_ = cols;
    }
  ]
});
