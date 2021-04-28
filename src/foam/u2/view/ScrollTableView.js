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
    'memento?',
    'stack'
  ],

  exports: [
    'as summaryView',
    'dblclick as click',
    'dblclick'
  ],

  requires: [
    'foam.dao.FnSink',
    'foam.mlang.sink.Count',
    'foam.u2.view.TableView',
    'foam.comics.v2.DAOControllerConfig',
    'foam.nanos.controller.Memento'
  ],

  css: `
    ^ {
      overflow: auto;
      padding-bottom: 20px;
      height: 100%;
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
      value: true
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
      factory: function() {
        return function(obj, id) {
          if ( ! this.stack ) return;

          this.stack.push({
            class: 'foam.comics.v2.DAOSummaryView',
            data: obj,
            config: this.config,
            idOfRecord: id
          }, this.__subContext__.createSubContext({ memento: this.table_.memento }));
        }
      }
    },
    'currentMemento_',
    {
      class: 'Boolean',
      name: 'isInit'
    },
    'tableWrapper_'
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
      if ( this.memento ) {
        //as there two settings to configure for table scroll and columns params
        //scroll setting which setts the record to which table currently scrolled
        var m = this.memento;
        for ( var i = 0 ; i < 2 ; i++ ) {
          if ( ! m ) {
            m = foam.nanos.controller.Memento.create({ value: '', parent: this.memento });
            this.memento.tail = m;
          } else {
            if ( ! m.tail )
              m.tail = foam.nanos.controller.Memento.create({ value: '', parent: m });
            m = m.tail;
          }
        }
        this.currentMemento_ = this.memento.tail;
      }



      this.table_ = foam.u2.ViewSpec.createView(this.TableView, {
        data: foam.dao.NullDAO.create({of: this.data.of}),
        columns: this.columns,
        contextMenuActions: this.contextMenuActions,
        selection$: this.selection$,
        editColumnsEnabled: this.editColumnsEnabled,
        disableUserSelection: this.disableUserSelection,
        multiSelectEnabled: this.multiSelectEnabled,
        selectedObjects$: this.selectedObjects$
      },  this, this.__subSubContext__.createSubContext({ memento: this.currentMemento_ ? this.currentMemento_.tail : this.currentMemento_ }));
      
      if ( ! this.table_.memento || ! this.table_.memento.tail || this.table_.memento.tail.head.length == 0 ) {
        this.
          start('div', {}, this.tableWrapper_$).
            addClass(this.myClass()).
            on('scroll', this.onScroll).
            start().
              add(this.table_).
              addClass(this.myClass('table')).
              style({
                height: this.scrollHeight$.map(h => h + 'px')
              }).
            end().
          end();
      } else if ( this.table_.memento.tail.head.length != 0 ) {
        if ( this.table_.memento.tail.head == 'create' ) {
          this.stack.push({
            class: 'foam.comics.v2.DAOCreateView',
            data: ((this.config.factory && this.config.factory$cls) ||  this.data.of).create({ mode: 'create'}, this),
            config$: this.config$,
            of: this.data.of
          }, this.__subContext__.createSubContext({ memento: this.table_.memento }));
        } else if ( this.table_.memento.tail.tail && this.table_.memento.tail.tail.head ) {
          var id = this.table_.memento.tail.tail.head;
          if ( ! foam.core.MultiPartID.isInstance(this.data.of.ID) ) {
            id = this.data.of.ID.fromString(id);
          } else {
            id = this.data.of.ID.of.create();
            mementoHead = '{' + this.table_.memento.tail.tail.head.replaceAll('=', ':') + '}';
            var idFromJSON = foam.json.parseString(mementoHead);
            for ( var key in idFromJSON ) {
              var axiom = this.data.of.getAxiomByName(key);

              if ( axiom )
                axiom.set(id, idFromJSON[key]);
            }
          }
          this.stack.push({
            class: 'foam.comics.v2.DAOSummaryView',
            data: null,
            config: this.config,
            idOfRecord: id
          }, this.__subContext__.createSubContext({ memento: this.table_.memento }));
        }
      }
      

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
        if ( this.el() && ! this.isInit && this.currentMemento_ && this.currentMemento_.head.length != 0 ) {
          var scroll = this.currentMemento_.head * this.rowHeight;
          scroll = scroll >= this.rowHeight && scroll < this.scrollHeight ? scroll : 0;

          if ( this.childNodes && this.childNodes.length > 0 )
            document.getElementById(this.tableWrapper_.id).scrollTop = scroll;

          this.isInit = true;
        } else if ( this.el() ) this.el().scrollTop = 0;
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
          var tbody = this.table_.slotE_(this.table_.rowsFrom(dao, this.TABLE_HEAD_HEIGHT + page * this.pageSize * this.rowHeight));
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
        if ( this.currentMemento_ ) {
          this.currentMemento_.head = this.scrollPos_ >= this.rowHeight && this.scrollPos_ < this.scrollHeight ? Math.floor( this.scrollPos_  / this.rowHeight) : 0;
        }
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
