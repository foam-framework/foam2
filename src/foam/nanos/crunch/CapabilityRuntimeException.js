/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'CapabilityRuntimeException',
  implements: [ 'foam.core.ExceptionInterface' ],
  javaExtends: 'foam.nanos.auth.AuthorizationException',

  javaImports: [
    'foam.nanos.crunch.lite.Capable',
    'java.util.Arrays'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(
          `
            public CapabilityRuntimeException(String message) {
              super(message);
            }
          `
        );
      }
    }
  ],

  properties: [
    {
      name: 'capabilities',
      class: 'StringArray'
    },
    {
      name: 'capables',
      class: 'FObjectArray',
      of: 'foam.nanos.crunch.lite.Capable',
    },
    {
      name: 'daoKey',
      class: 'String'
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
    },
    {
      name: 'addCapabilityId',
      args: [
        { name: 'capabilityId', type: 'String' }
      ],
      javaCode: `
        String[] capabilities = getCapabilities();
        capabilities = Arrays.copyOf(capabilities, capabilities.length + 1);
        capabilities[capabilities.length - 1] = capabilityId;
        setCapabilities(capabilities);
      `
    },
    {
      name: 'addCapable',
      args: [
        { name: 'capable', type: 'Capable' }
      ],
      javaCode: `
        Capable[] capables = getCapables();
        capables = Arrays.copyOf(capables, capables.length + 1);
        capables[capables.length - 1] = capable;
        setCapables(capables);
      `
    }
  ]
});