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

    ^truncate {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
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
        return defaultAction.length >= 1 ? defaultAction[0] : allActions[0];
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
      isAvailable: function(config$editEnabled) {
        return config$editEnabled;
      },
      code: function() {
        if ( ! this.stack ) return;
        this.stack.push({
          class: 'foam.comics.v2.DAOUpdateView',
          data: this.data,
          config: this.config,
          of: this.config.of
        });
      }
    },
    {
      name: 'delete',
      isAvailable: function(config$deleteEnabled) {
        return config$deleteEnabled;
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
      this
        .addClass(this.myClass())
        .add(self.slot(function(data, data$id, config$CRUDActionsAuth$update, config$CRUDActionsAuth$delete, config$browseTitle, config$viewBorder, viewView) {

          // iterate through permissions and replace % with data$id
          var editAction = self.EDIT;
          var deleteAction = self.DELETE;

          if ( config$CRUDActionsAuth$update ) {
            var editArray = config$CRUDActionsAuth$update;

            editArray = editArray.map((permission) => permission.replace('%', data$id) );

            editAction = self.EDIT.clone().copyFrom({
              availablePermissions: self.EDIT.availablePermissions.concat(editArray)
            });
          }

          if ( config$CRUDActionsAuth$delete ) {
            var deleteArray = config$CRUDActionsAuth$delete;

            deleteArray = deleteArray.map((permission) => permission.replace('%', data$id) );

            deleteAction = self.DELETE.clone().copyFrom({
              availablePermissions: self.DELETE.availablePermissions.concat(deleteArray)
            });
          }

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
                    .addClass(this.myClass('truncate'))
                  .end()
                  .startContext({ data }).add(self.primary).endContext()
                .end()
              .end()

              .start(self.Cols)
                .start(self.Cols).addClass(this.myClass('actions-header'))
                  .startContext({ data: self })
                    .tag(editAction, {
                      buttonStyle: foam.u2.ButtonStyle.TERTIARY,
                      icon: 'images/edit-icon.svg'
                    })
                    .tag(deleteAction, {
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
    }
  ]
});
