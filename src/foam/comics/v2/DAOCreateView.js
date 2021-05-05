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
      align-self: flex-start;
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
    'foam.log.LogLevel',
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows',
    'foam.u2.ControllerMode',
    'foam.u2.dialog.NotificationMessage'
  ],
  imports: [
    'ctrl',
    'memento',
    'stack'
  ],
  exports: [
    'controllerMode',
    'currentMemento_ as memento'
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
      class: 'foam.u2.ViewSpec',
      name: 'viewView',
      factory: function() {
        return this.config.createView;
      }
    },
    {
      class: 'String',
      name: 'mementoHead',
      value: 'create'
    },
    'currentMemento_'
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

          if ( foam.comics.v2.userfeedback.UserFeedbackAware.isInstance(o) && o.userFeedback ) {
            var currentFeedback = o.userFeedback;
            while ( currentFeedback ) {
              this.ctrl.notify(currentFeedback.message, '', this.LogLevel.INFO, true);
              currentFeedback = currentFeedback.next;
            }
          } else {
            this.ctrl.notify(`${this.data.model_.label} created.`, '', this.LogLevel.INFO, true);
          }

          this.stack.back();
        }, (e) => {
          this.throwError.pub(e);

          if ( e.exception && e.exception.userFeedback  ) {
            var currentFeedback = e.exception.userFeedback;
            while ( currentFeedback ) {
              this.ctrl.notify(currentFeedback.message, '', this.LogLevel.INFO, true);

              currentFeedback = currentFeedback.next;
            }

            this.stack.back();
          } else {
            this.ctrl.notify(e.message, '', this.LogLevel.ERROR, true);
          }
        });
      }
    },
  ],
  methods: [
    function initE() {
      var self = this;
      this.SUPER();

      if ( this.memento )
        this.currentMemento_$ = this.memento.tail$;

      this
        .addClass(this.myClass())
        .add(self.slot(function(config$viewBorder) {
          return self.E()
            .start(self.Rows)
              .start(self.Rows)
                // we will handle this in the StackView instead
                .startContext({ data: self.stack })
                    .tag(self.stack.BACK, {
                      buttonStyle: foam.u2.ButtonStyle.LINK,
                      icon: 'images/back-icon.svg'
                    })
                .endContext()
                .start(self.Cols).style({ 'align-items': 'center' })
                  .start()
                    .add(self.slot('config$createTitle'))
                    .addClass(this.myClass('account-name'))
                  .end()
                  .startContext({ data: self }).tag(self.SAVE, { buttonStyle: foam.u2.ButtonStyle.PRIMARY }).endContext()
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
