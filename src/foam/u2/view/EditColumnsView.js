// /**
//  * @license
//  * Copyright 2019 The FOAM Authors. All Rights Reserved.
//  * http://www.apache.org/licenses/LICENSE-2.0
//  */
foam.CLASS({
  package: 'foam.u2.view',
  name: 'EditColumnsView',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.DetailView',
    'foam.u2.view.ColumnOptionsSelectConfig',
    'foam.u2.view.ColumnConfigPropView',
    'foam.u2.view.SubColumnSelectConfig'
  ],
  actions: [
    {
      name: 'save',
      code: function() {
        var selectedColumns = [];
        for ( var i = 0; i < this.columns.length; i++ ) {
          if ( this.columns[i].selectedColumns.length != 0)
            selectedColumns.push(this.columns[i].selectedColumns.join('.'));
        }
        // if ( this.view.isColumnChanged ) {
          localStorage.removeItem(this.of.id);
          localStorage.setItem(this.of.id, JSON.stringify(selectedColumns));
          this.isColumnChanged = !this.isColumnChanged;
        // }
        this.stack.back();
      }
    }
  ],
  properties: [
    {
      name: 'selectColumnsExpanded',
      class: 'Boolean' 
    }
  ],
  methods: [
    function closeDropDown(e) {
      e.stopPropagation();
      this.selectColumnsExpanded = !this.selectColumnsExpanded;
    },

    function initE() {
      this.start()
        .show(this.selectColumnsExpanded$)
        .style({
          'font-size': '12px',
          'position': 'fixed',
          'width': '100%',
          'height': '100%',
          'top': '0px',
          'left': '0px',
          'z-index': '1',
        })
        .start()
          .style({
            'background-color': '#f9f9f9',
            'top': '20px',
            'left': '1050px',
            'position': 'fixed',
            'overflow': 'scroll',
            'margin-bottom': '0px',
            'padding-bottom': '400px',
            'height': '100vh'
          })
          .add(foam.u2.ViewSpec.createView({ class: 'foam.u2.view.ColumnConfigPropView'}, {data$:this.data$}, this, this.__subSubContext__))
        .end()
      .on('click', this.closeDropDown.bind(this))
      .end();
    }
  ]
});
