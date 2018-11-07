foam.CLASS({
  package: 'foam.nanos.u2.navigation',
  name: 'NavigationView',
  extends: 'foam.u2.View',

  documentation: 'Navigation bars',

  css: `
    ^ {
      z-index: 10001;
    }
    ^top-nav {
      width: 100%;
      display: inline;
      z-index: 10003;
    }
    ^side-nav {
      position: relative;
      float:left;
      display: inline-block;
      width: 200px;
      height: 100vh;
      z-index: 10002;
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