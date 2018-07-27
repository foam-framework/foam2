/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'ListMenu',
  extends: 'foam.nanos.menu.AbstractMenu',

  requires: [ 'foam.u2.Element' ],

  methods: [
    function createView(X, menu) {
      var e = this.Element.create(undefined, X);

      X.stack.push(e);

      menu.children.select({
        put: function(menu) {
          if ( menu.handler ) {
            e.tag(menu.handler.createView(X, menu));
          } else {
            e.add('Coming Soon!');
          }
        },
        eof: function() {}
      });

      return e;
    }
  ]
});
