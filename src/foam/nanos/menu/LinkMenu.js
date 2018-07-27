/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'LinkMenu',
  extends: 'foam.nanos.menu.AbstractMenu',

  imports: [ 'window' ],

  documentation: 'A menu item which links to an external URL.',

  properties: [
    {
      class: 'URL',
      name: 'link'
    }
  ],

  methods: [
    function launch(X, menu) {
      this.window.location = this.link;
    }
  ]
});
