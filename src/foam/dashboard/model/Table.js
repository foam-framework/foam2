foam.CLASS({
  package: 'foam.dashboard.model',
  name: 'Table',
  extends: 'foam.dashboard.model.Visualization',
  requires: [
    'foam.dao.ArraySink',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.GroupBy',
    'foam.dashboard.view.DAOTable',
    'foam.u2.ContextSensitiveDetailView as DetailView',
    'foam.mlang.sink.NullSink',
  ],
  properties: [
    {
      class: 'Int',
      name: 'limit',
      value: 5,
    },
    {
      name: 'columns'
    },
    {
      name: 'views',
      factory: function() {
        return [
          [ this.DAOTable, 'Table' ],
          [ this.DetailView, 'Configure' ],
        ]
      }
    },
  ]
});
