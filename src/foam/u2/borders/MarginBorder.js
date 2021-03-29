/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.borders',
  name: 'MarginBorder',
  extends: 'foam.u2.Element',

  documentation: 'A border which adds equal margin to all sides.',

  properties: [
    {
      name: 'margin',
      class: 'String',
      value: '24px'
    }
  ],

  methods: [
    function initE() {
      this.style({'margin': this.margin$});
    }
  ]
});
