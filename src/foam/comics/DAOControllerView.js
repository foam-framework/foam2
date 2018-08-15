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
    'foam.u2.view.ScrollTableView',
    'foam.u2.dialog.Popup',
    'foam.u2.dialog.ExportModal'
  ],

  imports: [
    'stack',
    'summaryView? as importedSummaryView',
    'data? as importedData',
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
      display: flex;
    }

    ^ > * {
      margin-left: 10px;
    }

    ^ > *:last-child {
      margin-right: 10px;
    }

    ^ .actions {
      display: inline-block;
      margin-bottom: 10px;
    }

    ^ .net-nanopay-ui-ActionView {
      background: #59aadd;
      color: white;
      margin-right: 10px;
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
    [ 'data', 'finished', 'onFinished' ]
  ],

  methods: [
    function initE() {
      var self = this;

      this.
        addClass(this.myClass()).
        start().add(this.cls.PREDICATE).end().
        start().
          style({ 'overflow-x': 'auto' }).
          start().
            addClass('actions').
            show(self.mode$.map((m) => m === foam.u2.DisplayMode.RW)).
              start().add(self.cls.getAxiomsByClass(foam.core.Action)).end().
          end().
          startContext({ data: this }).
            start(this.EXPORT_DATA).
            end().
          endContext().
          start().
            style({ 'overflow-x': 'auto' }).
            tag(this.summaryView, { data$: this.data.filteredDAO$ }).
          end().
        end();
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
        class: 'foam.comics.DAOUpdateControllerView',
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
    }
  ],

  actions: [
    {
      name: 'exportData',
      label: 'Export',
      code: function(X) {
        this.add(this.Popup.create().tag({
          class: 'foam.u2.ExportModal',
          exportData: this.data.data
        }));
      }
    }
  ]
});
