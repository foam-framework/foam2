/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dashboard.model',
  name: 'Visualization',
  requires: [
    'foam.dao.NullDAO',
    'foam.dashboard.view.Card',
    'foam.dao.ArraySink',
    'foam.mlang.sink.Sum',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.Average',
    'foam.mlang.order.Desc',
    'foam.parse.QueryParser',
    'foam.mlang.predicate.False',
    'foam.mlang.predicate.True',
  ],
  properties: [
    {
      class: 'String',
      // TODO: Write a predicate view
      name: 'predicate',
      hidden: true
    },
    {
      // TODO: A more complete Ordering view would be useful rather
      // than having a property for "order" and one for
      // "ascending/descending"
      class: 'FObjectProperty',
      type: 'foam.core.Property',
      name: 'order',
      view: { class: 'foam.u2.view.ExprView' },
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'descending',
      value: false
    },
    {
      class: 'String',
      label: 'DAO',
      hidden: true,
      name: 'daoName'
    },
    {
      class: 'String',
      name: 'label'
    },
    {
      name: 'dao',
      hidden: true,
      expression: function(daoName, predicate, order, descending) {
        var dao = this.__context__[daoName];

        if ( ! dao ) return this.NullDAO.create();

        var pred = predicate ?
            ( this.QueryParser.create({ of: dao.of }).parseString(predicate) || this.True.create() ) :
            this.True.create();

        return this.__context__[daoName].
          where(pred).
          orderBy(descending ? this.Desc.create({ arg1: order }) : order);
      }
    },
    {
      class: 'FObjectProperty',
      type: 'foam.dao.Sink',
      hidden: true,
      view: {
        class: 'foam.u2.view.FObjectView',
        choices: [
          [ 'foam.mlang.sink.ArraySink', 'LIST' ],
          [ 'foam.mlang.sink.Count', 'COUNT' ],
          [ 'foam.mlang.sink.Sum', 'SUM' ],
          [ 'foam.mlang.sink.Average', 'AVG' ],
        ]
      },
      name: 'sink',
      factory: function() { return this.ArraySink.create() },
    },
    {
      name: 'data',
      factory: function() {
        return this.sink.clone();
      },
      hidden: true
    },
    {
      name: 'configView',
      hidden: true,
      factory: function() { return this.CURRENT_VIEW },
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
      },
      adapt: function(_, n) {
        if ( foam.String.isInstance(n) ) {
          return this.views.find(function(o) { return o[1] == n })[0];
        }
        return n;
      },
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
    },
    {
      class: 'StringArray',
      name: 'colors',
      factory: function() {
        return [
          '#4dc9f6',
          '#f67019',
          '#f53794',
          '#537bc4',
          '#acc236',
          '#166a8f',
          '#00a950',
          '#58595b',
          '#8549ba',
        ]
      },
    }
  ],
  methods: [
    function toE(args, x) {
      return x.lookup('foam.dashboard.view.Card').create({ data: this }, x);
    }
  ],
  reactions: [
    [ 'sink', 'propertyChange', 'update' ],
    [ 'sink', 'nestedPropertyChange', 'update' ],
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
