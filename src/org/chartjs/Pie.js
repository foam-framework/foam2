foam.CLASS({
  package: 'org.chartjs',
  name: 'Pie',
  extends: 'org.chartjs.AbstractChartCView',
  properties: [
    [ 'chartType', 'pie' ],
  ],
  methods: [
    function updateChart_(data) {
      var chartData = this.toChartData(data);
      chartData.datasets.forEach(function(d, i) {
        d.backgroundColor = this.colors.map(function(c) {
          return this.Lib.CHART.helpers.color(c).alpha(0.5).rgbString();
        }.bind(this))
        d.borderColor = this.colors
      }.bind(this));
      this.chart.data = chartData;
      this.chart.update();
    }
  ]
});
