/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ValueView',
  extends: 'foam.u2.View',

  documentation: 'Just shows the value of data as a string.',

  methods: [
    function initE() {
      this.SUPER();
      return this.add(this.data$);
    }
  ],
});
