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
  properties: [
    {
      name: 'selectColumnsExpanded',
      class: 'Boolean' 
    },
    'parentId',
    'view'
  ],
  methods: [
    function closeDropDown(e) {
      e.stopPropagation();
      this.view.onClose();
      this.selectColumnsExpanded = ! this.selectColumnsExpanded;
    },

    function initE() {
      this.SUPER();

      var self = this;
      this.view = foam.u2.view.ColumnConfigPropView.create({data:self.data});
      this.start()
        .show(this.selectColumnsExpanded$)
        .style({
          'font-size': '12px',
          'position': 'fixed',
          'width': '100%',
          'height': '100%',
          'top': '0px',
          'left': '0px',
          'z-index': '3',
        })
        .start()
          .style({
            'border-radius': '5px',
            'border': '1px solid /*%GREY4%*/ #e7eaec',
            'background-color': '#f9f9f9',
            'left': self.parentId$.map((v) => v ? ( document.getElementById(v).getBoundingClientRect().x - 250 > 0 ? document.getElementById(v).getBoundingClientRect().x - 250 : document.getElementById(v).getBoundingClientRect().x ) : 0 + 'px'),
            'top': '40px',
            'position': 'fixed',
            'margin-bottom': '20px',
            'height': 'fix-content',
            'max-height': window.innerHeight - 100 > 0 ? window.innerHeight - 100 : window.innerHeight + 'px',
            'width': '300px'
          })
          .add(this.view)
        .end()
      .on('click', this.closeDropDown.bind(this))
      .end();
    }
  ]
});
