/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.layout',
  name: 'MDRowView',
  extends: 'foam.u2.View',

  documentation: `
    Container view for CitationView. Defines main layout of a single row in a list
  `,

  requires: [
    'foam.u2.layout.MDCitationView'
  ],

  exports: [
    'as rowView'
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start().addClass('md-row')
          .tag(this.MDCitationView, {
            of: this.data.cls_,
            data: this.data
          })
        .end();
    }
  ],

  css: `
    ^ {
      padding: 3rem;
      font-size: 2.5rem;
      font-weight: 300;
      border-bottom: 1px solid /*%GREY3%*/;
    }

    ^ .md-row {
      display: flex;
      flex-direction: row;
      color: /*%GREY1%*/ #5e6061;
    }
  `
});
