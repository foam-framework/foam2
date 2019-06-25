/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.mlang',
  name: 'Pie',
  extends: 'foam.mlang.sink.GroupBy',
  requires: [
    'foam.graphics.DataSource',
    'foam.graphics.PieGraph',
  ],
  properties: [
    // TODO: When these defaults are no longer necessary, move these args into
    // their own class and add them as a trait to this model so any new args
    // used by PieGraph are automatically picked up by this model.
    [ 'graphColors', [ '#d81e05', '/*%BLACK%*/ #1e1f21', '#59a5d5', '#2cab70' ] ],
    [ 'height', 150 ],
    [ 'margin', 1.5 ],
    [ 'radius', 50 ],
    [ 'width', 150 ],
    [ 'x', 50 ],
    [ 'y', 50 ],

    {
      name: 'graph_',
      expression: function(groups) {
        var seriesValues = Object.values(groups).map(function(sink) {
          return sink.value;
        })
        if ( ! seriesValues.length ) seriesValues = [0];
        var p = this.PieGraph.create(this);
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
