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
      javaCode: function() {/*
getDelegate().send(message.setObject(
    getX().create(foam.box.SubBoxMessage.class)
        .setName(getName())
        .setObject(message.getObject())));
*/}
    }
  ]
});

foam.CLASS({
  refines: 'foam.box.BoxRegistry',
  properties: [
    {
      name: 'registry',
      javaInfoType: 'foam.core.AbstractObjectPropertyInfo',
      javaType: 'java.util.Map',
      javaFactory: 'return getX().create(java.util.HashMap.class);'
    }
  ],

  methods: [
    {
      name: 'doLookup',
      javaReturns: 'foam.box.Box',
      args: [
        {
          name: 'name',
          javaType: 'String'
        }
      ],
      javaCode: 'Registration r = (Registration)getRegistry().get(name);\n'
                + 'if ( r == null ) return null;\n'
                + 'return r.getExportBox();'
    },
    {
      name: 'register',
      javaReturns: 'foam.box.Box',
      args: [
        {
          name: 'name',
          javaType: 'String'
        },
        {
          name: 'service',
          javaType: 'Object'
        },
        {
          name: 'box',
          javaType: 'foam.box.Box'
        }
      ],
      javaCode: 'foam.box.Box exportBox = getX().create(foam.box.SubBox.class).setName(name).setDelegate((foam.box.Box)getMe());\n'
                + '// TODO(adamvy): Apply service policy\n'
                + 'getRegistry().put(name, getX().create(Registration.class).setExportBox(exportBox).setLocalBox(box));\n'
                + 'return exportBox;'
    },
    {
      name: 'unregister',
      args: [
        {
          name: 'name',
          javaType: 'String'
        }
      ],
      javaCode: 'getRegistry().remove(name);'
    }
  ]
});


foam.CLASS({
  refines: 'foam.box.BoxRegistryBox',
  methods: [
    {
      name: 'send',
      javaCode: function() {/*
if ( message.getObject() instanceof foam.box.SubBoxMessage ) {
  foam.box.SubBoxMessage subBoxMessage = (foam.box.SubBoxMessage)message.getObject();
  message.setObject(subBoxMessage.getObject());
  ((Registration)getRegistry().get(subBoxMessage.getName())).getLocalBox().send(message);
} else {
  throw new RuntimeException("Invalid message type " + message.getClass().getName());
}
*/}
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
      javaCode: 'try {\n'
              + '  java.io.PrintWriter writer = ((javax.servlet.ServletResponse)getX().get("httpResponse")).getWriter();\n'
              + '  writer.print(new foam.lib.json.Outputter().stringify(message));\n'
              + '  writer.flush();\n'
              + '} catch(java.io.IOException e) {\n'
              + '  throw new RuntimeException(e);\n'
              + '}'
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
