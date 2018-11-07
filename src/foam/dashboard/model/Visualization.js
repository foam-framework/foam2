foam.CLASS({
  package: 'foam.dashboard.model',
  name: 'Visualization',
  requires: [
    'foam.dao.NullDAO',
    'foam.dashboard.view.Card'
  ],
  properties: [
    {
      class: 'String',
      label: 'DAO',
      name: 'daoName'
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
      hidden: true
    },
    {
      name: 'data',
      factory: function() {
        return this.sink.clone();
      },
      hidden: true
    },
    {
      name: 'views',
      hidden: true,
      factory: function() {
        return []
      }
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
