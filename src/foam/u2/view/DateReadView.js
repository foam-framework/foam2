/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'DateReadView',
  extends: 'foam.u2.View',

  documentation: 'formats date based on locale',

  imports: ['formatDate'],

  methods: [
    function initE() {
      this.SUPER();
      return this.add(this.formatDate(this.data));
    }
  ]
});
