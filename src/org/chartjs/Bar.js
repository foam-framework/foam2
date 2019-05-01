/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'org.chartjs',
  name: 'Bar',
  extends: 'org.chartjs.AbstractChartCView',
  properties: [
    [ 'chartType', 'bar' ]
  ],
  methods: [
    function configChart_(chart) {
      chart.options.scales.yAxes[0].ticks.beginAtZero =  true;
    },
    function genChartData_(data) {
      var chartData = this.toChartData(data);
      chartData.datasets.forEach(function(d, i) {
        d.backgroundColor = this.Lib.CHART.helpers.color(this.colors[i]).alpha(0.5).rgbString()
        d.borderColor = this.colors[i]
        d.borderWidth = 2
      }.bind(this));
      return chartData;
    }
  ]
});
