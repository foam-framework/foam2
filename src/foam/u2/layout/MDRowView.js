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
          this.tag(this.MDCitationView, {
            of: this.data.cls_,
            data: this.data
          })
    }
  ]
});
