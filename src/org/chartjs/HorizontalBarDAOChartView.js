foam.CLASS({
  package: 'org.chartjs',
  name: 'HorizontalBarDAOChartView',
  extends: 'org.chartjs.AbstractChartView',

  implements: [
    'foam.mlang.Expressions'
  ],

  properties: [
    {
      class: 'Date',
      name: 'startDate'
    },
    {
      class: 'Date',
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
              yAxes: [{
                ticks: {
                  // convert to millions
                  callback: function(value, index, values) {
                    const dateArray = value.split('/');
                    const monthNames = [
                      "January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"
                    ];
                    const quarterNames = ['Q1', 'Q2', 'Q3', 'Q4'];

                    switch(self.dateFrequency){
                      case net.nanopay.liquidity.ui.dashboard.DateFrequency.MONTHLY:
                        return `${monthNames[Number.parseInt(dateArray[0])]} ${dateArray[2]}`
                         
                      case net.nanopay.liquidity.ui.dashboard.DateFrequency.QUARTERLY:
                        return `${quarterNames[Number.parseInt(dateArray[0]) / 3 - 1]} ${dateArray[2]}`

                      case net.nanopay.liquidity.ui.dashboard.DateFrequency.ANNUALLY:
                        return dateArray[2];

                      default:
                        return value;
                    }
                  }
                }
              }],
              xAxes: [{
                ticks: {
                  callback: function(value, index, values) {
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
        var self = this;
        var glang = {};
        glang = this.dateFrequency.glang.clone().copyFrom({
          delegate: self.yExpr
        });

        self.data
          .where(
            this.AND(
              this.GTE(self.yExpr, self.startDate),
              this.LTE(self.yExpr, self.endDate)
            )
          )
          .select(this.GROUP_BY(glang, this.GROUP_BY(self.labelExpr, this.SUM(self.xExpr))))
          .then(function(sink) {
            self.config.data = { datasets: [] };
            var config = foam.Object.clone(self.config);
            config.data = {
              labels: sink.groupKeys.map(key => {
                return key.toLocaleDateString();
              }),
              
              datasets: [
                {
                  label: 'Cash In',
                  backgroundColor: '#b8e5b3',
                  data: Object.keys(sink.groups).map(key => {
                    return sink.groups[key].groups["CITransaction"] 
                      ? sink.groups[key].groups["CITransaction"].value 
                      : 0;
                  })
                },
                {
                  label: 'Cash Out',
                  backgroundColor: '#f79393',
                  data: Object.keys(sink.groups).map(key => {
                    return sink.groups[key].groups["COTransaction"] 
                      ? sink.groups[key].groups["COTransaction"].value 
                      : 0;
                  })
                }
              ]
            };
            self.config = config;
          })
      }
    }
  ]
});
