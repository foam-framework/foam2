/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'ScriptMenu',
  extends: 'foam.nanos.menu.AbstractMenu',
  documentation: 'Menu item that runs a script.',

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.script.Script',
      name: 'script'
    }
  ],

  methods: [
    function launch(X, menu) {
      this.script$find.then(function(s) {
        s.run();
      });
    }
  ]
});
