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
      min-height: 10vh;
      background-color: #ffffff;
      border: solid 1px #e7eaec;
      border-radius: 5px;
      position: relative;
      padding: 16px;
      transition: all 0.2s linear;
    }
  `,

  documentation: 'A stylized border. Intended for use when creating cards.',

  methods: [
    function initE() {
      this.addClass(this.myClass());
    }
  ]
});
