/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.INTERFACE({
  refines: 'foam.box.Box',
  methods: [
    {
      name: 'send',
      args: [
        {
          name: 'message',
          javaType: 'foam.box.Message'
        }
      ]
    }
  ]
});

foam.CLASS({
  refines: 'foam.box.SubBox',
  methods: [
    {
      name: 'send',
      javaCode: function() {
/*foam.box.SubBoxMessage subBoxMessage = getX().create(foam.box.SubBoxMessage.class);
subBoxMessage.setName(getName());
subBoxMessage.setObject(message.getObject());
message.setObject(subBoxMessage);
getDelegate().send(message);*/
      }
    }
  ]
});

foam.CLASS({
  refines: 'foam.box.NullBox',
  methods: [
    {
      name: 'send',
      javaCode: 'return;'
    }
  ]
});

foam.CLASS({
  refines: 'foam.box.HTTPReplyBox',
  methods: [
    {
      name: 'send',
      javaCode: `
try {
  javax.servlet.http.HttpServletResponse response = (javax.servlet.http.HttpServletResponse)getX().get("httpResponse");
  response.setContentType("application/json");
  java.io.PrintWriter writer = response.getWriter();
  writer.print(new foam.lib.json.Outputter(foam.lib.json.OutputterMode.NETWORK).stringify(message));
  writer.flush();
} catch(java.io.IOException e) {
  throw new RuntimeException(e);
}
`
    }
  ]
});

foam.CLASS({
  refines: 'foam.box.CheckAuthenticationBox',
  methods: [
    {
      name: 'send',
      javaCode: function() {/*
try {
  String token = (String)message.getAttributes().get("idToken");

  if ( token == null ) {
    throw new java.security.GeneralSecurityException("No ID Token present.");
  }

  String principal = ((com.google.auth.TokenVerifier)getTokenVerifier()).verify(token);

  message.getAttributes().put("principal", principal);

  super.send(message);
} catch ( java.security.GeneralSecurityException e) {
  throw new RuntimeException("Failed to verify token.", e);
}
*/}
    }
  ]
});

foam.CLASS({
  refines: 'foam.box.SessionReplyBox',

  javaImports: [
    'java.security.AccessControlException'
  ],

  properties: [
    {
      class: 'Object',
      name: 'msg',
      javaType: 'foam.box.Message'
    },
    {
      class: 'Object',
      name: 'clientBox',
      javaType: 'foam.box.Box'
    }
  ],

  methods: [
    {
      name: 'send',
      javaCode:
`Object object = message.getObject();
if ( object instanceof RPCErrorMessage && ((RPCErrorMessage) object).getData() instanceof RemoteException &&
    "java.security.AccessControlException".equals(((RemoteException) ((RPCErrorMessage) object).getData()).getId()) ) {
  // TODO: should this be wrapped in new Thread() ?
  ((Runnable) getX().get("requestLogin")).run();
  getClientBox().send(getMsg());
} else {
  getDelegate().send(message);
}`
    }
  ]
});

foam.CLASS({
  refines: 'foam.box.SessionClientBox',

  methods: [
    {
      name: 'send',
      javaCode:
`message.getAttributes().put(SESSION_KEY, getSessionID());
SessionReplyBox sessionReplyBox = new SessionReplyBox(getX(), message,
    this, (Box) message.getAttributes().get("replyBox"));
message.getAttributes().put("replyBox", sessionReplyBox);
getDelegate().send(message);`
    }
  ]
});
