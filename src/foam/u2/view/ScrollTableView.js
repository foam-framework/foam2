/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.view',
  name: 'ScrollTableView',
  extends: 'foam.u2.Element',

  requires: [
    'foam.dao.FnSink',
    'foam.graphics.ScrollCView',
    'foam.mlang.sink.Count',
    'foam.u2.view.TableView'
  ],

  constants: [
    {
      type: 'Integer',
      name: 'TABLE_HEAD_HEIGHT',
      value: 40
    }
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
    },
    {
      class: 'Int',
      name: 'limit',
      value: 18,
      // TODO make this a funciton of the height.
    },
    {
      class: 'Int',
      name: 'skip',
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'scrolledDAO',
      expression: function(data, limit, skip) {
        return data && data.limit(limit).skip(skip);
      },
    },
    'columns',
    {
      class: 'FObjectArray',
      of: 'foam.core.Action',
      name: 'contextMenuActions'
    },
    {
      class: 'Int',
      name: 'daoCount'
    },
    'selection',
    {
      class: 'Boolean',
      name: 'editColumnsEnabled',
      documentation: `
        Set to true if users should be allowed to choose which columns to use.
      `,
      value: true
    },
    {
      class: 'Int',
      name: 'rowHeight',
      documentation: 'The height of one row of the table in px.',
      value: 40
    },
    {
      class: 'Boolean',
      name: 'fitInScreen',
      documentation: `
        If true, the table height will be dynamically set such that the table
        will not overflow off of the bottom of the page.
      `,
      value: false
    },
    {
      name: 'table_',
      documentation: `
        A reference to the table element we use in the fitInScreen calculations.
      `
    }
  ],

  methods: [
    function init() {
      this.onDetach(this.data$proxy.listen(this.FnSink.create({fn:this.onDAOUpdate})));
      this.onDAOUpdate();
    },

    function initE() {
      // TODO probably shouldn't be using a table.
      this.start('table').
        on('wheel', this.onWheel).
        start('tr').
          start('td').
            style({ 'vertical-align': 'top' }).
            start(this.TableView, {
              data$: this.scrolledDAO$,
              columns: this.columns,
              contextMenuActions: this.contextMenuActions,
              selection$: this.selection$,
              editColumnsEnabled: this.editColumnsEnabled
            }, this.table_$).
            end().
          end().
          start('td').style({ 'vertical-align': 'top' }).
            add(this.slot(function(limit) {
              return this.ScrollCView.create({
                value$: this.skip$,
                extent$: this.limit$,
                height: this.rowHeight * limit + this.TABLE_HEAD_HEIGHT,
                width: 18,
                size$: this.daoCount$,
              });
            })).
          end().
        end().
      end();

      if ( this.fitInScreen ) this.onload.sub(this.updateTableHeight);
    }
  ],

  listeners: [
    {
      name: 'onWheel',
      code: function(e) {
        var negative = e.deltaY < 0;
        // Convert to rows, rounding up. (Therefore minumum 1.)
        var rows = Math.ceil(Math.abs(e.deltaY) / 40);
        this.skip = Math.max(0, this.skip + (negative ? -rows : rows));
        if ( e.deltaY !== 0 ) e.preventDefault();
      }
    },
    {
      // TODO: Avoid onDAOUpdate approaches.
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        var self = this;
        this.data$proxy.select(this.Count.create()).then(function(s) {
          self.daoCount = s.value;
        })
      }
    },
    {
      name: 'updateTableHeight',
      code: function() {
        // Find the distance from the top of the table to the top of the screen.
        var distanceFromTop = this.table_.el().getBoundingClientRect().y;

        // Calculate the remaining space we have to make use of.
        var remainingSpace = window.innerHeight - distanceFromTop;

        // Set the limit such that we make maximum use of the space without
        // overflowing.
        this.limit = Math.max(1, Math.floor((remainingSpace - this.TABLE_HEAD_HEIGHT) / this.rowHeight));
      }
    }
  ]
});
