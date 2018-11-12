foam.CLASS({
  package: 'org.chartjs',
  name: 'Pie',
  extends: 'org.chartjs.AbstractChartCView',
  properties: [
    [ 'chartType', 'pie' ],
  ],
  methods: [
    function updateChart_(data) {
      var groups = data.groups;
      var keys = data.sortedKeys();
      this.chart.data = {
        labels: keys,
        datasets: [
          {
            data: keys.map(function(k) { return groups[k].value; })
          }
        ]
      };

      this.chart.update();
    }
  ]
});
