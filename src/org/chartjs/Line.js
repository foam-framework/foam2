/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'org.chartjs',
  name: 'Line',
  extends: 'org.chartjs.AbstractChartCView',
  properties: [
    ['chartType', 'line'],
  ],
  methods: [
    function genChartData_(data) {
      var chartData = this.toChartData(data);
      chartData.datasets.forEach(function(d, i) {
        d.backgroundColor = this.colors[i]
        d.borderColor = this.colors[i]
        d.fill = false
        d.spanGaps = true
      }.bind(this));
      return chartData;
    }
  ]
});
