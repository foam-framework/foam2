foam.CLASS({
  package: 'foam.dashboard.view',
  name: 'Card',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.view.SimpleAltView'
  ],
  imports: [
    'dashboardController'
  ],
  methods: [
    function initE() {
      this.onDetach(this.dashboardController.sub('dashboard', 'update', function() {
        this.data.update();
      }.bind(this)));
      this.data.update();

      this.
        tag(this.SimpleAltView, {
          choices$: this.dot('data').dot('views'),
        });
    }
  ]
});
