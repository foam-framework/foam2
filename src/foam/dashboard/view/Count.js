foam.CLASS({
  package: 'foam.dashboard.view',
  name: 'Count',
  extends: 'foam.u2.Element',
  imports: [ 'data' ],
  methods: [
    function initE() {
      this.add(this.slot(function(data$data) {
        return this.E().add(data$data.value);
      }));
    }
  ]
});
