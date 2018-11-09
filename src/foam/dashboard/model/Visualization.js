foam.CLASS({
  package: 'foam.dashboard.model',
  name: 'Visualization',
  requires: [
    'foam.dao.NullDAO',
    'foam.dashboard.view.Card',
    'foam.mlang.sink.NullSink',
    'org.chartjs.ChartConfig',
  ],
  properties: [
    {
      class: 'String',
      label: 'DAO',
      name: 'daoName'
    },
    {
      class: 'String',
      name: 'label'
    },
    {
      class: 'FObjectProperty',
      of: 'org.chartjs.ChartConfig',
      name: 'chartConfig',
      factory: function() {
        return this.ChartConfig.create();
      },
    },
    {
      name: 'dao',
      hidden: true,
      expression: function(daoName) {
        return this.__context__[daoName] || this.NullDAO.create();
      }
    },
    {
      // TODO: Provide rich configuration of sink.
      name: 'sink',
      hidden: true,
      factory: function() { return this.NullSink.create() },
    },
    {
      name: 'data',
      factory: function() {
        return this.sink.clone();
      },
      hidden: true
    },
    {
      name: 'currentView',
      view: function(args, x) {
        return {
          class: 'foam.u2.view.ChoiceView',
          choices: x.data.views
        };
      },
      hidden: true,
      factory: function() {
        return this.views[0][0];
      }
    },
    {
      // TODO: An enum would be better'
      class: 'String',
      name: 'mode',
      hidden: true,
      expression: function(currentView) {
        return currentView == this.DetailView ?
          'config' :
          'display';
      }
    },
    {
      name: 'views',
      hidden: true,
      factory: function() {
        return [
          [ this.DetailView, 'Configuration' ]
        ]
      }
    },
    {
      class: 'Enum',
      of: 'foam.dashboard.model.VisualizationSize',
      name: 'size',
      value: 'MEDIUM'
    }
  ],
  methods: [
    function toE(args, x) {
      return x.lookup('foam.dashboard.view.Card').create({ data: this }, x);
    }
  ],
  reactions: [
    [ '', 'propertyChange.sink', 'update' ],
    [ '', 'propertyChange.dao', 'update' ],
  ],
  listeners: [
    function update() {
      var sink = this.sink.clone();
      this.dao.select(sink).then(function(result) {
        this.data = result;
      }.bind(this));
    }
  ]
});
