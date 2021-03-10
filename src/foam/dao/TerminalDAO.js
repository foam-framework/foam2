/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'TerminalDAO',
  documentation: `
    This should be used as a mixin.
    Represents a DAO endpoint that should not be cloned.
  `,

  methods: [
    function clone() {
      return this;
    }
  ]
});
