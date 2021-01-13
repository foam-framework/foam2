/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'InvalidPasswordException',
  package: 'foam.nanos.auth',
  extends: 'foam.nanos.auth.AuthenticationException',
  javaGenerateDefaultConstructor: false,
  javaGenerateConvenienceConstructor: false,

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
  public InvalidPasswordException() {
    super("Invalid password");
  }

  public InvalidPasswordException(String message) {
    super(message);
  }

  public InvalidPasswordException(Throwable cause) {
    super("Invalid password", cause);
  }

  public InvalidPasswordException(String message, Throwable cause) {
    super(message, cause);
  }
        `);
      }
    }
  ]
});
