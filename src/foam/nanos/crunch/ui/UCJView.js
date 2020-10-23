/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'UCJView',
  extends: 'foam.u2.View',
  documentation: `
    Views the capability ID (in data) by fetching the UCJ associated with
    the subject in context and displaying it in READ mode.

    UCJView also provides an Edit action, which will present a popup
    allowing the user to make changes to the UCJ.

    This can be thought of as a view of a capability that is personalized
    to the user.
  `,

  methods: [
    function initE() {
      this.SUPER();
    }
  ]

  // TODO: fetch UCJ
  // TODO: create UCJEditView for popup
  // TODO: add edit action (creates popup)
});
