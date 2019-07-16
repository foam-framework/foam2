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
    'foam.u2.ActionView',
    'foam.u2.dialog.Popup',
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows',
    'foam.u2.search.Toolbar',
    'foam.u2.view.ScrollTableView',
    'foam.u2.view.TabChoiceView',
    'foam.comics.v2.DAOControllerConfig'
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

    ^top-bar {
      border-bottom: solid 1px #e7eaec;
      align-items: center;
    }

    ^query-bar {
      padding: 24px 16px;
      align-items: center;
    }

    ^toolbar {
      flex-grow: 1;
    }

    ^browse-view-container {
      margin: auto;
      border-bottom: solid 1px #e7eaec;
      margin: 0px 0px 72px 0px;
      box-sizing: border-box;
    }

    ^canned-queries {
      padding: 0 16px;
    }

    /*
      TODO: Don't manually target these classes like this.
     */
    ^ .foam-u2-view-ScrollTableView-table {
      width: 100%;
    }

    ^ .foam-u2-view-ScrollTableView-scrollbarContainer {
      height: 424px;
    }

    ^ .foam-u2-view-TableView th {
      background: #ffffff
    }

    ^ .foam-u2-view-TableView td {
      padding-left: 16px;
    }
  `,

  imports: [
    'stack?'
  ],
  exports: [
    'dblclick'
  ],
  properties: [
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
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'predicate',
      expression: function(config$cannedQueries) {
        return config$cannedQueries && config$cannedQueries.length
          ? config$cannedQueries[0].predicate
          : foam.mlang.predicate.True.create();
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'predicatedDAO',
      expression: function(config, predicate) {
        return config.dao$proxy.where(predicate);
      }
    }
  ],
  actions: [
    {
      name: 'export',
      label: '',
      icon: 'images/export-arrow-icon.svg',
      code: function() {
        this.add(this.Popup.create().tag({
          class: 'foam.u2.ExportModal',
          exportData: this.predicatedDAO$proxy
        }));
      }
    }
  ],
  methods: [
    function dblclick(obj) {
      if ( ! this.stack ) return;
      this.stack.push({
        class: 'foam.comics.v2.DAOSummaryView',
        data: obj,
        config: this.config,
        of: this.config.of
      });
    },
    function initE() {
      var self = this;
      this.addClass(this.myClass());
      this.SUPER();
      this
        .add(self.slot(function(data, config$cannedQueries) {
          return self.E()
            .start(self.Rows)
              .callIf(config$cannedQueries.length >= 1, function() {
                this
                  .start(self.Cols)
                    .addClass(self.myClass('top-bar'))
                    .start(self.Cols)
                      .callIf(config$cannedQueries.length > 1, function() {
                        this
                          .start(self.TabChoiceView, {
                            choices: config$cannedQueries.map(o => [o.predicate, o.label]),
                            data$: self.predicate$
                          })
                            .addClass(self.myClass('canned-queries'))
                          .end();
                      })
                    .end()
                  .end();
              })
              .start(self.Cols).addClass(self.myClass('query-bar'))
                .start().addClass(self.myClass('toolbar'))
                  .tag(self.Toolbar, { /* data$: self.predicate$ */ })
                .end()
                .startContext({data: self})
                  .start(self.EXPORT, {
                    buttonStyle: foam.u2.ButtonStyle.SECONDARY
                  })
                    .addClass(self.myClass('export'))
                  .end()
                .endContext()
              .end()
              .start(self.ScrollTableView, {
                data: self.predicatedDAO$proxy,
                enableDynamicTableHeight: false
              })
                .addClass(self.myClass('browse-view-container'))
              .end()
            .end();
        }));
    }
  ]
});
