foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'SubMenuView',
  extends: 'foam.nanos.menu.PopupMenu',

  properties: [ 'X', 'menu' ],

  methods: [
    function initE() {
      this.addClass(this.myClass());
      var self = this;
      var menu = this.menu;
      var X = this.X;
      menu.children.select({
        put: function(menu) {
          if ( ! menu.handler ) return;
          self.start('div')
            .on('click', function() { self.close(); menu.launch(X); })
            .add(menu.label)
          .end();
        },
        eof: function() {}
      });
    }
  ]
});