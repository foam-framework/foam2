foam.CLASS({
  package: 'org.chartjs',
  name: 'Line',
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
      name: 'chartConfig',
      factory: function() {
        return {
          type: 'line',
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

        var datasets = this.chartConfig.datasets;
        var i = 0;
        Object.keys(groups).forEach(function(k) {
          var d = datasets[i] || {};
          d.label = k;
          d.data = Object.keys(groups[k].groups).map(function(x) {
            return { x: x, y: groups[k].groups[x].value }
          })
          datasets[i] = d;
          i++;
        });

        var xValues = {};
        Object.keys(groups).forEach(function(k) {
          Object.keys(groups[k].groups).forEach(function(x) {
            xValues[x] = true;
          });
        });
        this.chartConfig.labels = Object.keys(xValues);

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
