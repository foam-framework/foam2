/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'BusinessAssociationException',
  package: 'foam.nanos.auth',
  extends: 'foam.core.ClientRuntimeException',
  javaGenerateDefaultConstructor: false,
  javaGenerateConvenienceConstructor: false,

  javaImports: [
    'foam.core.X'
  ],

  messages: [
    { name: 'BUSINESS_ASSOCIATION_EXCEPTION', message: 'There was an issue associating the business to the user' },
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
  public BusinessAssociationException() {
    super(BUSINESS_ASSOCIATION_EXCEPTION);
  }

  public BusinessAssociationException(X x) {
    super(x, BUSINESS_ASSOCIATION_EXCEPTION);
  }

        `);
      }
    }
  ]
});
