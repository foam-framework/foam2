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
    'requestLogin',
    'sessionTimer',
    'group'
  ],

  javaImports: [
    'foam.nanos.auth.AuthenticationException'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      name: 'msg',
      type: 'foam.box.Message'
    },
    {
      class: 'FObjectProperty',
      name: 'clientBox',
      type: 'foam.box.Box'
    },
    {
      class: 'Boolean',
      name: 'promptUserToAuthenticate',
      value: true
    }
  ],

  methods: [
    {
      name: 'send',
      code: function send(msg) {
        if (
          this.promptUserToAuthenticate &&
          this.RPCErrorMessage.isInstance(msg.object) &&
          msg.object.data.id === 'foam.nanos.auth.AuthenticationException'
        ) {
          this.requestLogin().then(() => {
            this.clientBox.send(this.msg);
          });
          return;
        }

        // fetch the soft session limit from group, and then start the timer
        if ( this.group && this.group.id !== '' && this.group.softSessionLimit !== 0 ) {
          this.sessionTimer.startTimer(this.group.softSessionLimit);
        }


        this.delegate.send(msg);
      },
      javaCode: `Object object = msg.getObject();
if ( object instanceof RPCErrorMessage && ((RPCErrorMessage) object).getData() instanceof RemoteException &&
    "foam.nanos.auth.AuthenticationException".equals(((RemoteException) ((RPCErrorMessage) object).getData()).getId()) ) {
  // TODO: should this be wrapped in new Thread() ?
  ((Runnable) getX().get("requestLogin")).run();
  getClientBox().send(getMsg());
} else {
  getDelegate().send(msg);
}`
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
    },
    {
      class: 'Boolean',
      name: 'promptUserToAuthenticate',
      value: true
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

        msg.attributes.replyBox.localBox = this.SessionReplyBox.create({
          msg:       msg,
          clientBox: this,
          delegate:  msg.attributes.replyBox.localBox,
          promptUserToAuthenticate: this.promptUserToAuthenticate
        });

        this.delegate.send(msg);
      },
      swiftCode: `
let msg = msg!
msg.attributes[foam_box_SessionClientBox.SESSION_KEY] = sessionID
msg.attributes["replyBox"] = SessionReplyBox_create([
  "msg": msg,
  "clientBox": self,
  "delegate": msg.attributes["replyBox"] as? foam_box_Box,
])
try delegate.send(msg)
      `,
      javaCode: `msg.getAttributes().put(SESSION_KEY, getSessionID());
SessionReplyBox sessionReplyBox = new SessionReplyBox(getX(), msg,
    this, (Box) msg.getAttributes().get("replyBox"));
msg.getAttributes().put("replyBox", sessionReplyBox);
getDelegate().send(msg);`
    }
  ]
});
