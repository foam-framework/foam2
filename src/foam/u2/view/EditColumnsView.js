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
      'foam.u2.CheckBox'
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
      // }
      this.selected = []

      for (let i = 0; i < this.columns_.length; i++) {
        var cb = this.CheckBox.create({
          label: this.columns_[i].label,
          data: true
        });

        this.selected.push(cb.data$);

        // Subscribes updateTable listener to checkbox data
        cb.data$.sub(this.updateTable.bind(this));

        this.add(cb);

        console.log(this.selected)

        if (i != this.columns_.length - 1) this.start('br').end();
      }
    }
  ],

  listeners: [
    /*function onPropChange(changedProp, cb, _, old, nu) {
      console.log('onPropChange ------------------------')

      // if ( this.displaySorted ) {
      //   // TODO: How should this block be tested?
      //   out = this.selectedProperties.slice();
      //   if ( nu && !selected[changedProp.name] ) {
      //     out.push(changedProp);
      //   }
      //   if ( !nu && selected[changedProp.name] ) {
      //     out.splice(out.indexOf(changedProp), 1);
      //   }
      // } else {
        for (var i = 0; i < this.allColumns.length; i++) {
          var p = this.properties[i];
          
          p.visible = ((p.prop === changedProp && cb.data) || 
                        (p.visible && (p.prop !== changedProp || cb.data)));
        }
      // }

      this.propertyChange.pub('properties')
    }*/
    function updateTable() {
      console.log('updating table')
      var cols = [];

      for (var i = 0; i < this.columns.length; i++) {
        console.log('selected', this.selected[i].obj.data)
        if (this.selected[i].obj.data) 
          //cols.push(this.table.getAxiomByName(this.columns[i]))
          cols.push({name: this.columns[i]})
      }

      console.log('before', this.columns_)
      this.columns_ = cols;
      this.propertyChange.pub('columns_')
      console.log('after', this.columns_)
    }
  ]
});
