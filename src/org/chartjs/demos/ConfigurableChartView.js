foam.CLASS({
  package: 'org.chartjs.demos',
  name: 'ConfigurableChartView',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.DetailView',
    'org.chartjs.Pie',
    'org.chartjs.ChartConfig',
  ],
  imports: [
    'classloader',
  ],
  properties: [
    'view',
  ],
  methods: [
    function initE() {
      var config = this.ChartConfig.create();
      this.
        start(this.DetailView, { data: config }).end().
        add(this.classloader.load(this.view).then(function(cls) {
          return this.E().
            start(cls, {
              data$: this.data$,
              config: config
            }).
            end();
        }.bind(this)))
    },
  ],
});
