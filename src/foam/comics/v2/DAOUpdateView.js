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

  css:`
    ^ {
      padding: 32px
    }

    ^ .foam-u2-ActionView-back {
      display: flex;
      align-items: center;
      width: 50%;
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
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows',
    'foam.u2.ControllerMode',
    'foam.u2.dialog.NotificationMessage'
  ],

  imports: [
    'ctrl',
    'stack'
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
      name: 'workingData',
      expression: function(data) {
        return data.clone(this)
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
      isEnabled: function(workingData$errors_) {
        return ! workingData$errors_;
      },
      code: function() {
        this.data.copyFrom(this.workingData);
        this.config.dao.put(this.data).then(o => {
          this.data = o;
          this.finished.pub();
          this.stack.back();
          this.ctrl.add(this.NotificationMessage.create({
            message: `${this.data.model_.label} updated.`
          }));
        }, e => {
          this.throwError.pub(e);
          this.add(this.NotificationMessage.create({
            message: e.message,
            type: 'error'
          }));
        });
      }
    },
  ],
  methods: [
    function initE() {
      var self = this;
      this.SUPER();
      
      const originalName = this.data.name

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
                    label: originalName
                  })
                .endContext()
                .start(self.Cols).style({ 'align-items': 'center' })
                  .start()
                    .add(data.toSummary())
                      .addClass(this.myClass('account-name'))
                  .end()
                  .startContext({data: self}).add(self.SAVE).endContext()
                .end()
              .end()

              .start(config$viewBorder)
                .start().addClass(this.myClass('view-container'))
                  .add(self.slot(function(viewView) {
                    return self.E().tag(viewView, {
                      data$: self.workingData$
                    });
                  }))
                .end()
              .end()
            .end();
        }));
    }
  ]
});
