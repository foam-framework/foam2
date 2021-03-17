/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'LoginException',
  package: 'foam.nanos.auth',
  extends: 'foam.core.FOAMException',
  javaGenerateDefaultConstructor: false,
  javaGenerateConvenienceConstructor: false,

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
  public LoginException() {
    super("Account locked. Please contact customer service.");
  }

  public LoginException(String message) {
    super(message);
  }

  public LoginException(String message, Exception cause) {
    super(message);
  }

        `);
      }
    }
  ]
});
