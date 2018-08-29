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

foam.CLASS({
  refines: 'foam.box.SubBox',
  flags: ['java'],
  methods: [
    {
      name: 'send',
      javaCode: function() {
/*foam.box.SubBoxMessage subBoxMessage = getX().create(foam.box.SubBoxMessage.class);
subBoxMessage.setName(getName());
subBoxMessage.setObject(msg.getObject());
msg.setObject(subBoxMessage);
getDelegate().send(msg);*/
      }
    }
  ]
});

foam.CLASS({
  refines: 'foam.box.NullBox',
  flags: ['java'],
  methods: [
    {
      name: 'send',
      javaCode: 'return;'
    }
  ]
});

foam.CLASS({
  refines: 'foam.box.HTTPReplyBox',
  flags: ['java'],
  methods: [
    {
      name: 'send',
      javaCode: `
try {
  javax.servlet.http.HttpServletResponse response = (javax.servlet.http.HttpServletResponse)getX().get("httpResponse");
  response.setContentType("application/json");
  java.io.PrintWriter writer = response.getWriter();
  writer.print(new foam.lib.json.Outputter(foam.lib.json.OutputterMode.NETWORK).stringify(msg));
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
  flags: ['java'],
  methods: [
    {
      name: 'send',
      javaCode: function() {/*
try {
  String token = (String)msg.getAttributes().get("idToken");

  if ( token == null ) {
    throw new java.security.GeneralSecurityException("No ID Token present.");
  }

  String principal = ((com.google.auth.TokenVerifier)getTokenVerifier()).verify(token);

  msg.getAttributes().put("principal", principal);

  super.send(msg);
} catch ( java.security.GeneralSecurityException e) {
  throw new RuntimeException("Failed to verify token.", e);
}
*/}
    }
  ]
});

foam.CLASS({
  refines: 'foam.box.SessionReplyBox',
  flags: ['java'],

  javaImports: [
    'foam.nanos.auth.AuthenticationException'
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
`Object object = msg.getObject();
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
  refines: 'foam.box.SessionClientBox',
  flags: ['java'],

  methods: [
    {
      name: 'send',
      javaCode:
`msg.getAttributes().put(SESSION_KEY, getSessionID());
SessionReplyBox sessionReplyBox = new SessionReplyBox(getX(), msg,
    this, (Box) msg.getAttributes().get("replyBox"));
msg.getAttributes().put("replyBox", sessionReplyBox);
getDelegate().send(msg);`
    }
  ]
});
