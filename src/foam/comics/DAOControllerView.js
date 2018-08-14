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
    'foam.u2.view.ScrollTableView'
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
    ^ .net-nanopay-ui-ActionView {
      background: #59aadd;
      color: white;
      margin-right: 4px;
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
        start('table').
          start('tr').
            start('td').style({display: 'block', padding: '8px'}).add(this.cls.PREDICATE).end().
            start('td').style({'vertical-align': 'top', 'width': '100%'}).
              start('span').
                style({background: 'rgba(0,0,0,0)'}).
                show(self.mode$.map(function(m) { return m == foam.u2.DisplayMode.RW; })).
                  start().
                    style({padding: '4px 4px 4px 1px'}).
                    add(self.cls.getAxiomsByClass(foam.core.Action)).
                  end().
                end().
              tag(this.summaryView, {data$: this.data.filteredDAO$}).
            end().
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
  ]
});
