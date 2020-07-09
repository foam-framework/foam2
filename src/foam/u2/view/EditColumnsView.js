/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'EditColumnsView',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.DetailView',
    'foam.u2.view.ColumnConfigPropView',
    'foam.u2.view.ColumnOptionsSelectConfig',
    'foam.u2.view.SubColumnSelectConfig'
  ],
  css: `
  ^drop-down-bg {
    font-size:        12px; 
    position:         fixed; 
    width:            100%; 
    height:           100%; 
    top:              0; 
    left:             0; 
    z-index:          100;
    background:       rgba(0, 0, 0, 0.4);
  }
  `,
  properties: [
    {
      name: 'selectColumnsExpanded',
      class: 'Boolean' 
    },
    'parentId',
    'columnConfigPropView'
  ],
  methods: [
    function closeDropDown(e) {
      e.stopPropagation();
      this.columnConfigPropView.onClose();
      this.selectColumnsExpanded = ! this.selectColumnsExpanded;
    },

    function initE() {
      this.SUPER();

      var self = this;
      this.columnConfigPropView = foam.u2.view.ColumnConfigPropView.create({data:self.data});
      this.start()
        .show(this.selectColumnsExpanded$)
        .addClass(this.myClass('drop-down-bg'))
        .start()
          .style({
            'border-radius': '5px',
            'border': '1px solid /*%GREY4%*/ #e7eaec',
            'background-color': '#f9f9f9',
            'right': '40px',
            'top': '120px',
            'position': 'fixed',
            'height': 'fit-content',
            'max-height': window.innerHeight - 100 > 0 ? window.innerHeight - 100 : window.innerHeight + 'px',
            'width': '300px'
          })
          .add(this.columnConfigPropView)
        .end()
      .on('click', this.closeDropDown.bind(this))
      .end();
    }
  ]
});
