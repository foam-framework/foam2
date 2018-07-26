/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'TimeView',
  extends: 'foam.u2.tag.Input',

  documentation: 'View for editing Time values.',

  methods: [
    function initE() {
      this.SUPER();
      this.setAttribute('type', 'time');
    }
  ]
});
