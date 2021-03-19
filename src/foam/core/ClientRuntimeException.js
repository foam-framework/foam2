/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'ClientRuntimeException',
  package: 'foam.core',
  extends: 'foam.core.FOAMException',
  implements: [ 'foam.core.ExceptionInterface' ],
  javaGenerateConvenienceConstructor: false,
  javaGenerateDefaultConstructor: false,

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(
          `
  public ClientRuntimeException() {
    super();
  }

  public ClientRuntimeException(String message) {
    super(message);
  }

  public ClientRuntimeException(Throwable cause) {
    super(cause);
  }

  public ClientRuntimeException(String message, Throwable cause ) {
    super(message, cause);
  }
          `
        );
      }
    }
  ],

  methods: [
    {
      // TODO: cloning this property from ExceptionInterface creates a bug.
      name: 'getClientRethrowException',
      documentation: 
      `If an exception is intended to go to the client, this
        returns an exception object; it returns null otherwise.`,
      type: 'RuntimeException',
      visibility: 'public',
      javaCode: `return this;`
    }
  ]
});
