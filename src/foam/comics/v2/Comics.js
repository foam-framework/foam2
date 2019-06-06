/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'ViewSpecWithJava',
  extends: 'foam.u2.ViewSpec',
  properties: [
    ['view', { class: 'foam.u2.view.MapView' }],
    ['type', 'foam.lib.json.UnknownFObject'],
    ['javaInfoType', 'foam.core.AbstractFObjectPropertyInfo'],
    ['javaJSONParser', 'new foam.lib.json.UnknownFObjectParser()'],
    // TODO: remove next line when permanently fixed in ViewSpec
    ['fromJSON', function fromJSON(value, ctx, prop, json) {
      return value;
    }]
  ]
});

foam.CLASS({
  package: 'foam.comics.v2',
  name: 'NamedView',
  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'foam.u2.ViewSpecWithJava',
      name: 'view'
    },
    {
      class: 'String',
      name: 'icon'
    }
  ]
}); 

foam.CLASS({
  package: 'foam.comics.v2',
  name: 'CannedQuery',
  properties: [
    {
      class: 'String',
      name: 'name',
      hidden: true,
      expression: function(label) {
        // Since these can be used as axioms, provide a unique name based on the label.
        return label.replace(/[^0-9a-z]/gi, '') + '__CannedQuery';
      }
    },
    {
      class: 'String',
      name: 'label'
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'predicate',
      expression: function(predicateFactory) {
        return predicateFactory ?
          predicateFactory(foam.mlang.ExpressionsSingleton.create()) :
          null;
      }
    },
    {
      name: 'predicateFactory',
      hidden: true
    }
  ]
}); 

foam.CLASS({
  package: 'foam.comics.v2',
  name: 'DAOControllerConfig',
  requires: [
    'foam.comics.v2.CannedQuery',
    'foam.comics.v2.NamedView'
  ],
  properties: [
    {
      class: 'String',
      name: 'daoKey'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      hidden: true,
      expression: function(daoKey) {
        return this.__context__[daoKey] || foam.dao.NullDAO.create({of: foam.core.FObject});
      }
    },
    {
      class: 'Class',
      name: 'of',
      expression: function(dao$of) { return dao$of; }
    },
    {
      class: 'String',
      name: 'browseTitle',
      expression: function(of) { return of.name; }
    },
    {
      class: 'foam.u2.ViewSpecWithJava',
      name: 'browseBorder',
      expression: function() {
        // Can't use a value here because java tries to generate a HasMap
        // for it which doesn't jive with the AbstractFObjectPropertyInfo.
        return { class: 'foam.u2.borders.NullBorder' };
      }
    },
    {
      class: 'FObjectArray',
      of: 'foam.comics.v2.NamedView',
      name: 'browseViews',
      factory: null,
      expression: function(of) {
        return of.getAxiomsByClass(this.NamedView);
      }
    },
    {
      class: 'FObjectArray',
      of: 'foam.comics.v2.CannedQuery',
      name: 'cannedQueries',
      factory: null,
      expression: function(of) {
        return of.getAxiomsByClass(this.CannedQuery);
      }
    },
    {
      class: 'foam.u2.ViewSpecWithJava',
      name: 'viewBorder',
      expression: function() {
        // Can't use a value here because java tries to generate a HasMap
        // for it which doesn't jive with the AbstractFObjectPropertyInfo.
        return { class: 'foam.u2.borders.NullBorder' };
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.comics.v2',
  name: 'DAOBrowseControllerView',
  extends: 'foam.u2.View',
  imports: [
    'stack'
  ],
  requires: [
    'foam.comics.v2.DAOBrowserView',
    'foam.u2.borders.CardBorder',
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows',
    'foam.u2.view.IconChoiceView'
  ],
  css: `
    ^container {
      padding: 32px;
    }

    ^header-container {
      padding-bottom: 32px;
      align-items: center;
    }

    ^browse-title {
      font-size: 36px;
      font-weight: 600;
      line-height: 1.33;
      color: #1e1f21;
    }

    ^altview-container {
      position: absolute;
      right: 0;
      padding: 12px 16px 0 0;
    }
  `,
  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.DAOControllerConfig',
      name: 'data'
    },
    {
      class: 'foam.u2.ViewSpecWithJava',
      name: 'browseView',
      expression: function(data$browseViews) {
        return data$browseViews && data$browseViews.length
          ? data$browseViews[0].view
          : this.DAOBrowserView;
      }
    }
  ],
  actions: [
    {
      name: 'create',
      code: function() {
        if ( ! this.stack ) return;
        this.stack.push({
          class: 'foam.comics.v2.DAOCreateView',
          data$: this.data$
        });
      }
    }
  ],
  methods: [
    function initE() {
    this.SUPER();

    var self = this;

      this.addClass(this.myClass())
      .add(this.slot(function(data, data$browseBorder, data$browseViews) {
        return self.E()
          .start(self.Rows)
            .addClass(self.myClass('container'))
            .start(self.Cols)
              .addClass(self.myClass('header-container'))
              .start()
                .addClass(self.myClass('browse-title'))
                .add(data.browseTitle$)
              .end()
              .startContext({data: self}).add(self.CREATE).endContext()
            .end()
            .start(self.CardBorder)
              .style({ position: 'relative' })
              .start(data$browseBorder)
                .callIf(data$browseViews.length > 1, function() {
                  this
                    .start(self.IconChoiceView, { 
                      choices: data$browseViews.map(o => [o.view, o.icon]),
                      data$: self.browseView$
                    })
                      .addClass(self.myClass('altview-container'))
                    .end();
                })
                .add(self.slot(function(browseView) {
                  return self.E().tag(browseView, {data: data});
                }))
              .end()
            .end()
          .end();
      }));
    }
  ]
});

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
    'foam.u2.view.TabChoiceView'
  ],

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
      margin: 20px 0px 72px 0px;
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
      class: 'FObjectProperty',
      of: 'foam.comics.v2.DAOControllerConfig',
      name: 'data'
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'predicate',
      expression: function(data$cannedQueries) {
        return data$cannedQueries && data$cannedQueries.length 
          ? data$cannedQueries[0].predicate
          : foam.mlang.predicate.True.create();
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'predicatedDAO',
      expression: function(data, predicate) {
        return data.dao$proxy.where(predicate);
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
        class: 'foam.comics.v2.DAOUpdateView',
        data$: this.data$,
        obj: obj
      });
    },
    function initE() {
      var self = this;
      this.addClass(this.myClass());
      this.SUPER();
      this
        .add(self.slot(function(data$cannedQueries) {
          return self.E()
            .start(self.Rows)
              .callIf(data$cannedQueries.length >= 1, function() {
                this
                  .start(self.Cols)
                    .addClass(self.myClass('top-bar'))
                    .start(self.Cols)
                      .callIf(data$cannedQueries.length > 1, function() {
                        this
                          .start(self.TabChoiceView, { 
                            choices: data$cannedQueries.map(o => [o.predicate, o.label]),
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

foam.CLASS({
  package: 'foam.comics.v2',
  name: 'DAOUpdateView',
  extends: 'foam.u2.View',

  css:`
    ^ {
      padding: 32px
    }

    ^ .foam-u2-ActionView-back {
      display: flex;
      align-items: center;
    }

    ^account-name {
      font-size: 36px;
      font-weight: 600;
    }

    ^actions-header .foam-u2-ActionView {
      margin-right: 24px;
      line-height: 1.5
    }

    ^view-container {
      margin: auto;
    }
  `,

  requires: [
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows',
    'foam.u2.ControllerMode',
  ],
  imports: [
    'stack'
  ],
  exports: [
    'controllerMode'
  ],
  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.DAOControllerConfig',
      name: 'data'
    },
    {
      name: 'controllerMode',
      factory: function() {
        return this.ControllerMode.VIEW;
      }
    },
    {
      class: 'FObjectProperty',
      name: 'obj'
    },
    {
      class: 'foam.u2.ViewSpecWithJava',
      name: 'viewView',
      expression: function() {
        return foam.u2.detail.SectionedDetailView;
      }
    },
    {
      name: 'primary',
      expression: function(data$of){
        var allActions = data$of.getAxiomsByClass(foam.core.Action)
        var defaultAction = allActions.filter(a => a.isDefault);
        return defaultAction.length >= 1 ? defaultAction[0] : allActions[0];
      }
    }
  ],
  actions: [
    {
      name: 'edit',
      code: function() {
        this.controllerMode = this.ControllerMode.EDIT;
      }
    },
    {
      name: 'delete',
      code: function() {
        alert('TODO');
      }
    }
  ],
  methods: [
    function initE() {
      var self = this;
      this.SUPER();
      this
        .addClass(this.myClass())
        .add(self.slot(function(obj, data$viewBorder) {
          return self.E()
            .start(self.Rows)
              .start(self.Rows)
                // we will handle this in the StackView instead
                .startContext({ data: self.stack })
                    .tag(self.stack.BACK, {
                      buttonStyle: foam.u2.ButtonStyle.TERTIARY,
                      icon: 'images/back-icon.svg'
                    })
                .endContext()
                .start(self.Cols).style({ 'align-items': 'center' })
                  .start()
                    .add(obj.toSummary())
                      .addClass(this.myClass('account-name'))
                  .end()
                  .startContext({data: obj}).add(self.primary).endContext()
                .end()
              .end()

              .start(self.Cols)
                .start(self.Cols).addClass(this.myClass('actions-header'))
                  .startContext({data: self}).tag(self.EDIT, {
                    buttonStyle: foam.u2.ButtonStyle.TERTIARY,
                    icon: 'images/edit-icon.svg'
                  }).endContext()
                  .startContext({data: self}).tag(self.DELETE, {
                    buttonStyle: foam.u2.ButtonStyle.TERTIARY,
                    icon: 'images/delete-icon.svg'
                  }).endContext()
                .end()
              .end()

              .start(data$viewBorder)
                .start().addClass(this.myClass('view-container'))
                  .add(self.slot(function(viewView) {
                    return self.E().tag(viewView, {
                      data: obj
                    });
                  }))
                .end()
              .end()
            .end();
        }));
    }
  ]
});

foam.CLASS({
  package: 'foam.comics.v2',
  name: 'DAOCreateView',
  extends: 'foam.u2.View',

  css:`
    ^ {
      padding: 32px
    }

    ^ .foam-u2-ActionView-back {
      display: flex;
      align-items: center;
    }

    ^account-name {
      font-size: 36px;
      font-weight: 600;
    }

    ^create-view-container {
      margin: auto;
    }
  `,

  requires: [
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows',
    'foam.u2.ControllerMode',
  ],
  imports: [
    'stack'
  ],
  exports: [
    'controllerMode'
  ],
  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.DAOControllerConfig',
      name: 'data'
    },
    {
      name: 'controllerMode',
      factory: function() {
        return this.ControllerMode.CREATE;
      }
    },
    {
      class: 'foam.u2.ViewSpecWithJava',
      name: 'viewView',
      expression: function() {
        return foam.u2.detail.SectionedDetailView;
      }
    }
  ],
  methods: [
    function initE() {
      var self = this;
      this.SUPER();
      this
        .addClass(this.myClass())
        .add(self.slot(function(data$viewBorder, data$browseTitle, data$of) {
          return self.E()
            .start(self.Rows)
              .start(self.Rows)
                // we will handle this in the StackView instead
                .startContext({ data: self.stack })
                    .tag(self.stack.BACK, {
                      buttonStyle: foam.u2.ButtonStyle.TERTIARY,
                      icon: 'images/back-icon.svg'
                    })
                .endContext()
                .start(self.Cols).style({ 'align-items': 'center' })
                  .start()
                    .add(`Create your ${data$browseTitle}`)
                      .addClass(this.myClass('account-name'))
                  .end()
                .end()
              .end()
              .start(data$viewBorder)
                .start().addClass(this.myClass('create-view-container'))
                  .tag(this.viewView, { data: data$of.create() })
                .end()
              .end()
        }));
    }
  ]
});