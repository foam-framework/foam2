foam.CLASS({
  package: 'org.chartjs',
  name: 'Line',
  extends: 'org.chartjs.AbstractChartCView',
  properties: [
    ['chartType', 'line'],
  ],
  methods: [
    function updateChart_(data) {
      var chartData = this.toChartData(data);
      chartData.datasets.forEach(function(d, i) {
        d.backgroundColor = this.colors[i]
        d.borderColor = this.colors[i]
        d.fill = false
        d.spanGaps = true
      }.bind(this));
      this.chart.data = chartData;
      this.chart.update();
    }
  ]
});
