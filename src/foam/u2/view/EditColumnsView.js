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
  properties: [
    {
      name: 'selectColumnsExpanded',
      class: 'Boolean' 
    },
    'parentId'
  ],
  methods: [
    function closeDropDown(e) {
      e.stopPropagation();
      this.selectColumnsExpanded = !this.selectColumnsExpanded;
    },

    function initE() {
      this.SUPER();

      var self = this;
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
            'left': self.parentId$.map((v) => v ? ( document.getElementById(v).getBoundingClientRect().x - 100 ) : 0 + 'px'),
            'top': self.parentId$.map((v) => v ? document.getElementById(v).getBoundingClientRect().y : 0 + 'px'),
            'position': 'fixed',
            'overflow': 'scroll',
            'margin-bottom': '20px',
            'max-height': self.parentId$.map((v) => v ? window.innerWidth - document.getElementById(v).getBoundingClientRect().y - 100 : 500 + 'px'),
          })
          .add(foam.u2.ViewSpec.createView({ class: 'foam.u2.view.ColumnConfigPropView'}, {data$:this.data$}, this, this.__subSubContext__))
        .end()
      .on('click', this.closeDropDown.bind(this))
      .end();
    }
  ]
});
