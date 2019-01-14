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

  constants: [
    {
      name: 'SESSION_KEY',
      value: 'sessionId'
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'sessionName',
      value: 'defaultSession'
    },
    {
      class: 'String',
      name: 'sessionID',
      factory: function() {
        return localStorage[this.sessionName] ||
            ( localStorage[this.sessionName] = foam.uuid.randomGUID() );
      }
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
