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
      width: 25vw;
    }
    ^main {
      padding: 1vh 2vw 1.5vh 2vw;
    }
    ^ .buttons {
      background: /*%GREY5%*/ #fafafa;
      padding: 2vh;
      box-sizing: border-box;
      display: flex;
      justify-content: flex-end;
    }
    ^ .foam-u2-ActionView-delete,
    ^ .foam-u2-ActionView-delete:hover {
      border-radius: 4px;
      box-shadow: 0 1px 0 0 /*%GREY4%*/ rgba(22, 29, 37, 0.05);
      background: /*%DESTRUCTIVE2%*/ #f91c1c;
      color: white;
      vertical-align: middle;
    }
    ^ .foam-u2-ActionView-delete:hover {
      opacity: 0.9;
    }
    ^ .foam-u2-ActionView-cancel,
    ^ .foam-u2-ActionView-cancel:hover {
      background: none;
      color: /*%GREY1%*/ #525455;
      border: none;
      box-shadow: none;
    }
  `,

  messages: [
    { name: 'TITLE', message: 'Delete ' },
    { name: 'CONFIRM_DELETE_1', message: 'Are you sure you want to delete' },
    { name: 'SUCCESS_MSG', message: 'Successfully deleted' },
    { name: 'FAIL_MSG', message: 'Failed to delete.' }
  ],

  properties: [
    'dao', 'onDelete', 'obj'
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('main'))
          .start('h2')
            .add(this.TITLE).add(this.obj.cls_.name).add('?')
          .end()
          .start('p')
            .add(`${this.CONFIRM_DELETE_1} '${this.obj.toSummary()}'?`)
          .end()
        .end()
        .start()
          .addClass('buttons')
          .startContext({ data: this })
            .add(this.CANCEL)
            .add(this.DELETE)
          .endContext()
        .end();
    }
  ],

  actions: [
    {
      name: 'delete',
      label: 'Delete',
      code: function(X) {
        this.dao.remove(this.obj).then((_) => {
          this.onDelete();
          this.notify(this.SUCCESS_MSG);
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
