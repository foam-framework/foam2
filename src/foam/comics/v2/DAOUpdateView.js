/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.comics.v2',
  name: 'DAOUpdateView',
  extends: 'foam.u2.View',

  topics: [
    'finished',
    'throwError'
  ],

  documentation: `
    A configurable summary view for a specific instance
  `,

  axioms: [
    foam.pattern.Faceted.create()
  ],

  css: `
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

    ^actions-header .foam-u2-ActionView {
      margin-right: 24px;
      line-height: 1.5
    }

    ^view-container {
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

  messages: [
    { name: 'BACK', message: 'Back' },
    { name: 'DETAIL', message: 'Detail' },
    { name: 'TABBED', message: 'Tabbed' },
    { name: 'SECTIONED', message: 'Sectioned' },
    { name: 'MATERIAL', message: 'Material' },
    { name: 'WIZARD', message: 'Wizard' },
    { name: 'VERTICAL', message: 'Vertical' }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      name: 'data'
    },
    {
      class: 'FObjectProperty',
      name: 'workingData',
      expression: function(data) {
        return data.clone(this);
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.DAOControllerConfig',
      name: 'config'
    },
    {
      name: 'controllerMode',
      factory: function() {
        return this.ControllerMode.EDIT;
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'viewView',
      expression: function() {
        return foam.u2.detail.TabbedDetailView;
      }
    },
    'currentMemento_',
    {
      class: 'String',
      name: 'mementoHead',
      getter: function() {
        if ( this.data.id ) {
          var id = '' + this.data.id;
          if ( id && foam.core.MultiPartID.isInstance(this.data.cls_.ID) ) {
            id = id.substr(1, id.length - 2).replaceAll(':', '=');
          }
          return 'edit::' + id;
        }
      }
    }
  ],

  actions: [
    {
      name: 'save',
      isEnabled: function(workingData$errors_) {
        return ! workingData$errors_;
      },
      code: function() {
        this.config.dao.put(this.workingData).then((o) => {
          if ( ! this.data.equals(o) ) {
            this.data = o;
            this.finished.pub();
            if ( foam.comics.v2.userfeedback.UserFeedbackAware.isInstance(o) && o.userFeedback ) {
              var currentFeedback = o.userFeedback;
              while ( currentFeedback ) {
                this.ctrl.notify(currentFeedback.message, '', this.LogLevel.INFO, true);
                currentFeedback = currentFeedback.next;
              }
            } else {
              this.ctrl.notify(`${this.data.model_.label} updated.`, '', this.LogLevel.INFO, true);
            }
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
    }
  ],
  methods: [
    function initE() {
      var self = this;
      this.SUPER();

      if ( this.memento )
        this.currentMemento_$ = this.memento.tail$;

      this
        .addClass(this.myClass())
        .add(self.slot(function(data, config$viewBorder) {
          return self.E()
            .start(self.Rows)
              .start(self.Rows)
                // we will handle this in the StackView instead
                .startContext({ data: self.stack })
                  .tag(self.stack.BACK, {
                    buttonStyle: foam.u2.ButtonStyle.TERTIARY,
                    icon: 'images/back-icon.svg',
                    label: this.BACK
                  })
                .endContext()
                .start(self.Cols).style({ 'align-items': 'center' })
                  .start()
                    .add(data.toSummary())
                    .addClass(this.myClass('account-name'))
                    .addClass('truncate-ellipsis')
                  .end()
                  .startContext({ data: self }).add(self.SAVE).endContext()
                .end()
              .end()

              .start(config$viewBorder)
                .start().addClass(this.myClass('view-container'))
                  .add(self.slot(function(viewView) {
                    var view = foam.u2.ViewSpec.createView(viewView, {
                      data$: self.workingData$
                    }, self, self.__subContext__.createSubContext({ memento: self.memento }));

                    return self.E().add(view);
                  }))
                .end()
              .end()
            .end();
        }));
    }
  ]
});
