/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'ViewMenu',
  extends: 'foam.nanos.menu.AbstractMenu',

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'view'
    }
  ],

  methods: [
    function createView(X) { return this.view.clone ? this.view.clone() : this.view; }
  ]
});
