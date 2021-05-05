/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.comics',
  name: 'DAOControllerView',
  extends: 'foam.u2.View',

  requires: [
    'foam.comics.SearchMode',
    'foam.comics.DAOController',
    'foam.comics.DAOUpdateControllerView',
    'foam.nanos.controller.Memento',
    'foam.nanos.u2.navigation.IFrameTopNavigation',
    'foam.u2.dialog.Popup',
    'foam.u2.view.ScrollTableView'
  ],

  imports: [
    'createControllerView? as importedCreateControllerView',
    'data? as importedData',
    'memento',
    'stack',
    'summaryView? as importedSummaryView',
    'updateView? as importedUpdateView',
    'window',
    'translationService'
  ],

  exports: [
    'as controllerView',
    'currentMemento_ as memento',
    'data.selection as selection',
    'data.data as dao',
    'data.filteredTableColumns as filteredTableColumns',
    'data.searchColumns as searchColumns',
    'dblclick as click',
    'dblclick'
  ],

  css: `
    ^ {
      margin: 24px auto 0 auto;
      padding: 0 32px;
    }

    ^top-row {
      align-items: center;
      margin-bottom: 10px;
    }

    ^separate {
      display: flex;
      justify-content: space-between;
    }

    ^title-container > * {
      color: /*%BLACK%*/ #1e1f21;
      margin: 0;
    }

    ^container {
      padding: 0 0px;
    }

    ^ .actions {
      display: inline-block;
      margin-bottom: 8px;
    }

    ^ .actions button + button {
      margin-left: 8px;
    }

    ^full-search-container {
      flex: 0 0 250px;
      padding-right: 18px;
      width: 250px;
      float: left;
      padding-top: 23px;
    }

    ^manual-width-adjust {
      width: inherit;
    }
  `,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.comics.DAOController',
      name: 'data',
      expression: function(importedData) {
        return importedData;
      }
    },
    {
      name: 'cls',
      expression: function(data) {
        return data.cls_;
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'defaultSummaryView_',
      value: { class: 'foam.u2.view.ScrollTableView' }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'summaryView',
      factory: function() {
        return this.data.summaryView ||
          this.importedSummaryView ||
          this.defaultSummaryView_;
      }
    },
    {
      name: 'createControllerView',
      expression: function(data) {
        return this.importedCreateControllerView || {
          class: 'foam.comics.DAOCreateControllerView',
          detailView: data.detailView
        };
      }
    },
    {
      name: 'updateView',
      expression: function() {
        return this.importedUpdateView || {
          class: 'foam.comics.DAOUpdateControllerView'
        };
      }
    },
    'currentMemento_'
  ],

  reactions: [
    ['data', 'action.create', 'onCreate'],
    ['data', 'edit', 'onEdit'],
    ['data', 'finished', 'onFinished'],
    ['data', 'export', 'onExport']
  ],

  methods: [
    function initE() {
      var self = this;
      var summaryViewParent;

      var reciprocalSearch = foam.u2.ViewSpec.createView({
        class: 'foam.u2.view.ReciprocalSearch',
        data$: this.data.predicate$
      }, {}, self, self.__subContext__.createSubContext({ memento: this.memento }));

      var searchView = foam.u2.ViewSpec.createView({
        class: 'foam.u2.view.SimpleSearch',
        data$: this.data.predicate$
      }, {}, self, reciprocalSearch.__subContext__.createSubContext());

      if ( this.data.searchMode === this.SearchMode.FULL ) {
        summaryViewParent = reciprocalSearch;
      }
      if ( this.data.searchMode === this.SearchMode.SIMPLE ) {
        summaryViewParent = searchView;
      }

      var summaryView = foam.u2.ViewSpec.createView(this.summaryView, {
        data$: this.data.filteredDAO$,
        multiSelectEnabled: !! this.data.relationship,
        selectedObjects$: this.data.selectedObjects$
      }, {}, summaryViewParent);

      this.currentMemento_ = summaryView.memento;

      this.data.border.add(
        this.E()
          .addClass(this.myClass())
          .start()
          .start()
            .addClass(this.myClass('top-row'))
            .addClass(this.myClass('separate'))
            .start()
              .addClass(this.myClass('title-container'))
              .start('h1')
                .translate(this.data.title, this.data.title)
              .end()
              .start()
                .translate(this.data.subtitle, this.data.subtitle)
              .end()
            .end()
            .callIfElse(self.data.createLabel, function() {
              this.tag(self.data.primaryAction, {
                label: self.translationService.getTranslation(foam.locale, `${self.parentNode.createControllerView.menu}.createLabel`, self.data.createLabel),
                size: 'LARGE'
              });
            }, function() {
              this.start().tag(self.data.primaryAction, { size: 'LARGE' }).end();
            })
          .end()
          .start()
            .addClass(this.myClass('container'))
            .callIf(this.data.searchMode === this.SearchMode.FULL, function() {
              this.start()
                .hide(self.data.searchHidden$)
                .addClass(self.myClass('full-search-container'))
                .add(reciprocalSearch)
              .end();
            })
            .start().addClass(this.myClass('manual-width-adjust'))
              .start()
                .addClass(this.myClass('separate'))
                .callIf(this.data.searchMode === this.SearchMode.SIMPLE, function() {
                  this
                    .start()
                      .add(searchView)
                    .end();
                })
                .start().show(self.mode$.map(m => m === foam.u2.DisplayMode.RW))
                  .forEach(self.cls.getAxiomsByClass(foam.core.Action).filter(action => {
                    return action.name !== self.data.primaryAction.name;
                  }), function(action) {
                    this.tag(action, { buttonStyle: 'TERTIARY' });
                  })
                  .add()
                .end()
              .end()
              .add(summaryView)
            .end()
          .end()
        .end());

      this.add(this.data.border);
      if ( this.isIframe() ) this.tag(this.IFrameTopNavigation);
    },

    function isIframe() {
      try {
        return window.self !== window.top;
      } catch (e) {
        return true;
      }
    },

    function dblclick(obj, id) {
      if ( this.data.dblclick ) {
        this.data.dblclick(obj, obj && obj.id ? obj.id : id);
      } else {
        this.onEdit(null, null, obj && obj.id ? obj.id : id);
      }
    }
  ],

  listeners: [
    function onCreate() {
      this.stack.push(this.createControllerView, this.__subContext__);
    },

    function onEdit(s, edit, id) {
      this.stack.push({
        class: this.updateView.class,
        detailView: this.data.detailView,
        editEnabled: this.data.editEnabled,
        key: id
      }, this.__subContext__);
    },

    function onFinished() {
      this.stack.back();
    },

    function onExport(dao) {
      this.add(this.Popup.create().tag({
        class: 'foam.u2.ExportModal',
        exportData: dao.src.filteredDAO
      }));
    }
  ]
});
