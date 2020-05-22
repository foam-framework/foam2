/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.comics.v2',
  name: 'DAOCreateView',
  extends: 'foam.u2.View',
  
  topics: [
    'finished',
    'throwError'
  ],
  
  documentation: `
    A configurable view to create an instance of a specified model
  `,

  axioms: [
    foam.pattern.Faceted.create()
  ],

  css:`
    ^ {
      padding: 32px
    }

    ^ .foam-u2-ActionView-back {
      display: flex;
      align-items: center;
    }

    ^account-name {
      font-size: 36px;
      font-weight: 600;
    }

    ^create-view-container {
      margin: auto;
    }
  `,

  requires: [
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows',
    'foam.u2.ControllerMode',
    'foam.u2.dialog.NotificationMessage'
  ],
  imports: [
    'stack',
    'ctrl'
  ],
  exports: [
    'controllerMode'
  ],
  properties: [
    {
      class: 'FObjectProperty',
      name: 'data'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.DAOControllerConfig',
      name: 'config'
    },
    {
      name: 'controllerMode',
      factory: function() {
        return this.ControllerMode.CREATE;
      }
    },
    {
      class: 'foam.u2.ViewSpecWithJava',
      name: 'viewView',
      expression: function() {
        return foam.u2.detail.SectionedDetailView;
      }
    }
  ],
  actions: [
    {
      name: 'save',
      isEnabled: function(data$errors_) {
        return ! data$errors_;
      },
      code: function() {
        var cData = this.data;
        
        this.config.dao.put(cData).then((o) => {
          this.data = o;
          this.finished.pub();

          if ( foam.comics.v2.userfeedback.UserFeedbackAware.isInstance(o) && o.userFeedback ){
            var currentFeedback = o.userFeedback;
            while ( currentFeedback ){
              this.ctrl.add(this.NotificationMessage.create({
                message: currentFeedback.message,
                type: currentFeedback.status.name.toLowerCase()
              }));

              currentFeedback = currentFeedback.next;
            }
          } else {
            this.ctrl.add(this.NotificationMessage.create({
              message: `${this.data.model_.label} created.`
            }));
          }

          this.stack.back();
        }, (e) => {
          this.throwError.pub(e);
          
          // TODO: uncomment this once turn UserFeedbackException into a throwable
          // if ( foam.comics.v2.userfeedback.UserFeedbackException.isInstance(e) && e.userFeedback  ){
          //   var currentFeedback = e.userFeedback;
          //   while ( currentFeedback ){
          //     this.ctrl.add(this.NotificationMessage.create({
          //       message: currentFeedback.message,
          //       type: currentFeedback.status.name.toLowerCase()
          //     }));

          //     currentFeedback = currentFeedback.next;
          //   }
          // } else {
          //   this.ctrl.add(this.NotificationMessage.create({
          //     message: e.message,
          //     type: 'error'
          //   }));
          // }

          if ( e.message === "An approval request has been sent out." ){
            this.ctrl.add(this.NotificationMessage.create({
              message: e.message,
              type: 'success'
            }));

            this.stack.back();
          } else {
            this.ctrl.add(this.NotificationMessage.create({
              message: e.message,
              type: 'error'
            }));
          }
        });
      }
    },
  ],
  methods: [
    function initE() {
      var self = this;
      this.SUPER();
      this
        .addClass(this.myClass())
        .add(self.slot(function(config$viewBorder) {
          return self.E()
            .start(self.Rows)
              .start(self.Rows)
                // we will handle this in the StackView instead
                .startContext({ data: self.stack })
                    .tag(self.stack.BACK, {
                      buttonStyle: foam.u2.ButtonStyle.TERTIARY,
                      icon: 'images/back-icon.svg'
                    })
                .endContext()
                .start(self.Cols).style({ 'align-items': 'center' })
                  .start()
                    .add(self.slot('config$createTitle'))
                    .addClass(this.myClass('account-name'))
                  .end()
                  .startContext({ data: self }).add(self.SAVE).endContext()
                .end()
              .end()
              .start(config$viewBorder)
                .start().addClass(this.myClass('create-view-container'))
                  .tag(this.viewView, { data$: self.data$ })
                .end()
              .end();
        }));
    }
  ]
});
