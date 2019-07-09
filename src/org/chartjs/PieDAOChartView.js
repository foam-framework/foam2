/**
* @license
* Copyright 2019 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'org.chartjs',
  name: 'PieDAOChartView',
  extends: 'org.chartjs.AbstractChartView',
  requires: [
    'foam.nanos.analytics.Candlestick',
  ],
  implements: [
    'foam.mlang.Expressions'
  ],
  properties: [
    {
      name: 'config',
      factory: function () {
        return {
          type: 'pie'
        };
      }
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'keyExpr'
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'valueExpr'
    },
    {
      name: 'backgroundColor',
      factory: function() {
        // You can also return an array of colors. But bear in mind that the length of the array
        // must match the number of data being displayed as it will match the index of the data.
        return function(context) {
          const palette = ['#E3170D', '#AF4035', '#CC1100', '#FFE4E1', '#FF6347', '#FF6600'];
          return palette[context.dataIndex % palette.length];
        }
      }
    }
  ],

  listeners: [
    {
      name: 'dataUpdate',
      isFramed: true,
      code: function() {
        var self = this;
        self.data
          .select(this.GROUP_BY(this.keyExpr, this.SUM(this.valueExpr)))
          .then(function(sink) {
            // Clear data before cloning because we'll be clobbering
            // it below anyway and cloning it can sometimes result in
            // a stack overflow.
            self.config.data = { datasets: [] };
            var config = foam.Object.clone(self.config);
            var dataset = {
              data: Object.keys(sink.groups).map(key => sink.groups[key].value),
              backgroundColor: self.backgroundColor
            };
            config.data = {
              datasets: [dataset],
              labels: Object.keys(sink.groups)
            };
            self.config = config;
          });
      }
    }
  ]
});
