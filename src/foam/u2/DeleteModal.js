foam.CLASS({
  package: 'foam.u2',
  name: 'DeleteModal',
  extends: 'foam.u2.View',

  documentation: 'View for deleting any object',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'net.nanopay.model.Invitation',
    'net.nanopay.model.InvitationStatus'
  ],

  imports: [
    'businessInvitationDAO',
    'notify',
    'tokenDAO'
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
      class: 'FObjectProperty',
      name: 'data'
    },
    {
      class: 'Long',
      name: 'sourceId',
      documentation: 'Id for deleting clientUserJunction and filtering businessInvitation by createdID'
    },
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
        var self = this;
        this.dao.remove(this.data).then((o) => {
          if ( foam.comics.v2.userfeedback.UserFeedbackAware.isInstance(o) && o.userFeedback ){
            var currentFeedback = o.userFeedback;
            while ( currentFeedback ){

              this.notify(currentFeedback.message);

              currentFeedback = currentFeedback.next;
            }
          } else if ( net.nanopay.model.ClientUserJunction.isInstance(o) ) {
            self.businessInvitationDAO
              .where(
                self.AND(
                  self.EQ(self.Invitation.EMAIL, o.email.toString()),
                  self.EQ(self.Invitation.STATUS, self.InvitationStatus.SENT),
                  self.EQ(self.Invitation.CREATED_BY, self.sourceId)
                )
              ).select().then(function(invite) {
                console.log("removed");
                for ( var i = 0; i < invite.array.length; i++ ) {
                  self.businessInvitationDAO.remove(invite.array[i]).then(function() {
                    self.notify(self.data.model_.label + self.SUCCESS_MSG);
                    self.onDelete();
                  }).catch((err) => {
                    var message = err ? err.message : self.FAIL_MSG;
                    self.notify(message, 'error');
                  })
                }
            });
          } else {
            this.notify(this.data.model_.label + this.SUCCESS_MSG);
          }

          if ( ! net.nanopay.model.ClientUserJunction.isInstance(o) )
            this.onDelete();
        }).catch((err) => {

          // TODO: Uncomment once we turn UserFeedbackException in to a throwable
          // if ( foam.comics.v2.userfeedback.UserFeedbackException.isInstance(err) && err.userFeedback  ){
          //   var currentFeedback = err.userFeedback;
          //   while ( currentFeedback ){
          //     this.notify(currentFeedback.message);

          //     currentFeedback = currentFeedback.next;
          //   }
          // } else {
          //   this.notify(err.message || this.FAIL_MSG, 'error');
          // }

          if ( err.message === "An approval request has been sent out."  ){
            this.notify(err.message);

          } else {
            this.notify(err.message || this.FAIL_MSG, 'error');
          }


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
