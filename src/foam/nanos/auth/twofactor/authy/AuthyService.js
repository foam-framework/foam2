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
      name: 'apiKey'
    },
    {
      class: 'String',
      name: 'apiHost'
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
Params params = new Params();
params.setAttribute("locale", "en");
Verification verification = phoneVerification.start(user.getPhone(), "1", "sms", params);
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
Verification verification = phoneVerification.check(user.getPhone(), "1", token);
return verification.isOk();`
    },
    {
      name: 'start',
      javaReturns: 'void',
      javaCode: `setClient(new AuthyApiClient(getApiKey(), getApiHost(), getDebug()));`
    }
  ]
});