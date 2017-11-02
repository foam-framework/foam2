/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box',
  name: 'SessionReplyBox',
  extends: 'foam.box.ProxyBox',

  requires: [
    'foam.box.RPCErrorMessage'
  ],

  imports: [
    'requestLogin'
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
        console.log('************************* REPLY: ', foam.json.stringify(msg));
        // Exception looks like this:
        // {class:"foam.box.Message",attributes:{},object:{class:"foam.box.RPCErrorMessage",data:{class:"foam.box.RemoteException",id:"java.security.AccessControlException",message:"not logged in"}}}
        if ( this.RPCErrorMessage.isInstance(msg.object) && msg.object.data.id === "java.security.AccessControlException" ) {
          this.requestLogin().then(function() {
            console.log('***** LOGGED IN');
            this.clientBox.send(this.msg);
          });
        } else {
          this.delegate.send(msg);
        }
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'SessionClientBox',
  extends: 'foam.box.ProxyBox',

  requires: [ 'foam.box.SessionReplyBox' ],

  constants: [
    {
      name: 'SESSION_KEY',
      value: 'sessionId',
      type: 'String'
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
      },
      javaFactory:
`String uuid = (String) getX().get(getSessionName());
if ( "".equals(uuid) ) {
  uuid = java.util.UUID.randomUUID().toString();
  getX().put(getSessionName(), uuid);
}
return uuid;`,
      swiftFactory:
`var uuid: String = String(sessionName)
if uuid == "" {
  uuid = UUID().uuidString
  //X.put(sessionName, uuid)
}
return uuid`
    }
  ],

  methods: [
    {
      name: 'send',
      code: function send(msg) {
        msg.attributes[this.SESSION_KEY] = this.sessionID;

        console.log('***** SEND SESSION ID: ', this.sessionID/*foam.json.stringify(msg)*/);

        msg.attributes.replyBox = this.SessionReplyBox.create({
          msg: msg,
          clientBox: this,
          delegate: msg.attributes.replyBox
        });

        this.delegate.send(msg);
      }
    }
  ]
});
