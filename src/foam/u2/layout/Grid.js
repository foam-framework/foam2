/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.layout',
  name: 'Grid',
  extends: 'foam.u2.Element',
  documentation: `
    A grid of responsive elements
  `,

  css: `
    ^ {
      display: flex;
      justify-content: flex-start;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass());
    }
  ]
});
