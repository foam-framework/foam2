/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.u2.navigation',
  name: 'NavigationView',
  extends: 'foam.u2.View',

  documentation: 'Navigation bars',

  css: `
    ^top-nav {
      width: 100%;
      display: inline;
      z-index: 10001;
      position: fixed;
    }
    ^side-nav {
      float:left;
      display: inline-block;
      width: 200px;
      height: 100vh;
      position: fixed;
      padding-top: 65px;
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
