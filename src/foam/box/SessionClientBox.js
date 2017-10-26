/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box',
  name: 'SessionReplyBox',
  extends: 'foam.box.ProxyBox',

  imports: [
    // 'requestLogin'
  ],

  properties: [
    'msg',
    'clientBox'
  ],

  methods: [
    {
      name: 'send',
      code: function send(msg) {
        // TODO: if I get an AuthException the call the requestLogin
        // handler then retry once it finishes.
        console.log('***** REPLY: ', foam.json.stringify(msg));
        this.delegate.send(msg);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'SessionClientBox',
  extends: 'foam.box.ProxyBox',

  implements: [ 'foam.box.Box' ],

  requires: [ 'foam.box.SessionReplyBox' ],

  imports: [
    // 'requestLogin'
  ],

  constants: {
    SESSION_KEY: 'sessionId'
  },

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

        console.log('***** SEND SESSION ID: ', this.sessionID/*foam.json.stringify(msg)*/);

        /*
        msg.attributes.replyBox = this.SessionReplyBox.create({
          msg: msg,
          clientBox: this,
          delegate: msg.attributes.replyBox
        });
        */

        this.delegate.send(msg);
      }
    }
  ]
});
