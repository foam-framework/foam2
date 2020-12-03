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
      box-shadow: 0px 1px 3px 0px #E7E7E7;
      -webkit-box-shadow: 0px 1px 3px 0px #E7E7E7;
      -moz-box-shadow: 0px 1px 3px 0px #E7E7E7;
    }
  `,

  documentation: 'A stylized border. Intended for use when creating cards.',

  methods: [
    function initE() {
      this.addClass(this.myClass())
    }
  ]
});
