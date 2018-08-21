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
    'dblclick'
  ],

  // TODO: wrong class name, fix when ActionView fixed.
  css: `
    ^ {
      width: fit-content;
      max-width: 100vw;
      margin: auto;
    }

    .middle-row {
      display: flex;
    }

    .middle-row > *:not(:empty) {
      margin-left: 10px;
    }

    .middle-row > *:last-child {
      margin-right: 10px;
    }

    .middle-row .actions {
      display: inline-block;
    }

    .middle-row .net-nanopay-ui-ActionView {
      background: #59aadd;
      color: white;
      margin: 0 10px 10px 0;
    }
  `,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.comics.DAOController',
      name: 'data',
      expression: function(importedData) { return importedData; }
    },
    {
      name: 'cls',
      expression: function(data) { return data.cls_; }
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
    },
    {
      class: 'String',
      name: 'title',
      expression: function(data$data$of) {
        return 'Browse ' + data$data$of.name;
      }
    }
  ],

  reactions: [
    [ 'data', 'action.create', 'onCreate' ],
    [ 'data', 'edit', 'onEdit' ],
    [ 'data', 'action.findRelatedObject', 'onFindRelated' ],
    [ 'data', 'finished', 'onFinished' ],
    [ 'data', 'export', 'onExport' ]
  ],

  methods: [
    function initE() {
      var self = this;

      this.
        addClass(this.myClass()).
        tag(this.data.topBorder$).
        start().
          addClass('middle-row').
          tag(this.data.leftBorder).
          start().
            hide(self.data.searchHidden$).
            show(self.data.filtersEnabled$).
            add(self.cls.PREDICATE).
          end().
          start().
            style({ 'overflow-x': 'auto' }).
            start().
              addClass('actions').
              show(self.mode$.map((m) => m === foam.u2.DisplayMode.RW)).
                start().add(self.cls.getAxiomsByClass(foam.core.Action)).end().
            end().
            start().
              style({ 'overflow-x': 'auto' }).
              tag(this.summaryView, { data$: this.data.filteredDAO$ }).
            end().
          end().
          tag(this.data.rightBorder$).
        end().
        tag(this.data.bottomBorder$);
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