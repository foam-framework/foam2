/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.comics.v2',
  name: 'DAOSummaryView',
  extends: 'foam.u2.View',

  documentation: `
    A configurable summary view for a specific instance
  `,

  topics: [
    'finished',
    'throwError'
  ],

  axioms: [
    foam.pattern.Faceted.create()
  ],

  css: `
    ^ {
      padding: 32px
    }

    ^ .foam-u2-ActionView-back {
      display: flex;
      align-items: center;
      width: 30%;
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
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.dialog.Popup',
  ],

  imports: [
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
      of: 'foam.comics.v2.DAOControllerConfig',
      name: 'config'
    },
    {
      name: 'controllerMode',
      factory: function() {
        return this.ControllerMode.VIEW;
      }
    },
    {
      name: 'primary',
      expression: function(config$of) {
        var allActions = config$of.getAxiomsByClass(foam.core.Action);
        var defaultAction = allActions.filter((a) => a.isDefault);
        return defaultAction.length >= 1 
                ? defaultAction[0] 
                : allActions.length >= 1 
                  ? allActions[0]
                  : null;
      }
    },
    {
      class: 'foam.u2.ViewSpecWithJava',
      name: 'viewView',
      expression: function() {
        return foam.u2.detail.SectionedDetailView;
      }
    },
    {
      class: 'String',
      name: 'backLabel',
      expression: function(config$browseTitle) {
        return 'All ' + config$browseTitle;
      }
    }
  ],

  actions: [
    {
      name: 'edit',
      isAvailable: function(config) {
        try {
          return config.editPredicate.f();
        } catch(e) {
          return false;
        }
      },
      code: function() {
        if ( ! this.stack ) return;
        this.stack.push({
          class: 'foam.comics.v2.DAOUpdateView',
          data: this.data,
          config: this.config,
          of: this.config.of
        }, this.__subContext__);
      }
    },
    {
      name: 'delete',
      isAvailable: function(config) {
        try {
          return config.deletePredicate.f();
        } catch(e) {
          return false;
        }
      },
      code: function() {
        this.add(this.Popup.create({ backgroundColor: 'transparent' }).tag({
          class: 'foam.u2.DeleteModal',
          dao: this.config.dao,
          onDelete: () => {
            this.finished.pub();
            this.stack.back();
          },
          data: this.data
        }));
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.SUPER();

      // Get a fresh copy of the data, especially when we've been returned
      // to this view from the edit view on the stack.
      this.config.dao.find(this.data).then(d => { 
        if ( d ) self.data = d; 

        this
          .addClass(this.myClass())
          .add(self.slot(function(data, data$id, config$viewBorder, viewView) {

            return self.E()
              .start(self.Rows)
                .start(self.Rows)
                  // we will handle this in the StackView instead
                  .startContext({ data: self.stack })
                    .tag(self.stack.BACK, {
                      buttonStyle: foam.u2.ButtonStyle.TERTIARY,
                      icon: 'images/back-icon.svg',
                      label: self.backLabel
                    })
                  .endContext()
                  .start(self.Cols).style({ 'align-items': 'center' })
                    .start()
                      .add(data.toSummary())
                      .addClass(this.myClass('account-name'))
                      .addClass('truncate-ellipsis')
                    .end()
                    .startContext({ data }).add(self.primary).endContext()
                  .end()
                .end()

                .start(self.Cols)
                  .start(self.Cols).addClass(this.myClass('actions-header'))
                    .startContext({ data: self })
                      .tag(self.EDIT, {
                        buttonStyle: foam.u2.ButtonStyle.TERTIARY,
                        icon: 'images/edit-icon.svg'
                      })
                      .tag(self.DELETE, {
                        buttonStyle: foam.u2.ButtonStyle.TERTIARY,
                        icon: 'images/delete-icon.svg'
                      })
                    .endContext()
                  .end()
                .end()

                .start(config$viewBorder)
                  .start(viewView, { data }).addClass(this.myClass('view-container')).end()
                .end()
              .end();
          }));
      });
    }
  ]
});
