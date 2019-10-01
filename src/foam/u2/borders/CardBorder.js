/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.borders',
  name: 'CardBorder',
  extends: 'foam.u2.Element',

  css: `
    ^ {
      border-radius: 6px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
      border: solid 1px #e7eaec;
      background-color: #ffffff;
    }
  `,

  documentation: `
    A stylized border. Intended for use when creating cards.
  `,

  methods: [
    function initE() {
      this.addClass(this.myClass())
    }
  ]
});
