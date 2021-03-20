/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'AccountLockedException',
  package: 'foam.nanos.auth',
  extends: 'foam.nanos.auth.AuthenticationException',
  javaGenerateDefaultConstructor: false,
  javaGenerateConvenienceConstructor: false,

  messages: [
    {
      name: 'EXCEPTION_MESSAGE',
      message: 'Account locked. Please contact customer service.'
    },
  ],

  properties: [
    {
      documentation: 'java message template',
      name: 'javaExceptionMessage',
      class: 'String',
      value: 'Account locked. Please contact customer service.',
      transient: true
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
  public AccountLockedException() {
    super();
  }

  public AccountLockedException(Exception cause) {
    super(cause);
  }

        `);
      }
    }
  ]
});
