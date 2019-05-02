foam.CLASS({
  package: 'foam.comics.v2',
  name: 'BrowseView',
  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'view'
    }
  ]
}); 

foam.CLASS({
  package: 'foam.comics.v2',
  name: 'CannedQuery',
  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'predicate'
    }
  ]
}); 

foam.CLASS({
  package: 'foam.comics.v2',
  name: 'DAOControllerConfig', // EasyDAOController?
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
      class: 'foam.u2.ViewSpec',
      name: 'browseBorder',
      value: { class: 'foam.u2.borders.NullBorder' }
    },
    {
      class: 'FObjectArray',
      of: 'foam.comics.v2.BrowseView',
      name: 'browseViews',
      factory: function() {
        return [
          {
            name: 'Table',
            view: { class: 'foam.u2.view.ScrollTableView' }
          }
        ];
      }
    },
    {
      class: 'FObjectArray',
      of: 'foam.comics.v2.CannedQuery',
      name: 'cannedQueries'
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
    'foam.u2.layout.ColumnLayout',
    'foam.u2.layout.RowLayout'
  ],
  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.DAOControllerConfig',
      name: 'data'
    }
  ],
  actions: [
    {
      name: 'create',
      code: function() {
        alert('TODO');
      }
    }
  ],
  methods: [
    function initE() {
      var self = this;
      this
        .add(this.slot(function(data) {
          return self.E()
            .start(self.RowLayout)
              .start(self.ColumnLayout)
                .start('h1').add(data.browseTitle$).end()
                .startContext({data: self}).add(self.CREATE).endContext()
              .end()
              .add(data.slot(function(browseBorder) {
                return self.E()
                  .start(browseBorder)
                    .tag(self.DAOBrowserView, { data: data })
                  .end();
              }))
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
    'foam.u2.ScrollTableView',
    'foam.u2.layout.ColumnLayout',
    'foam.u2.layout.RowLayout',
    'foam.u2.search.Toolbar'
  ],
  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.DAOControllerConfig',
      name: 'data'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'predicate'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'predicatedDAO',
      expression: function(data, predicate) {
        return data.dao$proxy.where(predicate);
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'browseView',
      expression: function(data$browseViews) {
        return data$browseViews[0].view;
      }
    }
  ],
  actions: [
    {
      name: 'export',
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
        .start(this.RowLayout)
          .start(this.ColumnLayout)
            .add(this.slot(function(data$cannedQueries) {
              return self.E().forEach(data$cannedQueries, function(q) {
                this.add(q.name); // TODO: make these do something.
              });
            }))
            .add(this.slot(function(data$browseViews) {
              return self.E().forEach(data$browseViews, function(o) {
                // TODO: make these do something.
                // TODO: make these icons.
                this.add(o.name);
              });
            }))
          .end()
          .start(this.ColumnLayout)
            .tag(self.Toolbar, { data$: self.predicate$ })
            .startContext({data: self}).add(self.EXPORT).endContext()
          .end()
          .add(self.slot(function(browseView) {
            return self.E().tag(browseView, {
              data: self.predicatedDAO$proxy
            });
          }))
        .end();
    }
  ]
});