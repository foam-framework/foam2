foam.CLASS({
  package: 'foam.u2.mlang',
  name: 'Pie',
  extends: 'foam.mlang.sink.GroupBy',
  requires: [
    'foam.graphics.DataSource',
    'foam.graphics.PieGraph',
  ],
  properties: [
    {
      name: 'graphArgs',
      value: {
        radius: 200,
        x: 150,
        y: 150,
        margin: 1.3,
        graphColors: [ '#d81e05', '#093649', '#59a5d5', '#2cab70' ],
      },
    },
    {
      name: 'graph_',
      expression: function(graphArgs, groups) {
        var seriesValues = Object.values(groups).map(function(sink) {
          return sink.value;
        })
        if ( ! seriesValues.length ) seriesValues = [0];
        var p = this.PieGraph.create(graphArgs);
        p.seriesValues = seriesValues;
        return p;
      },
    },
  ],
  methods: [
    function toE(_, x) {
      return x.E().add(this.graph_$);
    }
  ]
});
