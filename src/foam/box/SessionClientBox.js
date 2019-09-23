/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box',
  name: 'SessionClientBox',
  extends: 'foam.box.ProxyBox',

  documentation: 'Used in conjunction with SessionServerBox to add session support to boxes.',

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
        var existingSessionId = localStorage.getItem(this.sessionName);
        if ( existingSessionId ) return existingSessionId;
        var newSessionId = foam.uuid.randomGUID();
        localStorage.setItem(this.sessionName, newSessionId);
        return newSessionId;
      },
      postSet: function(oldValue, newValue) {
        localStorage.setItem(this.sessionName, newValue);
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
      javaFactory: `
        String uuid = (String) getX().get(getSessionName());
        if ( "".equals(uuid) ) {
          uuid = java.util.UUID.randomUUID().toString();
          getX().put(getSessionName(), uuid);
        }
        return uuid;
      `,
      javaPostSet: `
        setX(getX().put(getSessionName(), getSessionID()));
      `
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
        msg.attributes[this.SESSION_KEY] = this.sessionID;

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
      javaCode: `
        msg.getAttributes().put(SESSION_KEY, getSessionID());
        SessionReplyBox sessionReplyBox = new SessionReplyBox.Builder(getX())
          .setMsg(msg)
          .setClientBox(this)
          .setPromptUserToAuthenticate(this.getPromptUserToAuthenticate())
          .setDelegate((Box) msg.getAttributes().get("replyBox"))
          .build();
        msg.getAttributes().put("replyBox", sessionReplyBox);
        getDelegate().send(msg);
      `
    }
  ]
});
