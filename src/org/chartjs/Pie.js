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
      var groups = data.groups;
      var keys = data.sortedKeys();
      this.chart.data = {
        labels: keys,
        datasets: [
          {
            borderColor: colors,
            backgroundColor: colors.map(function(c) {
              return this.Lib.CHART.helpers.color(c).alpha(0.5).rgbString();
            }.bind(this)),
            data: keys.map(function(k) { return groups[k].value; })
          }
        ]
      };

      this.chart.update();
    }
  ]
});
