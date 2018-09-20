/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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
  package: 'foam.box',
  name: 'CheckAuthenticationBox',
  extends: 'foam.box.ProxyBox',

  imports: [
    'tokenVerifier'
  ],

  methods: [
    {
      name: 'send',
      code: function send() {
        throw new Error('Unimplemented.');
      },
      javaCode: `try {
  String token = (String)msg.getAttributes().get("idToken");

  if ( token == null ) {
    throw new java.security.GeneralSecurityException("No ID Token present.");
  }

  String principal = ((com.google.auth.TokenVerifier)getTokenVerifier()).verify(token);

  msg.getAttributes().put("principal", principal);

  super.send(msg);
} catch ( java.security.GeneralSecurityException e) {
  throw new RuntimeException("Failed to verify token.", e);
}`
    }
  ]
});
