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
    'foam.mlang.sink.Count',
    'foam.u2.view.TableView'
  ],

  css: `
    ^ {
      position: relative;
    }

    ^scrollbar {
      box-sizing: border-box;
    }

    ^scrollbarContainer {
      overflow: scroll;
    }

    ^table {
      /* The following line is required for Safari. */
      position: -webkit-sticky;
      position: sticky;
      top: 0;
    }
  `,

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
      value: 48
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
    },
    {
      class: 'Int',
      name: 'accumulator',
      documentation: 'Used internally to mimic native scrolling speed.',
      adapt: function(_, v) {
        return v % this.rowHeight;
      }
    },
    {
      name: 'scrollbarContainer_',
      documentation: `
        A reference to the scrollbar's container element so we can update the
        height after the view has loaded.
      `
    },
    {
      type: 'String',
      name: 'scrollHeight',
      expression: function(daoCount, limit, rowHeight) {
        this.lastScrollTop_ = 0;
        this.skip = 0;
        return rowHeight * daoCount + this.TABLE_HEAD_HEIGHT + 'px';
      }
    },
    {
      type: 'Int',
      name: 'lastScrollTop_',
      value: 0
    }
  ],

  methods: [
    function init() {
      this.onDetach(this.data$proxy.listen(this.FnSink.create({ fn: this.onDAOUpdate })));
      this.onDAOUpdate();
    },

    function initE() {
      this.
        addClass(this.myClass()).
        start('div', undefined, this.scrollbarContainer_$).
          addClass(this.myClass('scrollbarContainer')).
          on('scroll', this.onScroll).
          start(this.TableView, {
            data$: this.scrolledDAO$,
            columns: this.columns,
            contextMenuActions: this.contextMenuActions,
            selection$: this.selection$,
            editColumnsEnabled: this.editColumnsEnabled
          }, this.table_$).
            addClass(this.myClass('table')).
          end().
          start().
            show(this.daoCount$.map((count) => count >= this.limit)).
            addClass(this.myClass('scrollbar')).
            style({ height: this.scrollHeight$ }).
          end().
        end();

      if ( this.fitInScreen ) {
        this.onDetach(this.onload.sub(this.updateTableHeight));
        window.addEventListener('resize', this.updateTableHeight);
        this.onDetach(() => {
          window.removeEventListener('resize', this.updateTableHeight);
        });
      }

      this.onDetach(this.onload.sub(this.updateScrollbarContainerHeight));
    }
  ],

  listeners: [
    {
      name: 'onScroll',
      code: function(e) {
        var deltaY = e.target.scrollTop - this.lastScrollTop_;
        var negative = deltaY < 0;
        var rows = Math.floor(Math.abs(this.accumulator + deltaY) / this.rowHeight);
        this.accumulator += deltaY;
        var oldSkip = this.skip;
        this.skip = Math.max(0, this.skip + (negative ? -rows : rows));
        if ( this.skip > this.daoCount - this.limit ) this.skip = oldSkip;
        this.lastScrollTop_ = e.target.scrollTop;
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
        });
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

        this.updateScrollbarContainerHeight();
      }
    },
    {
      name: 'updateScrollbarContainerHeight',
      code: function() {
        this.scrollbarContainer_.el().style.height = (this.limit * this.rowHeight) + this.TABLE_HEAD_HEIGHT + 'px';
      }
    }
  ]
});
