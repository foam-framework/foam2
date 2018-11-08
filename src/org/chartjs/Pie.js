foam.CLASS({
  package: 'org.chartjs',
  name: 'Pie',
  extends: 'foam.u2.View',
  requires: [
    'org.chartjs.Lib',
    'org.chartjs.PieConfig',
  ],
  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.sink.GroupBy',
      name: 'data',
      hidden: true,
      postSet: function(_, n) {
        this.onDetach(n.groups$.sub(function(sub) {
          if ( this.data !== n ) sub.detach();
          else this.updateChart();
        }.bind(this)));
        this.updateChart()
      },
    },
    {
      name: 'chart',
    },
    {
      class: 'FObjectProperty',
      of: 'org.chartjs.PieConfig',
      name: 'config',
      factory: function() {
        return this.PieConfig.create();
      },
      postSet: function(_, n) {
        this.onDetach(n.sub(function(sub) {
          if ( this.config !== n ) sub.detach();
          else this.updateChart();
        }.bind(this)));
        this.updateChart()
      },
    },
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
      name: 'loadChart',
      isFramed: true,
      code: function() {
        var canvas = this.el().getElementsByTagName('canvas')[0];
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
        this.chartConfig.datasets[0].backgroundColor = this.config.backgroundColor;
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
    function initE() {
      this.SUPER();
      this.
        style({
          position: 'relative',
          height: this.config$.dot('height'),
          width: this.config$.dot('width'),
        }).
        start('canvas').end();
    },
  ],
});
