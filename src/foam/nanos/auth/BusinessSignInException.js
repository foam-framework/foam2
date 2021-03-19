/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'BusinessSignInException',
  package: 'foam.nanos.auth',
  extends: 'foam.core.ClientRuntimeException',
  javaGenerateDefaultConstructor: false,
  javaGenerateConvenienceConstructor: false,

  messages: [
    {
      name: 'EXCEPTION_MESSAGE',
      message: 'There was an issue signing in to the newly created business, Please go to the switch business menu in your personal menus to sign in to your business.'
    },
  ],


  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
  public BusinessSignInException() {
    super();
  }

  public BusinessSignInException(Exception cause) {
    super(cause);
  }

        `);
      }
    }
  ]
});
