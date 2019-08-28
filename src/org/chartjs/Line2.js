/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'org.chartjs',
  name: 'Line2',
  extends: 'foam.graphics.CView',
  requires: [
    'org.chartjs.Lib',
  ],
  properties: [
    'chart',
    {
      name: 'data',
      factory: function() {
        return {
          datasets: []
        };
      },
      postSet: function() {
        this.update();
      }
    },
    {
      name: 'xAxis',
      postSet: function(_, v) {
        if ( this.chart ) {
          this.chart.options.scales.xAxes = [v];
        }
      }
    },
    {
      name: 'config',
      factory: function() {
        return {
          type: 'line',
          data: this.data,
          options: {
            responsive: false,
            maintainAspectRatio: false,
            scales: {
              xAxes: this.xAxis ? [ this.xAxis ] : []
            }
          }
        };
      }
    }
  ],
  reactions: [
    ['', 'propertyChange.data', 'update' ],
  ],
  methods: [
    function initCView(x) {
      this.chart = new this.Lib.CHART(x, this.config);
      this.update();
    },
    function paintSelf(x) {
      this.chart.render();
    }
  ],
  listeners: [
    {
      name: 'update',
      isFramed: true,
      code: function() {
        if ( ! this.chart ) return;

        this.chart.data = this.data;
        this.chart.update();
      }
    }
  ]
});
