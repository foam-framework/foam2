/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.controller',
  name: 'WindowHash',

  imports: [ 'window' ],

  properties: [
    {
      name: 'value'
    }
  ],

  methods: [
    function initArgs(args, ctx) {
      this.SUPER(args, ctx);

      this.value$.sub(this.onValueChange);
      this.onPopState();
      this.window.onpopstate = this.onPopState;
    }
  ],

  listeners: [
    function onPopState() {
      this.value = this.window.location.hash.substr(1);
    },
    {
      name: 'onValueChange',
      isFramed: true,
      code: function() {
        this.window.location.hash = this.value;
      }
    }
  ]
});
