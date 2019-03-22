/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// TODO:
//   [ ] Fix overlays.
//   [ ] Fix jump in scrollbar when tables are added/removed.
//         * `position: absolute` would solve this perfectly if it weren't for
//           the fact that the conainer wouldn't use the table to calculate its
//           width anymore so it breaks the layout.
//             * Note that using `table-layout: fixed` would solve this.
//         * Note that the jumping only happens when scrolling down, which is
//           surprising. I'm not sure why that's the case, I'd expect it happen
//           while scrolling either way.
//   [ ] Make the table header sticky.
//   [x] See if I can get it so that the DOM elements aren't removed and
//       re-added when filtering. It would be nicer to just change the
//       underlying DAO so you don't see the flicker.
//   [x] Make sure all column widths are consistent.
//   [x] Handle when a user scrolls more than an entire page in one event.
//   [x] Make sure table height isn't broken.
//   [x] Make sure filtering didn't break.
//   [x] Make sure sorting didn't break.
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
        A reference to the table element we use in various calculations.
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
        return rowHeight * daoCount + this.TABLE_HEAD_HEIGHT + 'px';
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
      class: 'foam.dao.DAOProperty',
      name: 'page1DAO_',
      factory: function() {
        return this.initialPage1DAO_;
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'page2DAO_',
      factory: function() {
        return this.initialPage2DAO_;
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'page3DAO_',
      factory: function() {
        return this.initialPage3DAO_;
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
              data: this.page1DAO_$proxy,
              columns: this.columns,
              contextMenuActions: this.contextMenuActions,
              selection$: this.selection$,
              editColumnsEnabled: this.editColumnsEnabled
            }, this.table_$).
              addClass(this.myClass('table')).
            end().
          end().
        end();

      this.onDetach(this.onload.sub(this.addTbodies));

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
        this.page1DAO_ = this.initialPage1DAO_;
        this.page2DAO_ = this.initialPage2DAO_;
        this.page3DAO_ = this.initialPage3DAO_;
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
        var daoName = ['page1DAO_', 'page2DAO_', 'page3DAO_'][this.tablesRemoved_ % 3];
        this[daoName] = this.data.skip(this.currentUpperBound - this.pageSize).limit(this.pageSize);
        var rows = this.table_.rowsFrom(this[daoName + '$proxy']);
        this.table_.add(rows);
        this.bottomBufferTable_ = this.table_.childNodes
          .filter((x) => x.nodeName === 'TBODY')
          .pop();
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
        var daoName = ['page1DAO_', 'page2DAO_', 'page3DAO_'][this.tablesRemoved_ % 3];
        this[daoName] = this.data.skip(this.currentLowerBound).limit(this.pageSize);
        var rows = this.table_.rowsFrom(this[daoName + '$proxy']);
        this.table_.insertBefore(this.table_.slotE_(rows), this.visibleTable_);
        this.topBufferTable_ = this.table_.childNodes
          .filter((x) => x.nodeName === 'TBODY')
          .shift();
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
          self.refresh();
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

        // TODO: Do we want to do this?
        // Leave space for the footer.
        remainingSpace -= 44;

        this.scrollbarContainer_.style({ height: `${remainingSpace}px` });
      }
    },
    {
      name: 'addTbodies',
      code: function() {
        this.table_.add(this.table_.rowsFrom(this.page2DAO_$proxy));
        this.table_.add(this.table_.rowsFrom(this.page3DAO_$proxy));
        var tbodies = this.table_.childNodes.filter((x) => x.nodeName === 'TBODY');
        this.topBufferTable_ = tbodies[0];
        this.visibleTable_ = tbodies[1];
        this.bottomBufferTable_ = tbodies[2];
      }
    }
  ]
});
