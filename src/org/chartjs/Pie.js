foam.CLASS({
  package: 'org.chartjs',
  name: 'Pie',
  extends: 'org.chartjs.AbstractChart',
  properties: [
    {
      name: 'chartConfig',
      factory: function(config) {
        return {
          type: 'pie',
          datasets: [{}],
          options: {
            maintainAspectRatio: false,
          },
        }
      },
    },
  ],
  listeners: [
    {
      name: 'updateChart',
      isFramed: true,
      code: function() {
        if ( ! this.chart ) return;
        var groups = this.data.groups;
        var keys = Object.keys(groups);
        this.chartConfig.labels = keys;
        this.chartConfig.datasets[0].backgroundColor = this.config.colors;
        this.chartConfig.datasets[0].data = keys.map(function(k) {
          return groups[k].value
        });
        this.chart.data = this.chartConfig;
        this.chart.update();
      },
    },
  ],
});
