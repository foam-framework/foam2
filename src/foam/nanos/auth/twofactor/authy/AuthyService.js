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
  package: 'foam.nanos.auth.twofactor.authy',
  name: 'AuthyService',

  documentation: 'Implementation of 2FA using Authy',

  implements: [
    'foam.nanos.NanoService'
  ],

  javaImports: [
    'com.authy.AuthyApiClient',
    'com.authy.api.Params',
    'com.authy.api.PhoneVerification',
    'com.authy.api.Verification'
  ],

  properties: [
    {
      class: 'Object',
      name: 'client',
      javaType: 'com.authy.AuthyApiClient',
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'debug'
    },
    {
      class: 'String',
      name: 'apiHost'
    },
    {
      class: 'String',
      name: 'apiKey'
    }
  ],

  methods: [
    {
      name: 'sendToken',
      javaReturns: 'boolean',
      args: [
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User'
        }
      ],
      javaCode:
`AuthyApiClient client = getClient();
if ( client == null )
  return false;

PhoneVerification phoneVerification = client.getPhoneVerification();
// TODO: Remove hardcoded country code of 1
Verification verification = phoneVerification.start(user.getPhone().getNumber(), "1", "sms", new Params());
return verification.isOk();`
    },
    {
      name: 'verifyToken',
      javaReturns: 'boolean',
      args: [
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User'
        },
        {
          name: 'token',
          javaType: 'String'
        }
      ],
      javaCode:
`AuthyApiClient client = getClient();
if ( client == null )
  return false;

PhoneVerification phoneVerification = client.getPhoneVerification();
// TODO: Remove hardcoded country code of 1
Verification verification = phoneVerification.check(user.getPhone().getNumber(), "1", token);
return verification.isOk();`
    },
    {
      name: 'start',
      javaReturns: 'void',
      javaCode: `setClient(new AuthyApiClient(getApiKey(), getApiHost(), getDebug()));`
    }
  ]
});
