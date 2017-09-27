foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'AbstractMenu',

  methods: [
    function launch(X, menu) { X.stack.push(this.createView(X, menu)); }
  ]
});
