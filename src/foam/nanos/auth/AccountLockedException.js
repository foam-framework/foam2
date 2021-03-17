/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'AccountLockedException',
  package: 'foam.nanos.auth',
  extends: 'foam.core.FOAMException',
  javaGenerateDefaultConstructor: false,
  javaGenerateConvenienceConstructor: false,

  messages: [
    { name: 'ACCOUNT_LOCK', message: 'Account locked. Please contact customer service.' },
  ],


  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
  public AccountLockedException() {
    super(ACCOUNT_LOCK);
  }

  public AccountLockedException(String message) {
    super(message);
  }

  public AccountLockedException(String message, Exception cause) {
    super(message);
  }

        `);
      }
    }
  ]
});
