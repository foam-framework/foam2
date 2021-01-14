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

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
  public AccessDeniedException() {
    super("Access denied");
  }

  public AccessDeniedException(String message) {
    super(message);
  }

  public AccessDeniedException(Throwable cause) {
    super("Access denied", cause);
  }

  public AccessDeniedException(String message, Throwable cause) {
    super(message, cause);
  }
        `);
      }
    }
  ]
});
