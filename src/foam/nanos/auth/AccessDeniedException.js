/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'AccessDeniedException',
  package: 'foam.nanos.auth',
  extends: 'foam.nanos.auth.AuthenticationException',
  javaGenerateDefaultConstructor: false,
  javaGenerateConvenienceConstructor: false,

  messages: [
    {
      name: 'EXCEPTION_MESSAGE',
      value: 'Access denied'
    }
  ],

  properties: [
    {
      documentation: 'java message template',
      name: 'javaExceptionMessage',
      class: 'String',
      value: 'Access denied',
      transient: true
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
  public AccessDeniedException() {
    super();
  }

  public AccessDeniedException(Throwable cause) {
    super(cause);
  }
        `);
      }
    }
  ]
});
