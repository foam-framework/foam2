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
      width: 1px;
      background: rgba(0, 0, 0, 0);
    }

    ^scrollbarContainer {
      overflow: scroll;
      display: grid;
      grid-template-columns: 1px 1fr;
    }

    ^ th {
      position: -webkit-sticky;
      position: sticky;
      top: 0;
    }

    ^ table {
      table-layout: fixed;
      width: 1024px;
    }

    ^ td,
    ^ th {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
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
      expression: function(daoCount, rowHeight) {
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
    },
    {
      type: 'Boolean',
      name: 'enableDynamicTableHeight',
      value: true,
    }
  ],

  methods: [
    function init() {
      this.onDetach(this.data$proxy.listen(this.FnSink.create({ fn: this.onDAOUpdate })));
      this.updateCount();
    },

    function initE() {
      this.
        addClass(this.myClass()).
        start('div', undefined, this.scrollbarContainer_$).
          addClass(this.myClass('scrollbarContainer')).
          on('scroll', this.onScroll).
          start().
            addClass(this.myClass('scrollbar')).
            style({ height: this.scrollHeight$ }).
          end().
          start().
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

      /*
        to be used in cases where we don't want the whole table to
        take the whole page (i.e. we need multiple tables)
        and enableDynamicTableHeight can be switched off
      */
      if (this.enableDynamicTableHeight) {
        this.onDetach(this.onload.sub(this.updateTableHeight));
        window.addEventListener('resize', this.updateTableHeight);
        this.onDetach(() => {
          window.removeEventListener('resize', this.updateTableHeight);
        });
      }
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
        this.table_.childNodes
          .filter((x) => x.nodeName === 'TBODY')
          .forEach((x) => x.remove());
        this.table_.add(this.table_.rowsFrom(this.page1DAO_$proxy));
        this.addTbodies();
        if ( this.scrollbarContainer_ && this.scrollbarContainer_.el() ) {
          this.scrollbarContainer_.el().scrollTop = 0;
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

        // Update the table references.
        this.topBufferTable_ = this.visibleTable_;
        this.visibleTable_   = this.bottomBufferTable_;

        // Add a new bottom buffer table.
        var daoName = ['page1DAO_', 'page2DAO_', 'page3DAO_'][this.tablesRemoved_ % 3];
        this.tablesRemoved_ += 1;
        this[daoName] = this.data.skip(this.currentUpperBound - this.pageSize).limit(this.pageSize);
        var rows = this.table_.rowsFrom(this[daoName + '$proxy']);
        this.table_.add(rows);
        var x = this.table_.childNodes.filter((x) => x.nodeName === 'TBODY');
        this.bottomBufferTable_ = x[x.length - 1];
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
        var x = this.table_.childNodes.filter((x) => x.nodeName === 'TBODY');
        this.topBufferTable_ = x[0];
      }
    },
    {
      name: 'updateCount',
      code: function() {
        return this.data$proxy.select(this.Count.create()).then((s) => {
          this.daoCount = s.value;
        });
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
        this.updateCount().then(() => this.refresh());
      }
    },
    {
      name: 'updateTableHeight',
      code: function() {
        // Find the distance from the top of the table to the top of the screen.
        var distanceFromTop = this.scrollbarContainer_.el().getBoundingClientRect().y;

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
