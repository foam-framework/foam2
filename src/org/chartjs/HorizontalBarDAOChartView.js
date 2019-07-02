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
      name: 'dateRange'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'account',
    },
    {
      class: 'Enum',
      of: 'net.nanopay.liquidity.ui.dashboard.DateFrequency',
      name: 'dateFrequency',
    },
    {
      class: 'Map',
      name: 'config',
      documentation: `
        The config map that is expected by chartjs. Structure and information can be found in chartjs.org's documentation.
      `,
      factory: function () {
        return {
          type: 'horizontalBar'
        };
      }
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'labelExpr',
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

  reactions: [
    ['', 'propertyChange.account', 'dataUpdate'],
    ['', 'propertyChange.dateFrequency', 'dataUpdate'],
    ['', 'propertyChange.dateRange', 'dataUpdate'],
  ],

  listeners: [
    {
      name: 'dataUpdate',
      isFramed: true,
      code: function() {
        var self = this;
        self.data
          .where(
            this.AND(
              this.GTE(net.nanopay.tx.model.Transaction.COMPLETION_DATE, this.dateRange.min),
              this.LTE(net.nanopay.tx.model.Transaction.COMPLETION_DATE, this.dateRange.max)
            )
          )
          .select(this.GROUP_BY(this.dateFrequency.glang, this.SUM()))
          .then(function(sink) {
            console.log(sink);
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
          })
      }
    }
  ]
});
