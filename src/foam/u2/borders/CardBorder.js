/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.borders',
  name: 'CardBorder',
  extends: 'foam.u2.Element',

  css: `
    ^ {
      border: solid 1px #e7eaec;
      background-color: #ffffff;
      border-radius: 3px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
    }
  `

  documentation: `
    An unstyled border. Intended for use as a default value for
    border properties.
  `
});
