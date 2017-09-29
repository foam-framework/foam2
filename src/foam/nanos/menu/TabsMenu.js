foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'TabsMenu',
  extends: 'foam.nanos.menu.AbstractMenu',

  requires: [ 'foam.u2.Tabs' ],

  methods: [
    function createView(X, menu) {
      var tabs = this.Tabs.create(undefined, X);

      X.stack.push(tabs);

      menu.children.select({
        put: function(menu) {
          tabs.start({class: 'foam.u2.Tab', label: menu.label}).call(function() {
            if ( menu.handler ) {
              this.tag((menu.handler && menu.handler.createView(X, menu)));
            } else {
              this.add('Coming Soon!');
            }
          }).end();
        },
        eof: function() {}
      });

      return tabs;
    }
  ]
});