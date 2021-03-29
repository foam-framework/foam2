/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.borders',
  name: 'Block',
  extends: 'foam.u2.Element',

  css: `
    ^ {
      border-left: 4px solid /*%GREY4%*/ #e7eaec;
      padding-left: 16px;
    }
  `,

  methods: [
    function initE() {
      this.addClass(this.myClass());
    }
  ]
});
