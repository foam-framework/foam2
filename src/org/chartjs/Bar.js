foam.CLASS({
  package: 'org.chartjs',
  name: 'Bar',
  extends: 'foam.u2.Element',
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
      name: 'chartConfig',
      factory: function() {
        return {
          type: 'bar',
          datasets: [{}],
          options: {
            scales: {
              yAxes: [{
                ticks: {
                  beginAtZero: true
                }
              }]
            }
          }
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
        this.chart = new Chart(ctx, this.chartConfig);
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
        this.chartConfig.datasets[0].label = this.data.arg2.model_.label; 
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
