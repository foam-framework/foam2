/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.core',
  name: 'ExceptionInterface',
  documentation: `
    Undesirable temporary exception interface; it is not currently
    possible to add properties to foam.core.Exception without
    updating every implementor. This can be avoided if interface
    properties are added to models in Java code generation.
  `,

  methods: [
    {
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
      visibility: 'public'
    }
  ]
});