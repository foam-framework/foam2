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
      class: 'DateTime',
      name: 'startDate'
    },
    {
      class: 'DateTime',
      name: 'endDate'
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
          type: 'horizontalBar',
          options: {
            elements: {
              rectangle: {
                borderWidth: 2,
              }
            },
          },
          scales: {
            xAxes: [{
              barPercentage: 0.5,
              barThickness: 6,
              maxBarThickness: 8,
              gridLines: {
                  offsetGridLines: true
              }
            }]
          } 
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
    ['', 'propertyChange.startDate', 'dataUpdate'],
    ['', 'propertyChange.endDate', 'dataUpdate'],
  ],

  listeners: [
    {
      name: 'dataUpdate',
      isFramed: true,
      code: function() {
        debugger;
        var self = this;
        var glang = {};
        glang = this.dateFrequency.glang.clone().copyFrom({
          delegate: net.nanopay.tx.model.Transaction.COMPLETION_DATE
        });

        self.data
          .where(
            this.AND(
              this.GTE(net.nanopay.tx.model.Transaction.COMPLETION_DATE, self.startDate),
              this.LTE(net.nanopay.tx.model.Transaction.COMPLETION_DATE, self.endDate)
            )
          )
          .select(this.GROUP_BY(glang, this.GROUP_BY(net.nanopay.tx.model.Transaction.TYPE, this.SUM(net.nanopay.tx.model.Transaction.AMOUNT))))
          .then(function(sink) {
            console.log(sink);
            var config = {};
            config = foam.Object.clone(self.config);
            debugger;
            config.data = {
              labels: sink.groupKeys.map(key => {
                return key.toLocaleDateString();
              }),
              datasets: [
                {
                  label: 'Cash In',
                  backgroundColor: '#b8e5b3',
                  data: Object.keys(sink.groups).map(key => sink.group[key]["AlternaCITransaction"].value)
                },
                {
                  label: 'Cash Out',
                  backgroundColor: '#f79393',
                  data: Object.keys(sink.groups).map(key => sink.group[key]["AlternaCOTransaction"].value)
                }
              ]
            };
            self.config = config;
          })
      }
    }
  ]
});
