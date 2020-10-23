/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.layout',
  name: 'Rows',
  extends: 'foam.u2.Element',
  css: `
    ^ {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: stretch;
    }
  `,
  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass());
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.layout',
  name: 'Cols',
  extends: 'foam.u2.Element',
  css: `
    ^ {
      display: flex;
      justify-content: space-between;
      align-items: stretch;
    }
  `,
  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass());
    }
  ]
});
