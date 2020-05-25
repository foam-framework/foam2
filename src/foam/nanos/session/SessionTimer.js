/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.session',
  name: 'SessionTimer',
  documentation: `
    The session timer executes the callback once the soft session limit has been reached.
    
    This timer is initialized at ApplicationController, enabled by Controller,
    and it is started/refreshed by SessionClientBox.
  `,

  properties: [
    'timer',
    'onSessionTimeout',
    {
      class: 'Boolean',
      name: 'enable',
      value: false
    }
  ],

  methods: [
    function startTimer(sessionSoftLimit) {
      if ( ! this.enable ) return;

      if ( this.timer !== null ) clearTimeout(this.timer);

      this.timer = setTimeout(this.onSessionTimeout, sessionSoftLimit);
    }
  ]
});
