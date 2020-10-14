/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'ClientRuntimeException',
  package: 'foam.core',
  implements: [ 'foam.core.ExceptionInterface' ],
  javaExtends: 'RuntimeException',

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(
          `
            public ClientRuntimeException(String message) {
              super(message);
            }

            public ClientRuntimeException(Throwable cause) {
              super(cause);
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
        returns an exception object; it returns null otherwise.

        Note that the exception returned by this property is the
        one that should be re-thrown. This is particularly useful
        for CompoundException where the CompoundException itself
        is not intended to be re-thrown but any of its child
        exceptions might be.`,
        type: 'RuntimeException',
        visibility: 'public',
        javaCode: `return this;`
    }
  ]
})
