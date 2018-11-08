foam.CLASS({
  package: 'foam.dashboard.view',
  name: 'Pie',
  extends: 'foam.u2.Element',
  imports: [ 'data' ],
  requires: [
    'org.chartjs.Pie'
  ],
  methods: [
    function initE() {
      this.add(this.slot(function(data$data, data$chartConfig) {
        return this.Pie.create({
          data: data$data,
          config: data$chartConfig,
        });
      }));
    }
  ]
});
