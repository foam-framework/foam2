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
      background-color: #ffffff;
      border: solid 1px #e7eaec;
      box-shadow: 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12), 0 2px 4px -1px rgba(0,0,0,0.20);
      padding: 6px;
    }
  `,

  documentation: 'A stylized border. Intended for use when creating cards.',

  methods: [
    function initE() {
      this.addClass(this.myClass())
    }
  ]
});
