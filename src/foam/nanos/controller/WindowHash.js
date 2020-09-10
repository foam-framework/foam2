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

      var location = this.window.location;

      this.value$.sub(() => location.hash = this.value);

      this.value = location.hash.substr(1);

      window.onpopstate = () => this.value = location.hash.substr(1);
    }
  ]
});
