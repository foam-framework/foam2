foam.CLASS({
    package: 'foam.nanos.u2.navigation',
    name: 'NavigationView',
    extends: 'foam.u2.View',
     documentation: 'Navigation bars',
     css: `
      ^top-nav {
        width: calc(100% - 200px);
        display: inline;
      }
      ^side-nav {
        float:left;
        display: inline-block;
        width: 200px;
        height: 100%
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