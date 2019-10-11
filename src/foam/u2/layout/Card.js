/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.layout',
  name: 'Card',
  extends: 'foam.u2.layout.GUnit',
  documentation: `
    A card based on a responsive grid system
  `,

  css: `
    ^ {
      padding: 8px;
      border-radius: 6px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
      border: solid 1px #e7eaec;
      background-color: #ffffff;
    }
  `,

  methods: [
    function initE() {
      this.addClass(this.myClass());
      this.SUPER();
    }
  ]
});
