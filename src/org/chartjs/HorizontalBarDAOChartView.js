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
      factory: function () {
        var self = this;
        return {
          type: 'horizontalBar',
          options: {
            legend: {
              display: false
            },
            elements: {
              rectangle: {
                borderWidth: 2,
              }
            },
            scales: {
              yAxes: [
                // {
                // ticks: {
                //   // convert to millions
                //   callback: function (value, index, values) {
                //     const dateArray = value.split('/');
                //     const monthNames = [
                //       "January", "February", "March", "April", "May", "June",
                //       "July", "August", "September", "October", "November", "December"
                //     ];
                //     const quarterNames = ['Q1', 'Q2', 'Q3', 'Q4'];

                //     switch (self.dateFrequency) {
                //       case net.nanopay.liquidity.ui.dashboard.DateFrequency.MONTHLY:
                //         return `${monthNames[Number.parseInt(dateArray[0])]} ${dateArray[2]}`

                //       case net.nanopay.liquidity.ui.dashboard.DateFrequency.QUARTERLY:
                //         return `${quarterNames[Number.parseInt(dateArray[0]) / 3 - 1]} ${dateArray[2]}`

                //       case net.nanopay.liquidity.ui.dashboard.DateFrequency.ANNUALLY:
                //         return dateArray[2];

                //       default:
                //         return value;
                //     }
                //   }
                // }
              // }
            ],
              xAxes: [{
                ticks: {
                  callback: function (value, index, values) {
                    return `$${value}`;
                  }
                }
              }]
            }
          },
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
    ['', 'propertyChange.yExpr', 'dataUpdate'],
    ['', 'propertyChange.data', 'dataUpdate']
  ],

  listeners: [
    {
      name: 'dataUpdate',
      isFramed: true,
      code: function () {
        var self = this;
        self.data
          .orderBy(this.yExpr)
          .select(this.GROUP_BY(this.yExpr, this.GROUP_BY(this.keyExpr, this.SUM(this.xExpr))))
          .then(function (sink) {
            // Clear data before cloning because it gets clobbered anyway.
            self.config.data = { datasets: [] };
            var config = foam.Object.clone(self.config);

            var dataMap = Object.keys(sink.groups).reduce((map, y) => {
              return sink.groups[y].groupKeys.reduce((map, k) => {
                map[k] = [];
                return map;
              }, map);
            }, {});

            Object.keys(sink.groups).forEach((y, yi) => {
              Object.keys(dataMap).forEach(k => {
                dataMap[k][yi] = 0;
              });
              sink.groups[y].groupKeys.forEach(k => {
                dataMap[k][yi] = sink.groups[y].groups[k].value;
              });
            });

            config.data = {
              labels: sink.groupKeys,
              datasets: Object.keys(dataMap).map(k => {
                var data = {
                  label: k,
                  data: dataMap[k]
                };
                var style = self.customDatasetStyling[k] || {};
                Object.keys(style).forEach(function (k) {
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
