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
    },
    {
      name: 'feedback_'
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
      if ( this.feedback_ ) return;
      
      this.feedback_ = true;
      this.value = this.window.location.hash.substr(1);
      this.feedback_ = false;
    },
    {
      name: 'onValueChange',
      isFramed: true,
      code: function() {
        if ( this.feedback_ ) return;

        this.feedback_ = true;
        this.window.location.hash = this.value;
        this.feedback_ = false;
      }
    }
  ]
});
