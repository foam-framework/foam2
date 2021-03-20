/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'AccountTemporarilyLockedException',
  package: 'foam.nanos.auth',
  extends: 'foam.nanos.auth.AuthenticationException',
  javaGenerateDefaultConstructor: false,
  javaGenerateConvenienceConstructor: false,

  messages: [
    {
      name: 'EXCEPTION_MESSAGE',
      message: 'Account temporarily locked. You can attempt to login after {{message_}}'
    },
  ],

  properties: [
    {
      documentation: 'java message template',
      name: 'javaExceptionMessage',
      class: 'String',
      value: 'Account temporarily locked. You can attempt to login after {{message_}}',
      transient: true
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
  public AccountTemporarilyLockedException() {
    super();
  }

  public AccountTemporarilyLockedException(String message) {
    super(message);
  }

  public AccountTemporarilyLockedException(String message, Exception cause) {
    super(message, cause);
  }
        `);
      }
    }
  ]
});
