foam.CLASS({
  package: 'foam.nanos.u2.navigation',
  name: 'NavigationView',
  extends: 'foam.u2.View',

  documentation: 'Navigation bars',

  css: `
    ^ {
      position: fixed;
      width: 100%;
      z-index: 10001;
    }
    ^top-nav {
      display: inline;
    }
    ^side-nav {
      float:left;
      display: inline-block;
      width: 200px;
      height: 100vh;
    }
  `,

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start()
          .addClass(this.myClass('top-nav'))
          .tag({ class: 'foam.nanos.u2.navigation.TopNavigation' })
        .end()
        .start()
          .addClass(this.myClass('side-nav'))
          .tag({ class: 'foam.nanos.u2.navigation.SideNavigation' })
        .end();
    }
  ]
});