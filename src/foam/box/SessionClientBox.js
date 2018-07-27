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
        var self = this;

        // TODO: if I get an AuthException the call the requestLogin
        // handler then retry once it finishes.
        // console.log('************************* REPLY: ', foam.json.stringify(msg));
        // Exception looks like this:
        // {class:"foam.box.Message",attributes:{},object:{class:"foam.box.RPCErrorMessage",data:{class:"foam.box.RemoteException",id:"java.security.AccessControlException",message:"not logged in"}}}
        if ( this.RPCErrorMessage.isInstance(msg.object) && msg.object.data.id === 'java.security.AccessControlException' ) {
          this.requestLogin().then(function() {
            self.clientBox.send(self.msg);
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
      type: 'String',
      swiftValue: '"sessionId"',
      swiftType: 'String',
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
      swiftExpressionArgs: [ 'sessionName' ],
      swiftExpression: `
let defaults = UserDefaults.standard // TODO allow us to configure?
if let id = defaults.string(forKey: sessionName) {
  return id
}
let id = UUID().uuidString
defaults.set(id, forKey: sessionName)
return id
      `,
      javaFactory:
`String uuid = (String) getX().get(getSessionName());
if ( "".equals(uuid) ) {
  uuid = java.util.UUID.randomUUID().toString();
  getX().put(getSessionName(), uuid);
}
return uuid;`
    }
  ],

  methods: [
    {
      name: 'send',
      code: function send(msg) {
        msg.attributes[this.SESSION_KEY] = this.sessionID;

        // console.log('***** SEND SESSION ID: ', this.sessionID/*foam.json.stringify(msg)*/);

        msg.attributes.replyBox = this.SessionReplyBox.create({
          msg:       msg,
          clientBox: this,
          delegate:  msg.attributes.replyBox
        });

        this.delegate.send(msg);
      },
      swiftCode: `
msg.attributes[foam_box_SessionClientBox.SESSION_KEY] = sessionID
msg.attributes["replyBox"] = SessionReplyBox_create([
  "msg": msg,
  "clientBox": self,
  "delegate": msg.attributes["replyBox"] as? foam_box_Box,
])
try delegate.send(msg)
      `,
    }
  ]
});
