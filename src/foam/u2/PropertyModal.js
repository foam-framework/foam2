/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'PropertyModal',
  extends: 'foam.u2.View',

  documentation: 'View for attaching a choice to a modal',

  imports: [
    'notify'
  ],

  requires: [
    'foam.u2.ControllerMode',
    'foam.u2.detail.SectionedDetailPropertyView'
  ],

  css: `
    ^ {
      border-radius: 3px;
      background-color: #fff;
      max-width: calc(100vw - 48px);
      max-height: calc(100vh - 116px);
      overflow-y: scroll;

      /* TODO: Left the below height as temp fix, need to figure out better way to handle properties rendering in the modal visibly */
      height: 80vh;
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
    { name: 'SUCCESS_MSG', message: ' deleted' },
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
      expression: function(isModalRequired) {
        if ( isModalRequired ) return 'Please provide fill out the following (required)';
        return 'Please fill out the following (optional)';
      }
    },
    {
      class: 'Property',
      name: 'property'
    },
    {
      class: 'Boolean',
      name: 'isModalRequired'
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
          .tag(this.SectionedDetailPropertyView, {
            prop: this.property,
            data$: this.data$
          })
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
      isEnabled: (isModalRequired, property) => {
        if ( ! isModalRequired ) return true;
        return property != '';
      },
      code: function(X) {
        this.onExecute();
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
