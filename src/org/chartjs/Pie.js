foam.CLASS({
  package: 'org.chartjs',
  name: 'Pie',
  extends: 'org.chartjs.AbstractChartCView',
  properties: [
    [ 'chartType', 'pie' ],
  ],
  methods: [
    function updateChart_(data) {
      var colors = this.colors;
      var groups = this.data.groups;
      var keys = this.data.sortedKeys();
      var data = {
        labels: keys,
        datasets: [
          {
            backgroundColor: colors,
            data: keys.map(function(k) { return groups[k].value; })
          }
        ]
      };
      this.chart.data = data;
      this.chart.update();
    }
  ]
});
