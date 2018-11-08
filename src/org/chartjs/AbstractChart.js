foam.CLASS({
  package: 'org.chartjs',
  name: 'AbstractChart',
  extends: 'foam.u2.View',
  requires: [
    'org.chartjs.Lib',
    'org.chartjs.ChartConfig',
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
      of: 'org.chartjs.ChartConfig',
      name: 'config',
      factory: function() {
        return this.ChartConfig.create();
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
        throw new Error('AbstractChart chartConfig encountered');
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
      code: function() {
        throw new Error('Must implement updateChart');
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
