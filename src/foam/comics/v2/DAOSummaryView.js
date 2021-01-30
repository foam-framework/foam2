/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.comics.v2',
  name: 'DAOSummaryView',
  extends: 'foam.u2.View',

  documentation: 'A configurable summary view for a specific instance',

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
      align-self: flex-start;
    }

    ^account-name {
      font-size: 36px;
      font-weight: 600;
      margin-bottom: 32px;
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
    'foam.nanos.controller.Memento',
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows',
    'foam.u2.ControllerMode',
    'foam.u2.dialog.Popup'
  ],

  imports: [
    'auth',
    'memento',
    'stack'
  ],

  exports: [
    'controllerMode',
    'as objectSummaryView',
    'currentMemento as memento'
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
      factory: function() {
        return foam.u2.detail.TabbedDetailView;
      }
    },
    {
      class: 'String',
      name: 'backLabel',
      expression: function(config$browseTitle) {
        return 'All ' + config$browseTitle;
      }
    },
    {
      name: 'onBack',
      factory: function() {
        return () => this.stack.back();
      }
    },
    'currentMemento',
    {
      class: 'String',
      name: 'mementoHead',
      factory: function() {
        return this.idOfRecord;
      }
    },
    'idOfRecord'
  ],

  actions: [
    {
      name: 'back',
      code: (data) => data.onBack()
    },
    {
      name: 'edit',
      isEnabled: function(config, data) {
        if ( config.CRUDEnabledActionsAuth && config.CRUDEnabledActionsAuth.isEnabled ) {
          try {
            let permissionString = config.CRUDEnabledActionsAuth.enabledActionsAuth.permissionFactory(foam.nanos.ruler.Operations.UPDATE, data);

            return this.auth.check(null, permissionString);
          } catch(e) {
            return false;
          }
        }
        return true;
      },
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
          class:  'foam.comics.v2.DAOUpdateView',
          data:   this.data,
          config: this.config,
          of:     this.config.of
        }, this.__subContext__);
      }
    },
    {
      name: 'copy',
      isEnabled: function(config, data) {
        if ( config.CRUDEnabledActionsAuth && config.CRUDEnabledActionsAuth.isEnabled ) {
          try {
            let permissionString = config.CRUDEnabledActionsAuth.enabledActionsAuth.permissionFactory(foam.nanos.ruler.Operations.CREATE, data);

            return this.auth.check(null, permissionString);
          } catch(e) {
            return false;
          }
        }
        return true;
      },
      isAvailable: function(config) {
        try {
          return config.createPredicate.f();
        } catch(e) {
          return false;
        }
      },
      code: function() {
        if ( ! this.stack ) return;
        let newRecord = this.data.clone();
        // Clear PK so DAO can generate a new unique one
        newRecord.id = undefined;
        this.stack.push({
          class: 'foam.comics.v2.DAOCreateView',
          data: newRecord,
          config: this.config,
          of: this.config.of
        }, this.__subContext__);
      }
    },
    {
      name: 'delete',
      isEnabled: function(config, data) {
        if ( config.CRUDEnabledActionsAuth && config.CRUDEnabledActionsAuth.isEnabled ) {
          try {
            let permissionString = config.CRUDEnabledActionsAuth.enabledActionsAuth.permissionFactory(foam.nanos.ruler.Operations.REMOVE, data);

            return this.auth.check(null, permissionString);
          } catch(e) {
            return false;
          }
        }
        return true;
      },
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
      if ( this.memento )
        this.currentMemento$ = this.memento.tail$;

      var promise = this.data ? Promise.resolve(this.data) : this.config.unfilteredDAO.inX(this.__subContext__).find(this.idOfRecord);

      // Get a fresh copy of the data, especially when we've been returned
      // to this view from the edit view on the stack.
      promise.then(d => {
        if ( d ) self.data = d;
        if ( self.currentMemento && self.currentMemento.tail && self.currentMemento.tail.head.toLowerCase() === 'edit' ) {
          self.edit();
        } else {
          this
          .addClass(this.myClass())
          .add(self.slot(function(data, config$viewBorder, viewView) {
            return self.E()
              .start(self.Rows)
                .start(self.Rows)
                  // we will handle this in the StackView instead
                  .startContext({ onBack: self.onBack })
                    .tag(self.BACK, {
                      buttonStyle: foam.u2.ButtonStyle.TERTIARY,
                      icon: 'images/back-icon.svg',
                      label: self.backLabel
                    })
                  .endContext()
                  .start(self.Cols).style({ 'align-items': 'center' })
                    .start()
                      .add(data && data.toSummary() ? data.toSummary() : '')
                      .addClass(self.myClass('account-name'))
                      .addClass('truncate-ellipsis')
                    .end()
                    .startContext({ data }).add(self.primary).endContext()
                  .end()
                .end()

                .start(self.Cols)
                  .start(self.Cols).addClass(self.myClass('actions-header'))
                    .startContext({ data: self })
                      .tag(self.EDIT, {
                        buttonStyle: foam.u2.ButtonStyle.TERTIARY,
                        icon: 'images/edit-icon.svg'
                      })
                      .tag(self.COPY, {
                        buttonStyle: foam.u2.ButtonStyle.TERTIARY,
                        icon: 'images/copy-icon.svg'
                      })
                      .tag(self.DELETE, {
                        buttonStyle: foam.u2.ButtonStyle.TERTIARY,
                        icon: 'images/delete-icon.svg'
                      })
                    .endContext()
                  .end()
                .end()
                .start(config$viewBorder)
                  .start(viewView, { data }).addClass(self.myClass('view-container')).end()
                .end()
              .end();
          }));
        }
      });
    }
  ]
});
