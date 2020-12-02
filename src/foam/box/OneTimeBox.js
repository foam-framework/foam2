/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box',
  name: 'OneTimeBox',
  extends: 'foam.box.ProxyBox',
  methods: [
    {
      name: 'send',
      code: function(msg) {
        this.detach();
        this.SUPER(msg);
      }
    }
  ]
});
