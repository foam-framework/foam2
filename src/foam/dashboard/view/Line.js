foam.CLASS({
  package: 'foam.dashboard.view',
  name: 'Line',
  extends: 'foam.u2.Element',
  imports: [ 'data' ],
  requires: [
    'org.chartjs.Line'
  ],
  methods: [
    function initE() {
      this.add(this.slot(function(data$data) {
        return this.Line.create({ data: data$data });
      }));
    }
  ]
});
