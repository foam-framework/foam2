/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'org.chartjs',
  name: 'ChartCView',
  extends: 'foam.graphics.CView',

  requires: [
    'org.chartjs.Lib',
  ],

  properties: [
    'chart',
    {
      name: 'config',
      factory: function() {
        return {
          type: 'line',
          data: {
            datasets: [{
              label: '# of Votes',
              steppedLine: true,
              data: [
                {
                  x: new Date(),
                  y: 10
                },
                {
                  x: this.addDays(new Date(), 1),
                  y: 13
                },
                {
                  x: this.addDays(new Date(), 2),
                  y: 6
                },
                {
                  x: this.addDays(new Date(), 3),
                  y: 10
                },
                {
                  x: this.addDays(new Date(), 4),
                  y: 12
                }
              ]
            }]
          },
          options: {
            scales: {
              xAxes: [{
                type: 'time',
                distribution: 'linear'
              }]
            }
          }
        }
      }
    },
    ['width', 300],
    ['height', 300],
    // 'config'
  ],

  reactions: [

  ],

  methods: [
    function initCView(x) {
      this.chart = new this.Lib.CHART(x, this.config);
    },
    function paintSelf(x) {
      this.chart.render();
    },

    // TODO: PLACEHOLDER METHOD
    function addDays(prevDate, days) {
      var date = new Date(prevDate.valueOf());
      date.setDate(date.getDate() + days);
      return date;
    }
  ],

  listeners: [

  ]
});
