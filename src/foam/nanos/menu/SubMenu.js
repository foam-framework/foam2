foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'SubMenu',
  extends: 'foam.nanos.menu.AbstractMenu',

  requires: [ 'foam.nanos.menu.PopupMenu' ],

  methods: [
    function createView(X, menu) {
      return this.SubMenuView.create({menu: menu}, X);
    },

    function launch(X, menu) {
      var view = this.createView(X, menu);
      view.open();
    }
  ]
});