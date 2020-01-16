foam.CLASS({
  package: 'foam.u2',
  name: 'DeleteModal',
  extends: 'foam.u2.View',

  documentation: 'View for deleting any object',

  imports: [
    'notify'
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
      margin-top: 60px;
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
    { name: 'TITLE', message: 'Delete ' },
    { name: 'CONFIRM_DELETE_1', message: 'Are you sure you want to delete' },
    { name: 'SUCCESS_MSG', message: ' deleted.' },
    { name: 'FAIL_MSG', message: 'Failed to delete' }
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao'
    },
    {
      class: 'Function',
      name: 'onDelete'
    },
    {
      class: 'FObject',
      name: 'data'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('main'))
          .start('h2')
            .add(this.TITLE).add(this.data.model_.label).add('?')
          .end()
          .start('p')
            .add(`${this.CONFIRM_DELETE_1} ${this.data.toSummary()}?`)
          .end()
        .end()
        .start()
          .addClass('buttons')
          .startContext({ data: this })
            .tag(this.CANCEL, { buttonStyle: 'SECONDARY' })
            .tag(this.DELETE, { isDestructive: true })
          .endContext()
        .end();
    }
  ],

  actions: [
    {
      name: 'delete',
      label: 'Delete',
      code: function(X) {
        this.dao.remove(this.data).then((_) => {
          this.notify(this.data.model_.label + this.SUCCESS_MSG);
          this.onDelete();
        }).catch((err) => {
          this.notify(err.message || this.FAIL_MSG, 'error');
        });
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
