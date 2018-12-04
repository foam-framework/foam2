foam.CLASS({
  package: 'foam.dashboard.view',
  name: 'Dashboard',
  extends: 'foam.u2.Element',
  imports: [
    'setInterval',
    'clearInterval'
  ],
  exports: [
    'as dashboardController'
  ],
  requires: [
    'foam.dashboard.model.Count',
    'foam.dashboard.model.GroupBy',
    'foam.dashboard.model.Table',
    'foam.dashboard.model.VisualizationSize'
  ],
  properties: [
    [ 'nodeName', 'div' ],
  ],
  css: `
^ {
  display: flex;
  flex-wrap: wrap;
  align-items: start;
  justify-content: center;
}
`,
  methods: [
    function initE() {
      var timeout = this.setInterval(this.onUpdate, 5000);
      var view = this;

      this.onDetach(function() {
        this.clearInterval(timeout);
      }.bind(this));

      this.
        addClass(this.myClass());
    }
  ],
  listeners: [
    function onUpdate() {
      this.pub('dashboard', 'update');
    }
  ]
});
