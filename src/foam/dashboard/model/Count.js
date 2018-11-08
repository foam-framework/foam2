foam.CLASS({
  package: 'foam.dashboard.model',
  name: 'Count',
  extends: 'foam.dashboard.model.Visualization',
  requires: [
    'foam.dashboard.view.Count as CountView',
    'foam.mlang.sink.Count',
    'foam.mlang.predicate.False',
    'foam.parse.QueryParser',
    'foam.u2.ContextSensitiveDetailView as DetailView'
  ],
  properties: [
    {
      class: 'String',
      // TODO: Write a predicate view
      name: 'predicate'
    },
    {
      name: 'dao',
      expression: function(daoName, predicate) {
        var dao = this.__context__[daoName];

        if ( ! dao ) return this.NullDAO.create();

        var queryParser = this.QueryParser.create({ of: dao.of });

        var pred = queryParser.parseString(predicate) || this.False;

        if ( ! pred ) pred = this.False.create();

        return this.__context__[daoName].where(pred);
      }
    },
    {
      name: 'views',
      factory: function() {
        return [
          [ this.CountView, 'Count' ],
          [ this.DetailView, 'Configure' ]
        ];
      }
    },
    {
      name: 'sink',
      factory: function() {
        return this.Count.create();
      }
    }
  ]
});
