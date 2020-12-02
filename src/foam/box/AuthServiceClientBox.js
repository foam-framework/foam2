/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box',
  name: 'AuthServiceClientBox',
  extends: 'foam.box.ProxyBox',

  documentation: 'ClientBox which does not wrap replyBox in SessionReplyBox',

  imports: [ 'sessionID' ],

  constants: [
    {
      name: 'SESSION_KEY',
      value: 'sessionId'
    }
  ],

  methods: [
    {
      name: 'send',
      code: function send(msg) {
        msg.attributes[this.SESSION_KEY] = this.sessionID;
        this.delegate.send(msg);
      }
    }
  ]
});
