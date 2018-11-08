foam.CLASS({
  package: 'foam.dashboard.view',
  name: 'Bar',
  extends: 'foam.u2.Element',
  imports: [ 'data' ],
  requires: [
    'org.chartjs.Bar'
  ],
  methods: [
    function initE() {
      this.add(this.slot(function(data$data, data$chartConfig) {
        return this.Bar.create({
          data: data$data,
          config: data$chartConfig,
        });
      }));
    }
  ]
});
