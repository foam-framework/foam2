foam.CLASS({
  package: 'foam.dashboard.view',
  name: 'Count',
  extends: 'foam.u2.Element',
  imports: [ 'data' ],
  properties: [
    [ 'nodeName', 'div' ]
  ],
  css: `
^ {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: xx-large;
}
`,
  methods: [
    function initE() {
      var view = this;

      this.
        addClass(this.myClass()).
        add(this.slot(function(data$data) {
          return this.E('span').
            add(data$data.value);
        }));
    }
  ]
});
