foam.CLASS({
  package: 'org.chartjs',
  name: 'Pie',
  extends: 'foam.u2.Element',
  requires: [
    'org.chartjs.Lib',
  ],
  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.sink.GroupBy',
      name: 'data',
      postSet: function(_, n) {
        this.onDetach(n.groups$.sub(function(sub) {
          if ( this.data !== n ) sub.detach();
          else this.updateChart();
        }.bind(this)));
      },
    },
    {
      name: 'nodeName',
      value: 'canvas',
    },
    {
      name: 'chart',
    },
    {
      name: 'backgroundColor',
      value: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
      ],
      postSet: function() { this.updateChart() },
    },
    {
      name: 'chartConfig',
      factory: function() {
        return {
          type: 'pie',
          datasets: [{}],
        }
      },
    },
  ],
  listeners: [
    {
      name: 'loadChart',
      isFramed: true,
      code: function() {
        var canvas = document.getElementById(this.id);
        var ctx = canvas.getContext('2d');
        this.chart = new this.Lib.CHART(ctx, this.chartConfig);
        this.updateChart();
      },
    },
    {
      name: 'updateChart',
      isFramed: true,
      code: function() {
        if ( ! this.chart ) return;
        var groups = this.data.groups;
        var keys = Object.keys(groups);
        this.chartConfig.labels = keys;
        this.chartConfig.datasets[0].backgroundColor = this.backgroundColor;
        this.chartConfig.datasets[0].data = keys.map(function(k) {
          return groups[k].value
        });
        this.chart.data = this.chartConfig;
        this.chart.update();
      },
    },
  ],
  methods: [
    function init() {
      this.onDetach(this.onload.sub(this.loadChart));
      this.SUPER();
    },
  ],
});
