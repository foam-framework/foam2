/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'org.chartjs',
  name: 'Pie',
  extends: 'org.chartjs.AbstractChartCView',
  properties: [
    [ 'chartType', 'pie' ],
    {
      name: 'tooltipLabelFormatter',
      value: function(tooltipItem, data) {
        return data.labels[tooltipItem.index] +
          ': ' + this.yFormatter(data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]);
      }
    },
    {
      name: 'tooltipTitleFormatter',
      value: function(tooltipItem, data) {
        tooltipItem = tooltipItem[0];
        return data.datasets[tooltipItem.datasetIndex].label;
      }
    },
  ],
  methods: [
    function configChart_(chart) {
      delete chart.options.scales;
    },
    function genChartData_(data) {
      var chartData = this.toChartData(data);
      chartData.datasets.forEach(function(d, i) {
        if ( d.data.length && foam.Object.isInstance(d.data[0]) ) {
          d.data = d.data.map(function(d) { return d.y });
        }
        d.backgroundColor = this.colors.map(function(c) {
          return this.Lib.CHART.helpers.color(c).alpha(0.5).rgbString();
        }.bind(this))
        d.borderColor = this.colors
      }.bind(this));

      return chartData;
    }
  ]
});
