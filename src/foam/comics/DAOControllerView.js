/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.comics',
  name: 'DAOControllerView',
  extends: 'foam.u2.View',

  requires: [
    'foam.comics.SearchMode',
    'foam.comics.DAOController',
    'foam.comics.DAOUpdateControllerView',
    'foam.u2.view.ScrollTableView',
    'foam.u2.dialog.Popup'
  ],

  imports: [
    'createControllerView? as importedCreateControllerView',
    'data? as importedData',
    'stack',
    'summaryView? as importedSummaryView',
    'updateView? as importedUpdateView',
    'window'
  ],

  exports: [
    'as controllerView',
    'data.selection as selection',
    'data.data as dao',
    'data.searchColumns as searchColumns',
    'dblclick'
  ],

  css: `
    ^ {
      width: fit-content;
      max-width: 100vw;
      margin: auto;
    }

    ^top-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 10px;
    }

    ^title-container > * {
      color: #555;
      display: inline-block;
      margin: 0.67rem 0;
    }

    ^title-container > * + * {
      margin-left: 1rem;
    }

    ^container {
      display: flex;
    }

    ^container > * + * {
      margin-left: 10px;
    }

    ^ .actions {
      display: inline-block;
      margin-bottom: 8px;
    }

    ^ .actions .net-nanopay-ui-ActionView {
      margin: 0 10px 10px 0;
    }

    ^ .actions button + button {
      margin-left: 8px;
    }

    ^ .net-nanopay-ui-ActionView {
      width: 128px;
      height: 40px;
      background: #0098db;
      color: white;
      border-radius: 4px;
      box-shadow: 0 1px 0 0 rgba(22, 29, 37, 0.05);
      font-weight: 500;
      font-size: 14px;
    }
  `,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.comics.DAOController',
      name: 'data',
      expression: function(importedData) {
        return importedData;
      }
    },
    {
      name: 'cls',
      expression: function(data) {
        return data.cls_;
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'summaryView',
      factory: function() {
        return this.data.summaryView || this.importedSummaryView || {
          class: 'foam.u2.view.ScrollTableView'
        };
      }
    },
    {
      name: 'createControllerView',
      expression: function() {
        return this.importedCreateControllerView || {
          class: 'foam.comics.DAOCreateControllerView'
        };
      }
    },
    {
      name: 'updateView',
      expression: function() {
        return this.importedUpdateView || {
          class: 'foam.comics.DAOUpdateControllerView'
        };
      }
    }
  ],

  reactions: [
    ['data', 'action.create', 'onCreate'],
    ['data', 'edit', 'onEdit'],
    ['data', 'action.findRelatedObject', 'onFindRelated'],
    ['data', 'finished', 'onFinished'],
    ['data', 'export', 'onExport']
  ],

  methods: [
    function initE() {
      var self = this;

      this.data.border.add(
        this.E()
          .addClass(this.myClass())
          .start()
            .addClass(this.myClass('top-row'))
            .start()
              .addClass(this.myClass('title-container'))
              .start('h1')
                .add(this.data.title$)
              .end()
              .add(this.data.subtitle$)
            .end()
            .callIfElse(this.data.primaryAction, function() {
              this.startContext({ data: self })
                .start()
                  .add(self.data.primaryAction)
                .end()
              .endContext();
            }, function() {
              if ( self.data.createLabel ) {
                this.tag(self.cls.CREATE, { label$: self.data.createLabel$ });
              } else {
                this.start().add(self.cls.CREATE).end();
              }
            })
          .end()
          .start()
            .addClass(this.myClass('container'))
            .callIf(this.data.searchMode === this.SearchMode.FULL, function() {
              this.start()
                .hide(self.data.searchHidden$)
                .add(self.cls.PREDICATE.clone().copyFrom({
                  view: { class: 'foam.u2.view.ReciprocalSearch' }
                }))
              .end();
            })
            .start()
              .style({ 'overflow-x': 'auto' })
              .start()
                .addClass('actions')
                .show(self.mode$.map((m) => m === foam.u2.DisplayMode.RW))
                .start()
                  .add(self.cls.getAxiomsByClass(foam.core.Action).filter((action) => {
                    var rtn = true;
                    if ( ! self.primaryAction ) {
                      rtn = rtn && action.name !== 'create';
                    }
                    if ( self.data.searchMode !== self.SearchMode.FULL ) {
                      rtn = rtn && action.name !== 'toggleFilters';
                    }
                    return rtn;
                  }))
                .end()
              .end()
              .callIf(this.data.searchMode === this.SearchMode.SIMPLE, function() {
                this.start().add(self.cls.PREDICATE.clone().copyFrom({
                  view: { class: 'foam.u2.view.SimpleSearch' }
                })).end();
              })
              .start()
                .style({ 'overflow-x': 'auto' })
                .tag(this.summaryView, { data$: this.data.filteredDAO$ })
              .end()
            .end()
          .end());

      this.add(this.data.border);
    },

    function dblclick(obj) {
      if ( this.data.dblclick ) {
        this.data.dblclick(obj);
      } else {
        this.onEdit(null, null, obj.id);
      }
    }
  ],

  listeners: [
    function onCreate() {
      this.stack.push({
        class: this.createControllerView.class,
        detailView: this.data.detailView
      }, this);
    },

    function onEdit(s, edit, id) {
      this.stack.push({
        class: this.updateView.class,
        detailView: this.data.detailView,
        key: id
      }, this);
    },

    function onFindRelated() {
      var data = this.DAOController.create({
        data: this.data.relationship.targetDAO,
        addEnabled: true,
        relationship: this.data.relationship
      });

      this.stack.push({
        class: 'foam.comics.DAOControllerView',
        data: data
      }, this);
    },

    function onFinished() {
      this.stack.back();
    },

    function onExport(dao) {
      this.add(this.Popup.create().tag({
        class: 'foam.u2.ExportModal',
        exportData: dao.src.filteredDAO
      }));
    }
  ]
});
