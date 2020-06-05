/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'MemoModal',
  extends: 'foam.u2.View',

  documentation: 'View for attaching a memo to an object',

  imports: [
    'notify'
  ],

  requires: [
    'foam.u2.ControllerMode'
  ],

  css: `
    ^ {
      border-radius: 3px;
      background-color: #fff;
      /* Don't let the modal exceed the screen size, minus some margin. */
      max-width: calc(100vw - 48px);
      max-height: calc(100vh - 116px);
      overflow-y: scroll;
      /* The line below accounts for the top nav bar. */
    }
    ^title {
      padding: 32px 0px;
      font-size: 1.5em;
      font-weight: bold;
    }
    ^main {
      padding: 0px 32px;
    }
    ^ .buttons {
      padding: 32px;
      box-sizing: border-box;
      display: flex;
      justify-content: flex-end;
    }
  `,

  messages: [
    { name: 'CONFIRM_DELETE_1', message: 'Are you sure you want to delete' },
    { name: 'SUCCESS_MSG', message: ' deleted.' },
    { name: 'FAIL_MSG', message: 'Failed to delete' }
  ],

  properties: [
    {
      class: 'Function',
      name: 'onExecute'
    },
    {
      class: 'String',
      name: 'title',
      expression: function(isMemoRequired) {
        if ( isMemoRequired ) return 'Please provide a note (required)';
        return 'Please provide a note (optional)';
      }
    },
    {
      class: 'String',
      name: 'memo',
      view: {
        class: 'foam.u2.tag.TextArea',
        rows: '8px',
        onKey: true
      }
    },
    {
      class: 'Boolean',
      name: 'isMemoRequired'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('main'))
          .start()
            .addClass(this.myClass('title'))
            .add(this.title)
          .end()
          .startContext({ data: this, controllerMode: this.ControllerMode.EDIT })
            .tag(this.MEMO)
          .endContext()
        .end()
        .start()
          .addClass('buttons')
          .startContext({ data: this })
            .tag(this.CANCEL, { buttonStyle: 'SECONDARY' })
            .tag(this.OK)
          .endContext()
        .end();
    }
  ],

  actions: [
    {
      name: 'ok',
      isEnabled: (isMemoRequired, memo) => {
        if ( ! isMemoRequired ) return true;
        return memo != '';
      },
      code: function(X) {
        this.onExecute(this.memo);
        X.closeDialog();
      }
    },
    {
      name: 'cancel',
      code: function(X) {
        X.closeDialog();
      }
    }
  ]
});
