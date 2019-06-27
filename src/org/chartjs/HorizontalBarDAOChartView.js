/**
* @license
* Copyright 2019 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'org.chartjs',
  name: 'HorizontalBarDAOChartView',
  extends: 'org.chartjs.AbstractChartView',

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
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'xExpr',
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'yExpr',
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
            var config = {};
            config = foam.Object.clone(self.config);
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
