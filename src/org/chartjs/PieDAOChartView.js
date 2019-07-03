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
      name: 'keyExpr',
      factory: function() { return this.Candlestick.KEY; }
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'valueExpr',
      factory: function() { return this.Candlestick.AVERAGE; }
    },
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
            config.data = {
              datasets: [{
                data: Object.keys(sink.groups).map(key => sink.groups[key].value),
              }],
              labels: Object.keys(sink.groups)
            };
            self.config = config;
          });
      }
    }
  ]
});
