/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.session',
  name: 'SessionTimer',

  properties: [
    'timer', 'onSessionTimeout',
    {
      class: 'Boolean',
      name: 'enable',
      value: false
    }
  ],

  methods: [
    function startTimer ( sessionSoftLimit ) {

      if ( ! this.enable ) {
        return;
      }

      if ( this.timer !== null ) {
        clearTimeout(this.timer);
        this.timer = null;
      }

      this.timer = setTimeout(this.onSessionTimeout, sessionSoftLimit )
    }
  ]
});
