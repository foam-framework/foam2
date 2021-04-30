/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'SpinnerAgent',
  documentation: `
    Displays and exports a loading spinner to prevent a user from reloading the
    page when data is still being saved after the wizard closes.
  `,

  implements: [
    'foam.core.ContextAgent'
  ],

  imports: [
    'ctrl'
  ],

  exports: [
    'as spinnerAgent'
  ],

  requires: [
    'foam.u2.LoadingSpinner',
    'foam.u2.dialog.Popup'
  ],

  methods: [
    async function execute() {
      var popup = this.Popup.create({
        closeable: false,
        isStyled: false
      })
        .start(this.LoadingSpinner)
          .style({
            display: 'flex',
            width: '80px',
            height: '80px'
          })
        .end();
      this.ctrl.add(popup);
      this.onDetach(popup.close.bind(popup));
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'DetachSpinnerAgent',
  flags: ['web'],
  documentation: `
    todo.
  `,

  imports: [
    'spinnerAgent?'
  ],

  implements: [
    'foam.core.ContextAgent'
  ],

  methods: [
    async function execute() {
      this.spinnerAgent && this.spinnerAgent.detach();
    }
  ]
});
