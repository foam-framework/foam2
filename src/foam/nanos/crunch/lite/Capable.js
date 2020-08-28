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
            List<CapablePayload> payloads = new ArrayList<>();

            CrunchService crunchService = (CrunchService) x.get("crunchService");
            List crunchPath = crunchService.getMultipleCapabilityPath(
              x, capabilityIds, false);

            for ( Object obj : crunchPath ) {
              if ( ! (obj instanceof Capability) ) {
                // Lists correspond to capabilityIds with their own prerequisite
                // logic, such as MinMaxCapability. Clients will need to be
                // made aware of these capabilities separately.
                if ( obj instanceof List ) {
                  List list = (List) obj;

                  // Add payload object prerequisites
                  List prereqs = new ArrayList();
                  for ( int i = 0 ; i < list.size() - 1 ; i++ ) {
                    Capability prereqCap = (Capability) list.get(i);
                    list.add(new CapablePayload.Builder(x)
                      .setCapability(prereqCap)
                      .build());
                  }

                  // Add payload object
                  /* TODO: Figure out why this is an error when adding
                           support for MinMaxCapability
                  Capability cap = (Capability) list.get(list.size() - 1);
                  payloads.add(new CapablePayload.Builder(x)
                    .setCapability(cap)
                    .setPrerequisites(prereqs.toArray(
                      new CapablePayload[list.size()]))
                    .build());
                  */
                  continue;
                }

                throw new RuntimeException(
                  "Expected capability or list");
              }
              Capability cap = (Capability) obj;
              payloads.add(new CapablePayload.Builder(x)
                .setCapability(cap)
                .build());
            }
            
            // Re-FObjectArray
            setCapablePayloads(payloads.toArray(
              new CapablePayload[payloads.size()]
            ));
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
