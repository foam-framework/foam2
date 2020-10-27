/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.view',
  name: 'ScrollTableView',
  extends: 'foam.u2.Element',

  imports: [
    'stack'
  ],

  exports: [
    'as summaryView',
    'dblclick'
  ],

  requires: [
    'foam.dao.FnSink',
    'foam.mlang.sink.Count',
    'foam.u2.view.TableView',
    'foam.comics.v2.DAOControllerConfig'
  ],

  css: `
    ^ {
      overflow: scroll;
      padding-bottom: 20px;
    }
    ^table {
      position: relative;
    }
    ^table  .foam-u2-view-TableView-thead {
      z-index: 1;
      overflow: visible;
    }
  `,

  constants: [
    {
      type: 'Float',
      name: 'MIN_TOP_PAGE_PROGRESS',
      documentation: `
        If the "top" page isn't scrolled by at least this amount, make
        the top page the previous page.
        i.e. If the page that's currently in view is only scrolled 10% of the way,
        we consider the page that's above it to be the "top" page. If the page
        that's on screen is scrolled 51% of the way, then it is considered the top
        page.
      `,
      value: 0.5
    },
    {
      type: 'Integer',
      name: 'NUM_PAGES_TO_RENDER',
      value: 3
    },
    {
      type: 'Integer',
      name: 'TABLE_HEAD_HEIGHT',
      value: 51
    }
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
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
    'disableUserSelection',
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
      value: 49
    },
    {
      name: 'table_',
      documentation: `
        A reference to the table element we use in various calculations.
      `
    },
    {
      type: 'Int',
      name: 'scrollHeight',
      expression: function(daoCount, rowHeight) {
        return rowHeight * daoCount + this.TABLE_HEAD_HEIGHT;
      }
    },
    {
      type: 'Int',
      name: 'pageSize',
      value: 30,
      documentation: 'The number of items in each "page". There are three pages.'
    },
    {
      type: 'Boolean',
      name: 'enableDynamicTableHeight',
      value: true,
    },
    {
      class: 'Boolean',
      name: 'multiSelectEnabled',
      documentation: 'Pass through to UnstyledTableView.'
    },
    {
      class: 'Map',
      name: 'selectedObjects',
      documentation: `
        The objects selected by the user when multi-select support is enabled.
        It's a map where the key is the object id and the value is the object.
        Here we simply bind it to the selectedObjects property on TableView.
      `
    },
    {
      class: 'Int',
      name: 'scrollPos_'
    },
    {
      class: 'Int',
      name: 'numPages_',
      expression: function(daoCount, pageSize) {
        return Math.ceil(daoCount / pageSize);
      }
    },
    {
      class: 'Int',
      name: 'currentTopPage_',
      expression: function(numPages_, scrollPos_, scrollHeight) {
        var scrollPercent = scrollPos_ / scrollHeight;
        var topPage = Math.floor(scrollPercent * numPages_);
        var topPageProgress = (scrollPercent * numPages_) % 1;
        if ( topPageProgress < this.MIN_TOP_PAGE_PROGRESS ) topPage = topPage - 1;
        return Math.min(Math.max(0, numPages_ - this.NUM_PAGES_TO_RENDER), Math.max(0, topPage));
      }
    },
    {
      class: 'Map',
      name: 'renderedPages_'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.DAOControllerConfig',
      name: 'config',
      factory: function() {
        return this.DAOControllerConfig.create({ dao: this.data });
      }
    },
    {
      name: 'dblClickListenerAction',
      factory: () => {
        return function(obj, id) {
          if ( ! this.stack ) return;
          this.stack.push({
            class: 'foam.comics.v2.DAOSummaryView',
            data: obj,
            config: this.config,
            id: id
          }, this);
        }
      }
    }
  ],

  reactions: [
    ['', 'propertyChange.currentTopPage_', 'updateRenderedPages_'],
    ['', 'propertyChange.table_',          'updateRenderedPages_']
  ],

  methods: [
    function init() {
      this.onDetach(this.data$proxy.listen(this.FnSink.create({ fn: this.updateCount })));
      this.updateCount();
    },

    function initE() {
      this.
        addClass(this.myClass()).
        on('scroll', this.onScroll).
        start(this.TableView, {
          data: foam.dao.NullDAO.create({of: this.data.of}),
          columns: this.columns,
          contextMenuActions: this.contextMenuActions,
          selection$: this.selection$,
          editColumnsEnabled: this.editColumnsEnabled,
          disableUserSelection: this.disableUserSelection,
          multiSelectEnabled: this.multiSelectEnabled,
          selectedObjects$: this.selectedObjects$
        }, this.table_$).
          addClass(this.myClass('table')).
          style({
            height: this.scrollHeight$.map(h => h + 'px')
          }).
        end();

      /*
        to be used in cases where we don't want the whole table to
        take the whole page (i.e. we need multiple tables)
        and enableDynamicTableHeight can be switched off
      */
      if ( this.enableDynamicTableHeight ) {
        this.onDetach(this.onload.sub(this.updateTableHeight));
        window.addEventListener('resize', this.updateTableHeight);
        this.onDetach(() => {
          window.removeEventListener('resize', this.updateTableHeight);
        });
      }
    }
  ],

  listeners: [
    {
      name: 'refresh',
      isFramed: true,
      code: function() {
        Object.keys(this.renderedPages_).forEach(i => {
          this.renderedPages_[i].remove();
          delete this.renderedPages_[i];
        });
        this.updateRenderedPages_();
        if ( this.el() ) this.el().scrollTop = 0;
      }
    },
    {
      name: 'updateCount',
      isFramed: true,
      code: function() {
        return this.data$proxy.select(this.Count.create()).then((s) => {
          this.daoCount = s.value;
          this.refresh();
        });
      }
    },
    {
      name: 'updateRenderedPages_',
      isFramed: true,
      code: function() {
        if ( ! this.table_ ) return;

        // Remove any pages that are no longer on screen to save on
        // the amount of DOM we add to the page.
        Object.keys(this.renderedPages_).forEach(i => {
          if ( i >= this.currentTopPage_ && i < this.currentTopPage_ + this.NUM_PAGES_TO_RENDER ) return;
          this.renderedPages_[i].remove();
          delete this.renderedPages_[i];
        });

        // Add any pages that are not already rendered.
        for ( var i = 0; i < Math.min(this.numPages_, this.NUM_PAGES_TO_RENDER) ; i++) {
          var page = this.currentTopPage_ + i;
          if ( this.renderedPages_[page] ) continue;
          var dao = this.data$proxy.limit(this.pageSize).skip(page * this.pageSize);
          var tbody = this.table_.slotE_(this.table_.rowsFrom(dao));
          tbody.style({
            position: 'absolute',
            width: '100%',
            top: this.TABLE_HEAD_HEIGHT + page * this.pageSize * this.rowHeight + 'px'
          });
          this.table_.add(tbody);
          this.renderedPages_[page] = tbody;
        }
      }
    },
    {
      name: 'onScroll',
      isFramed: true,
      code: function(e) {
        this.scrollPos_ = e.target.scrollTop;
      }
    },
    {
      name: 'updateTableHeight',
      code: function() {
        // Find the distance from the top of the table to the top of the screen.
        var distanceFromTop = this.el().getBoundingClientRect().y;

        // Calculate the remaining space we have to make use of.
        var remainingSpace = window.innerHeight - distanceFromTop;

        // TODO: Do we want to do this?
        // Leave space for the footer.
        remainingSpace -= 44;

        this.style({ height: `${remainingSpace}px` });
      }
    },
    function dblclick(obj, id) {
      this.dblClickListenerAction(obj, id);
    }
  ]
});
