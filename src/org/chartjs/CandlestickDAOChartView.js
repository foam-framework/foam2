/**
* @license
* Copyright 2019 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'org.chartjs',
  // TODO: Rename this to LineDAOChartView because the DAO
  // doesn't NEED to be of Candlesticks. The defaults for this
  // view are just for candlesticks.
  name: 'CandlestickDAOChartView',
  extends: 'org.chartjs.AbstractChartView',
  requires: [
    'foam.nanos.analytics.Candlestick',
  ],
  implements: [
    'foam.mlang.Expressions'
  ],
  properties: [
    {
      class: 'Map',
      name: 'config',
      documentation: `
        The config map that is expected by chartjs. Structure and information can be found in chartjs.org's documentation.
      `,
      factory: function () {
        return {
          type: 'line',
          data: { datasets: [] },
          options: {
            scales: {
              xAxes: [{
                type: 'time',
                distribution: 'linear'
              }]
            }
          }
        };
      }
    },
    {
      class: 'Map',
      name: 'customDatasetStyling',
      documentation: `
        Property map that would hold the customization for each key type in the candlestickDAO.
        1. Key must equal the candlestick's key.
        2. Value mapped with key must be a 1:1 mapping defined in chartjs.org's documentation.
      `
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'keyExpr',
      factory: function() { return this.Candlestick.KEY; }
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'xExpr',
      factory: function() { return this.Candlestick.CLOSE_TIME; }
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'yExpr',
      factory: function() { return this.Candlestick.AVERAGE; }
    }
  ],
  reactions: [
    ['', 'propertyChange.customDatasetStyling', 'dataUpdate']
  ],
  listeners: [
    {
      name: 'dataUpdate',
      isFramed: true,
      code: function() {
        var self = this;
        self.data
          .orderBy(this.xExpr)
          .select(this.GROUP_BY(this.keyExpr, this.PLOT(this.xExpr, this.yExpr)))
          .then(function(sink) {
            // Clear data before cloning because it gets clobbered anyway.
            self.config.data = { datasets: [] };
            var config = foam.Object.clone(self.config);
            config.data = {
              datasets: Object.keys(sink.groups).map(key => {
                var data = {
                  label: key,
                  data: sink.groups[key].data.map(arr => ({ x: arr[0], y: arr[1] }))
                };
                var style = self.customDatasetStyling[key] || {};
                Object.keys(style).forEach(function(k) {
                  data[k] = style[k];
                });
                return data;
              })
            };
            self.config = config;
          });
      }
    }
  ]
});
