/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.borders',
  name: 'Block',
  extends: 'foam.u2.Element',

  documentation: `
    A vertical line and padding to the left of its contents.
    This looks similar to a block quote, but can also group data within cards.
  `,

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
