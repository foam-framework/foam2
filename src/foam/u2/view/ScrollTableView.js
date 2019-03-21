/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// TODO:
//   [ ] Make sure all column widths are consistent. Only way to do this is to
//       have one table and add rows, not have many tables.
//         * <table>'s can have multiple <tbody>'s, so that's one option. The
//           hard part about doing this is that we need each of the <tbody>'s
//           to have a different DAO/data source. We could try to support
//           multiple DAOs in a single table.
//         * We could also sidestep the issue by using `table-layout: fixed` so
//           the tables are indistinguishable from each other. This feels like
//           too much of a constraint though.
//   [ ] Fix overlays.
//   [x] Handle when a user scrolls more than an entire page in one event.
//   [x] Make sure table height isn't broken.
//   [ ] Fix jump in scrollbar when tables are added/removed.
//         * `position: absolute` would solve this perfectly if it weren't for
//           the fact that the conainer wouldn't use the table to calculate its
//           width anymore so it breaks the layout.
//             * Note that using `table-layout: fixed` would solve this too.
//         * Note that the jumping only happens when scrolling down, which is
//           surprising. I'm not sure why that's the case, I'd expect it happen
//           while scrolling either way.
//   [x] Make sure filtering didn't break.
//   [x] Make sure sorting didn't break.
//   [ ] Make the table header sticky.
//   [x] Fix bug where table header is gone if you scroll back up after it was
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
        this.refresh();
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
      value: 30,
      documentation: 'The number of items in each "page". There are three pages.'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'initialPage1DAO_',
      expression: function(data, pageSize) {
        return data && data.limit(pageSize);
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'initialPage2DAO_',
      expression: function(data, pageSize) {
        return data && data.skip(pageSize).limit(pageSize);
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'initialPage3DAO_',
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
    },
    {
      type: 'String',
      name: 'spacerHeight_',
      expression: function(tablesRemoved_, pageSize, rowHeight) {
        return tablesRemoved_ * pageSize * rowHeight + 'px';
      }
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
            start('div', undefined, this.spacer_$).
              style({ height: this.spacerHeight_$ }).
            end().
            start(this.TableView, {
              data$: this.initialPage1DAO_$,
              columns: this.columns,
              contextMenuActions: this.contextMenuActions,
              selection$: this.selection$,
              editColumnsEnabled: this.editColumnsEnabled
            }, this.topBufferTable_$).
              addClass(this.myClass('table')).
            end().
            start(this.TableView, {
              data$: this.initialPage2DAO_$,
              columns: this.columns,
              contextMenuActions: this.contextMenuActions,
              selection$: this.selection$,
              editColumnsEnabled: this.editColumnsEnabled,
              showHeader: false
            }, this.visibleTable_$).
              addClass(this.myClass('table')).
            end().
            start(this.TableView, {
              data$: this.initialPage3DAO_$,
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

      this.onDetach(this.onload.sub(this.updateTableHeight));
      window.addEventListener('resize', this.updateTableHeight);
      this.onDetach(() => {
        window.removeEventListener('resize', this.updateTableHeight);
      });
    },
    {
      name: 'refresh',
      code: function() {
        this.lastScrollTop_ = 0;
        this.skip = 0;
        this.currentLowerBound = 0;
        this.currentUpperBound = this.pageSize * 3;
        this.tablesRemoved_ = 0;

        if ( this.topBufferTable_ ) {
          this.topBufferTable_.data = this.initialPage1DAO_;
          this.topBufferTable_.showHeader = true;
        }

        if ( this.visibleTable_ ) {
          this.visibleTable_.data = this.initialPage2DAO_;
        }

        if ( this.bottomBufferTable_ ) {
          this.bottomBufferTable_.data = this.initialPage3DAO_;
        }
      }
    },
    {
      name: 'scrollDownOnePage',
      code: function() {
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

        // Add a new bottom buffer table.
        this.tablesContainer_.start(this.TableView, {
          data: this.data.skip(this.currentUpperBound - this.pageSize).limit(this.pageSize),
          columns: this.columns,
          contextMenuActions: this.contextMenuActions,
          selection$: this.selection$,
          editColumnsEnabled: this.editColumnsEnabled,
          showHeader: false
        }, this.bottomBufferTable_$).
          addClass(this.myClass('table')).
        end();
      }
    },
    {
      name: 'scrollUpOnePage',
      code: function() {
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

        // Add a new top buffer table.
        var table = this.TableView.create({
          data: this.data.skip(this.currentLowerBound).limit(this.pageSize),
          columns: this.columns,
          contextMenuActions: this.contextMenuActions,
          selection$: this.selection$,
          editColumnsEnabled: this.editColumnsEnabled,
          showHeader: this.currentLowerBound === 0 // To make sure the header is shown for the top table.
        });
        table.addClass(this.myClass('table'));
        this.topBufferTable_ = table;

        this.tablesContainer_.insertAfter(table, this.spacer_);
      }
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

        var uBound = () => this.currentUpperBound - this.pageSize;
        var lBound = () => this.currentLowerBound + this.pageSize;

        if ( oldSkip <= uBound() && this.skip > uBound() ) {
          // The user scrolled down past a page boundary.
          while (
            this.skip > uBound() &&
            this.currentUpperBound < this.daoCount
          ) {
            this.scrollDownOnePage();
          }
        } else if ( oldSkip > lBound() && this.skip <= lBound() ) {
          // The user scrolled up past a page boundary.
          while ( this.skip <= lBound() && this.currentLowerBound > 0 ) {
            this.scrollUpOnePage();
          }
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
    {
      name: 'updateTableHeight',
      code: function() {
        // Find the distance from the top of the table to the top of the screen.
        var distanceFromTop = this.bottomBufferTable_.el().getBoundingClientRect().y;

        // Calculate the remaining space we have to make use of.
        var remainingSpace = window.innerHeight - distanceFromTop;

        // TODO: Do we want to do this?
        // Leave space for the footer.
        remainingSpace -= 44;

        this.scrollbarContainer_.style({ height: `${remainingSpace}px` });
      }
    }
  ]
});
