foam.CLASS({
  package: 'org.chartjs.demos',
  name: 'CustomizePie',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.DetailView',
    'org.chartjs.Pie',
    'org.chartjs.PieConfig',
  ],
  methods: [
    function initE() {
      var config = this.PieConfig.create();
      this.
        start(this.DetailView, { data: config }).end().
        start(this.Pie, { data$: this.data$, config: config }).end();
    },
  ],
});
