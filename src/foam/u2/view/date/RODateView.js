/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view.date',
  name: 'RODateView',
  extends: 'foam.u2.View',

  documentation: 'A ReadOnly DateView',

  css: '^ { padding: 8px; }',

  methods: [
    function initE() {
      this.SUPER();
      this.start().
        addClass(this.myClass()).
        add(this.data$.map(d => d ? d.toLocaleDateString() : foam.u2.DateView.DATE_FORMAT)).
      end();
    }
  ]
});
