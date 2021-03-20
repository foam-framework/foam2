/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'UserNotFoundException',
  package: 'foam.nanos.auth',
  extends: 'foam.nanos.auth.AuthenticationException',
  javaGenerateDefaultConstructor: false,
  javaGenerateConvenienceConstructor: false,

  messages: [
    {
      name: 'EXCEPTION_MESSAGE',
      message: 'User not found {{message_}}'
    }
  ],

  properties: [
    {
      documentation: 'java message template',
      name: 'javaExceptionMessage',
      class: 'String',
      value: 'Not logged in {{message_}}',
      transient: true
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
  public UserNotFoundException() {
    super();
  }

  public UserNotFoundException(String message) {
    super(message);
  }

  public UserNotFoundException(Throwable cause) {
    super(cause);
  }

  public UserNotFoundException(String message, Throwable cause) {
    super(message, cause);
  }
        `);
      }
    }
  ]
});
