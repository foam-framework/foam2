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
    'foam.comics.DAOController',
    'foam.comics.DAOUpdateControllerView',
    'foam.u2.view.ScrollTableView',
    'foam.u2.dialog.Popup'
  ],

  imports: [
    'data? as importedData',
    'stack',
    'summaryView? as importedSummaryView',
    'updateView? as importedUpdateView',
    'window'
  ],

  exports: [
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
    }

    ^ .actions .net-nanopay-ui-ActionView {
      margin: 0 10px 10px 0;
    }

    ^ .net-nanopay-ui-ActionView {
      background: #59aadd;
      color: white;
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
      name: 'summaryView',
      factory: function() {
        return this.importedSummaryView$ ?
            this.importedSummaryView :
            { class: 'foam.u2.view.ScrollTableView' };
      }
    },
    {
      name: 'updateView',
      expression: function() {
        return this.importedUpdateView ?
            this.importedUpdateView :
            { class: 'foam.comics.DAOUpdateControllerView' };
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
            .start()
              .add(self.cls.CREATE) // TODO: Primary action
            .end()
          .end()
          .start()
            .addClass(this.myClass('container'))
            .start()
              .hide(self.data.searchHidden$)
              .show(self.data.filtersEnabled$)
              .add(self.cls.PREDICATE)
            .end()
            .start()
              .style({ 'overflow-x': 'auto' })
              .start()
                .addClass('actions')
                .show(self.mode$.map((m) => m === foam.u2.DisplayMode.RW))
                .start()
                  .add(self.cls.getAxiomsByClass(foam.core.Action))
                .end()
              .end()
              .start()
                .style({ 'overflow-x': 'auto' })
                .tag(this.summaryView, { data$: this.data.filteredDAO$ })
              .end()
            .end()
          .end());

      this.add(this.data.border);
    },

    function dblclick(obj) {
      this.onEdit(null, null, obj.id);
    }
  ],

  listeners: [
    function onCreate() {
      this.stack.push({
        class: 'foam.comics.DAOCreateControllerView'
      }, this);
    },

    function onEdit(s, edit, id) {
      this.stack.push({
        class: this.updateView.class,
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
