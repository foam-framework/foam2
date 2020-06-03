/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.comics.v2',
  name: 'DAOBrowserView',
  extends: 'foam.u2.View',
  requires: [
    'foam.comics.SearchMode',
    'foam.comics.v2.DAOControllerConfig',
    'foam.u2.ActionView',
    'foam.u2.dialog.Popup',
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows',
    'foam.u2.filter.FilterView',
    'foam.u2.view.ScrollTableView',
    'foam.u2.view.SimpleSearch',
    'foam.u2.view.TabChoiceView',
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  documentation: `
    A scrolling table view customized for the inline DAOController
    with canned queries and a searchbar
  `,

  css: `
    ^export {
      margin-left: 16px;
    }

    ^export img {
      margin-right: 0;
    }

    .foam-u2-ActionView-refreshTable > img {
      margin-right: 0;
    }

    ^top-bar {
      border-bottom: solid 1px #e7eaec;
      align-items: center;
      padding-top: 16px;
    }

    ^query-bar {
      padding: 40px 16px;
      align-items: center;
      justify-content: flex-end;
    }

    ^toolbar {
      flex-grow: 1;
    }

    ^browse-view-container {
      margin: auto;
      border-bottom: solid 1px #e7eaec;
      margin: 0px 0px 72px 0px;
      box-sizing: border-box;
      padding: 0 16px;
    }

    ^canned-queries {
      padding: 0 16px;
    }

    ^ .foam-u2-view-TableView th {
      background: #ffffff
    }

    ^ .foam-u2-view-TableView td {
      padding-left: 16px;
    }

    ^ .foam-u2-view-SimpleSearch {
      flex-grow: 1;
    }

    ^ .foam-u2-view-SimpleSearch .foam-u2-search-TextSearchView .foam-u2-tag-Input {
      width: 100%;
    }
  `,

  messages: [
    { name: 'REFRESH_MSG', message: 'Refresh Requested ... ' }
  ],

  imports: [
    'stack?'
  ],

  exports: [
    'dblclick',
    'filteredTableColumns'
  ],

  properties: [
    {
      class: 'StringArray',
      name: 'filteredTableColumns'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
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
      class: 'foam.u2.ViewSpec',
      name: 'summaryView',
      expression: function(config$summaryView) {
        return config$summaryView;
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'cannedQueriesView',
      factory: function() {
        return {
          class: 'foam.u2.view.TabChoiceView'
        };
      }
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'cannedPredicate',
      expression: function(config$cannedQueries) {
        return config$cannedQueries && config$cannedQueries.length
          ? config$cannedQueries[0].predicate
          : foam.mlang.predicate.True.create();
      }
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'searchPredicate',
      expression: function() {
        return foam.mlang.predicate.True.create();
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'predicatedDAO',
      expression: function(config, cannedPredicate, searchPredicate) {
        return config.dao$proxy.where(this.AND(cannedPredicate, searchPredicate));
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'searchFilterDAO',
      expression: function(config, cannedPredicate) {
        return config.dao$proxy.where(cannedPredicate);
      }
    }
  ],
  actions: [
    {
      name: 'export',
      label: '',
      toolTip: 'Export Table Data',
      icon: 'images/export-arrow-icon.svg',
      code: function() {
        this.add(this.Popup.create().tag({
          class: 'foam.u2.ExportModal',
          exportData: this.predicatedDAO$proxy,
          predicate: this.config.filterExportPredicate
        }));
      }
    },
    {
      name: 'refreshTable',
      label: '',
      toolTip: 'Refresh Table',
      icon: 'images/refresh-icon-black.svg',
      code: function(X) {
        this.config.dao.cmd_(X, foam.dao.CachingDAO.PURGE);
        this.config.dao.cmd_(X, foam.dao.AbstractDAO.RESET_CMD);
        this.add(foam.u2.dialog.NotificationMessage.create({
          message: this.REFRESH_MSG
        }));
      }
    }
  ],
  methods: [
    function init() {
      // Reset the search filters when a different canned query is selected
      this.onDetach(this.cannedPredicate$.sub(() => {
        this.searchPredicate = foam.mlang.predicate.True.create();
      }));
    },
    function dblclick(obj) {
      if ( ! this.stack ) return;
      this.stack.push({
        class: 'foam.comics.v2.DAOSummaryView',
        data: obj,
        config: this.config,
        of: this.config.of
      }, this.__subContext__);
    },
    function initE() {
      var self = this;
      this.addClass(this.myClass());
      this.SUPER();
      this
        .add(this.slot(function(config$cannedQueries, config$hideQueryBar, searchFilterDAO) {
          return self.E()
            .start(self.Rows)
              .callIf(config$cannedQueries.length >= 1, function() {
                this
                  .start(self.Cols)
                    .addClass(self.myClass('top-bar'))
                    .start(self.Cols)
                      .callIf(config$cannedQueries.length > 1, function() {
                        this
                          .start(self.cannedQueriesView, {
                            choices: config$cannedQueries.map((o) => [o.predicate, o.label]),
                            data$: self.cannedPredicate$
                          })
                            .addClass(self.myClass('canned-queries'))
                          .end();
                      })
                    .end()
                  .end();
              })
              .callIf( ! config$hideQueryBar, function() {
                this
                  .start(self.Cols).addClass(self.myClass('query-bar'))
                    .startContext({
                      dao: searchFilterDAO,
                      controllerMode: foam.u2.ControllerMode.EDIT
                    })
                      .callIf(self.config.searchMode === self.SearchMode.SIMPLE, function() {
                        this.tag(self.SimpleSearch, {
                          showCount: false,
                          data$: self.searchPredicate$
                        });
                      })
                      .callIf(self.config.searchMode === self.SearchMode.FULL, function() {
                        this.tag(self.FilterView, {
                          dao$: self.searchFilterDAO$,
                          data$: self.searchPredicate$
                        });
                      })
                    .endContext()
                    .startContext({ data: self })
                      .start(self.EXPORT, { buttonStyle: 'SECONDARY' })
                        .addClass(self.myClass('export'))
                      .end()
                      .start(self.REFRESH_TABLE, { buttonStyle: 'SECONDARY' })
                        .addClass(self.myClass('refresh'))
                      .end()
                    .endContext()
                  .end();
              })
              .start(self.summaryView,{
                data: self.predicatedDAO$proxy
              })
                .addClass(self.myClass('browse-view-container'))
              .end()
            .end();
        }));
    }
  ]
});
