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
  css: `
^ {
  border: 2px solid #dae1e9;
  border-radius: 2px;
  background: white;
}

^header {
  padding: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid #ccc;
  font-weight: bold;
}
`,
  methods: [
    function initE() {
      this.onDetach(this.dashboardController.sub('dashboard', 'update', function() {
        this.data.update();
      }.bind(this)));
      this.data.update();

      this.
        addClass(this.myClass()).
        start('div').
        addClass(this.myClass('header')).
        add(this.data.label$).
        add(this.data.CURRENT_VIEW).
        end('div').
        tag(this.slot(function(data$currentView) {
          return foam.u2.ViewSpec.createView(data$currentView, null, this, this.__subSubContext__);
        }));
//        tag(this.SimpleAltView, {
//          choices$: this.dot('data').dot('views'),
//        });
    }
  ]
});
