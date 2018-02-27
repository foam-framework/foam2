/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'AbstractMenu',
  abstract: true,

  methods: [
    function setMenuId(id) {
      if ( window.location.hash.substr(1) != id ){
        window.location.hash = id;
      }
    },
    function launch(X, menu) {
      this.setMenuId(menu.id);
      X.stack.push(this.createView(X, menu));
    }
  ]
});
