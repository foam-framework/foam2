/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// TODO:
//   [ ] Make sure all tables are the same width. Only way to do this is to have
//       one table and add rows, not have many tables.
//   [ ] Fix overlays.
//   [ ] Handle when a user scrolls more than an entire page in one event.
//   [ ] Make sure fitInScreen isn't broken.
//   [ ] Fix jump in scrollbar when tables are added/removed.
//   [ ] Make sure filtering didn't break.
//   [ ] Make sure sorting didn't break.
//   [ ] Make the table header sticky.
//   [ ] Fix bug where table header is gone if you scroll back up after it was
//       removed when previously scrolling down far enough for it to be removed.

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
      display: grid;
      grid-template-columns: auto auto;
    }

    /*
    ^table {
      border-bottom: 3px solid red !important;
    }
    */
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
        return rowHeight * daoCount /* + this.TABLE_HEAD_HEIGHT */ + 'px';
      }
    },
    {
      type: 'Int',
      name: 'lastScrollTop_',
      value: 0
    },
    {
      type: 'Int',
      name: 'pageSize',
      value: 40,
      documentation: 'The number of items in each "page". There are three pages.'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'page1DAO',
      expression: function(data, pageSize) {
        return data && data.limit(pageSize);
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'page2DAO',
      expression: function(data, pageSize) {
        return data && data.skip(pageSize).limit(pageSize);
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'page3DAO',
      expression: function(data, pageSize) {
        return data && data.skip(pageSize * 2).limit(pageSize);
      }
    },
    {
      type: 'Int',
      name: 'currentLowerBound',
      value: 0
    },
    {
      type: 'Int',
      name: 'currentUpperBound',
      expression: function(pageSize) {
        return pageSize * 3;
      }
    },
    {
      name: 'spacer_',
      documentation: `
        A named reference to an element so we can update its height
        periodically. Used to put empty space between the top of the container
        and the tables so we create the illusion of the table always being
        visible.
      `
    },
    'topBufferTable_',
    'visibleTable_',
    'bottomBufferTable_',
    'tablesContainer_',
    {
      type: 'Int',
      name: 'tablesRemoved_',
      value: 0,
      documentation: `
        The number of tables that have been removed due to scrolling down.
      `
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
          start().
            show(this.daoCount$.map((count) => count >= this.limit)).
            addClass(this.myClass('scrollbar')).
            style({ height: this.scrollHeight$ }).
          end().
          start('div', undefined, this.tablesContainer_$).
            tag('div', undefined, this.spacer_$).
            start(this.TableView, {
              data$: this.page1DAO$,
              columns: this.columns,
              contextMenuActions: this.contextMenuActions,
              selection$: this.selection$,
              editColumnsEnabled: this.editColumnsEnabled
            }, this.topBufferTable_$).
              addClass(this.myClass('table')).
            end().
            start(this.TableView, {
              data$: this.page2DAO$,
              columns: this.columns,
              contextMenuActions: this.contextMenuActions,
              selection$: this.selection$,
              editColumnsEnabled: this.editColumnsEnabled,
              showHeader: false
            }, this.visibleTable_$).
              addClass(this.myClass('table')).
            end().
            start(this.TableView, {
              data$: this.page3DAO$,
              columns: this.columns,
              contextMenuActions: this.contextMenuActions,
              selection$: this.selection$,
              editColumnsEnabled: this.editColumnsEnabled,
              showHeader: false
            }, this.bottomBufferTable_$).
              addClass(this.myClass('table')).
            end().
          end().
        end();

      if ( this.fitInScreen ) {
        // this.onDetach(this.onload.sub(this.updateTableHeight));
        // window.addEventListener('resize', this.updateTableHeight);
        // this.onDetach(() => {
        //   window.removeEventListener('resize', this.updateTableHeight);
        // });

        this.onload.sub(() => {
          // Find the distance from the top of the table to the top of the screen.
          var distanceFromTop = this.topBufferTable_.el().getBoundingClientRect().y;

          // Calculate the remaining space we have to make use of.
          var remainingSpace = window.innerHeight - distanceFromTop;

          this.scrollbarContainer_.style({ height: `${remainingSpace}px` });
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
        this.skip = Math.min(this.daoCount - this.limit, Math.max(0, this.skip + (negative ? -rows : rows)));
        this.lastScrollTop_ = e.target.scrollTop;

        console.log('Lower bound: ' + (this.currentLowerBound + this.pageSize));
        console.log('Upper bound: ' + (this.currentUpperBound - this.pageSize - Math.floor(this.limit / 2)));
        console.log(`${oldSkip} -> ${this.skip}`);

        // Check if we scrolled over a page boundary. If we did, remove one of
        // the tables, add another, and update the dummy element's height to
        // make sure the tables are pushed down far enough.
        if (
          oldSkip   <= this.currentUpperBound - this.pageSize - Math.floor(this.limit / 2) &&
          this.skip >  this.currentUpperBound - this.pageSize - Math.floor(this.limit / 2)
        ) {
          // The user scrolled down past a page boundary.

          // Update the bounds.
          if ( this.currentUpperBound > this.daoCount ) return;

          this.currentUpperBound += this.pageSize;
          this.currentLowerBound += this.pageSize;

          // Remove the top buffer table.
          this.topBufferTable_.remove();
          this.tablesRemoved_ += 1;

          // Update the table references.
          this.topBufferTable_ = this.visibleTable_;
          this.visibleTable_   = this.bottomBufferTable_;

          // Update the spacer element height.
          this.spacer_.style({ height: `${this.tablesRemoved_ * this.pageSize * this.rowHeight}px` });

          // Add a new bottom buffer table.
          this.tablesContainer_.start(this.TableView, {
            data$: this.data$.map((dao) => dao.skip(this.currentUpperBound - this.pageSize).limit(this.pageSize)),
            columns: this.columns,
            contextMenuActions: this.contextMenuActions,
            selection$: this.selection$,
            editColumnsEnabled: this.editColumnsEnabled,
            showHeader: false
          }, this.bottomBufferTable_$).
            addClass(this.myClass('table')).
          end();
        } else if (
          oldSkip   >  this.currentLowerBound + this.pageSize &&
          this.skip <= this.currentLowerBound + this.pageSize
        ) {
          // The user scrolled up past a page boundary.

          // Update the bounds.
          if ( this.currentLowerBound <= 0 ) return;

          this.currentLowerBound -= this.pageSize;
          this.currentUpperBound -= this.pageSize;

          // Remove the bottom buffer table.
          this.bottomBufferTable_.remove();
          this.tablesRemoved_ -= 1;

          // Update the table references.
          this.bottomBufferTable_ = this.visibleTable_;
          this.visibleTable_      = this.topBufferTable_;

          // Update the spacer element height.
          this.spacer_.style({ height: `${this.tablesRemoved_ * this.pageSize * this.rowHeight}px` });

          // Add a new top buffer table.
          var table = this.E().start(this.TableView, {
            data$: this.data$.map((dao) => dao.skip(this.currentLowerBound).limit(this.pageSize)),
            columns: this.columns,
            contextMenuActions: this.contextMenuActions,
            selection$: this.selection$,
            editColumnsEnabled: this.editColumnsEnabled,
            showHeader: this.currentLowerBound === 0
          }, this.topBufferTable_$).
            addClass(this.myClass('table')).
          end();

          this.tablesContainer_.insertAfter(table, this.spacer_);
        }
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
    // {
    //   name: 'updateTableHeight',
    //   code: function() {
    //     // Find the distance from the top of the table to the top of the screen.
    //     var distanceFromTop = this.table_.el().getBoundingClientRect().y;

    //     // Calculate the remaining space we have to make use of.
    //     var remainingSpace = window.innerHeight - distanceFromTop;

    //     // Set the limit such that we make maximum use of the space without
    //     // overflowing.
    //     this.limit = Math.max(1, Math.floor((remainingSpace - this.TABLE_HEAD_HEIGHT) / this.rowHeight));

    //     this.updateScrollbarContainerHeight();
    //   }
    // },
    {
      name: 'updateScrollbarContainerHeight',
      code: function() {
        this.scrollbarContainer_.el().style.height = (this.limit * this.rowHeight) + this.TABLE_HEAD_HEIGHT + 'px';
      }
    }
  ]
});
