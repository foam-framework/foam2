/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'ConfirmationModal',
  extends: 'foam.u2.View',

  documentation: `
    This view is a confirmation modal for any action. 
    Should only be called in the view property of an action.
  `,

  imports: [
    'closeDialog'
  ],

  css: `
    ^ {
      border-radius: 3px;
      background-color: #fff;
      max-width: calc(100vw - 48px);
      max-height: calc(100vh - 116px);
      overflow-y: scroll;
    }
    ^main {
      padding: 24px;
    }
    ^main > h2:first-child {
      margin-top: 0;
    }
    ^ .buttons {
      padding: 24px;
      box-sizing: border-box;
      display: flex;
      justify-content: flex-end;
    }
  `,

  messages: [
    { name: 'CONFIRM_MSG', message: 'Are you sure you want to ' }
  ],

  properties: [
    {
      name: 'title',
      class: 'String'
    },
    {
      name: 'body',
      class: 'String'
    },
    'data',
    'action'
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass())
        .start().addClass(this.myClass('main'))
          .start('h2')
            .add(this.title ? this.title : this.action.label + ' ' + `${this.data.toSummary()}`).add('?')
          .end()
          .start('p')
            .add(this.body ? this.body: `${this.CONFIRM_MSG} ` + this.action.label.toLowerCase() + ' ' + `${this.data.toSummary()}`).add('?')
          .end()
        .end()
        .start().addClass('buttons')
          .startContext({ data: this })
            .tag(this.CANCEL, { buttonStyle: 'SECONDARY' })
            .tag(this.CONFIRM, { isDestructive: true })
          .endContext()
        .end();
    }
  ],
  
  actions: [
    {
      name: 'confirm',
      label: 'Confirm',
      code: function(X) {
        this.action && this.action.maybeCall(X, this.data);
        X.closeDialog();
      }
    },
    {
      name: 'cancel',
      label: 'Cancel',
      code: function(X) {
        X.closeDialog();
      }
    }
  ]
});
