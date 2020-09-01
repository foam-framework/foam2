/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.crunch.lite',
  name: 'Capable',
  documentation: `
    Capable is an interface for binding capability payloads to an object rather
    than associating them with a user.
  `,

  javaImports: [
    'foam.core.FObject',
    'foam.core.Validator',
    'foam.core.X',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CrunchService',
    'java.util.ArrayList',
    'java.util.HashMap',
    'java.util.HashSet',
    'java.util.List',
    'java.util.Map',
    'java.util.Set',
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.methods.push(foam.java.Method.create({
          name: 'setRequirements',
          type: 'void',
          visibility: 'default',
          args: [
            { name: 'x', type: 'X' },
            { name: 'capabilityIds', type: 'String[]' }
          ],
          body: `
            CrunchService crunchService = (CrunchService) x.get("crunchService");

            setCapablePayloads(
              crunchService.getCapableObjectPayloads(
                x, capabilityIds
              )
            );
          `
        }));
        cls.methods.push(foam.java.Method.create({
          name: 'verifyRequirements',
          type: 'boolean',
          visibility: 'default',
          type: 'void',
          javaThrows: [ 'IllegalStateException' ],
          args: [
            { name: 'x', type: 'X' },
            { name: 'capabilityIds', type: 'String[]' }
          ],
          body: `
            // Marshal payloads into a hashmap
            Map<String, FObject> payloads = new HashMap<String, FObject>();
            for ( CapablePayload payload : getCapablePayloads() ) {
              payloads.put(payload.getCapability().getId(),
                (FObject) payload.getData());
            }

            CrunchService crunchService = (CrunchService) x.get("crunchService");
            List crunchPath = crunchService.getMultipleCapabilityPath(
              x, capabilityIds, false);

            for ( Object obj : crunchPath ) {
              if ( ! (obj instanceof Capability) ) {
                // TODO: Implement logic for sub-lists (MinMaxCapability)
                throw new RuntimeException("TODO");
              }
              Capability cap = (Capability) obj;
              if ( cap.getOf() == null ) continue;

              if ( ! payloads.containsKey(cap.getId()) ) {
                throw new IllegalStateException(String.format(
                  "Missing payload object for capability '%s'",
                  cap.getId()
                ));
              }

              FObject dataObject = payloads.get(cap.getId());
              if ( dataObject instanceof Validator ) {
                Validator validator = (Validator) dataObject;
                validator.validate(x, dataObject);
              }
            }
          `
        }));
      }
    },
  ],

  methods: [
    {
      name: 'getCapablePayloads',
      type: 'CapablePayload[]',
      flags: ['java'],
    },
    {
      name: 'setCapablePayloads',
      flags: ['java'],
      args: [
        {
          name: 'payloads',
          type: 'CapablePayload[]'
        }
      ]
    },
    {
      name: 'getUserCapabilityRequirements',
      flags: ['java'],
      type: 'String[]'
    },
    {
      name: 'setUserCapabilityRequirements',
      flags: ['java'],
      args: [
        {
          name: 'payloads',
          type: 'String[]'
        }
      ]
    }
  ],
});
