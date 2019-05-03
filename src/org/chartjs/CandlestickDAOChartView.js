/**
* @license
* Copyright 2019 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'org.chartjs',
  name: 'CandlestickDAOChartView',
  extends: 'foam.u2.View',

  documentation: `
    A view that would generate a chart using chartjs and a supplied CandlestickDAO.
  `,

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.dao.FnSink',
    'foam.nanos.analytics.Candlestick',
    'org.chartjs.ChartCView'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data',
      documentation: `
        The supplied CandlestickDAO.
      `
    },
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

  methods: [
    function initE() {
      this.onDetach(this.data$proxy.listen(this.FnSink.create({ fn: this.dataUpdate })));
      this.add(this.ChartCView.create({ config$: this.config$ }));
    }
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