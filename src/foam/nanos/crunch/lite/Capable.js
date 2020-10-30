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

  requires: [
    'foam.nanos.crunch.lite.CapableAdapterDAO'
  ],

  javaImports: [
    'foam.core.Validator',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.ruler.RulerDAO',

    'java.util.ArrayList',
    'java.util.Arrays',
    'java.util.HashMap',
    'java.util.HashSet',
    'java.util.List',
    'java.util.Map',
    'java.util.Set',

    'org.apache.commons.lang.ArrayUtils',

    'static foam.nanos.crunch.CapabilityJunctionStatus.*'
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
          name: 'addRequirement',
          type: 'void',
          visibility: 'default',
          args: [
            { name: 'x', type: 'X' },
            { name: 'capabilityId', type: 'String' }
          ],
          body: `
          CrunchService crunchService = (CrunchService) x.get("crunchService");

          var oldCapabilityPayloads = getCapablePayloads();
          
          if ( ! hasRequirement(x, capabilityId) ) {
            var newCapabilityPayload = crunchService.getCapableObjectPayloads(x, new String[] { capabilityId });
            setCapablePayloads((CapablePayload[]) ArrayUtils.addAll(oldCapabilityPayloads, newCapabilityPayload));
          }
          `
        }));
        cls.methods.push(foam.java.Method.create({
          name: 'hasRequirement',
          documentation: 'Checks if the capble opbject has a capability, does not verify it',
          type: 'Boolean',
          visibility: 'default',
          args: [
            { name: 'x', type: 'X' },
            { name: 'capabilityId', type: 'String' }
          ],
          body: `
          var oldCapabilityPayloads = getCapablePayloads();
          
          return Arrays.stream(oldCapabilityPayloads)
            .map((cap) -> cap.getCapability())
            .anyMatch(capabilityId::equals);
          `
        }));
        cls.methods.push(foam.java.Method.create({
          name: 'verifyRequirements',
          visibility: 'default',
          type: 'void',
          javaThrows: [ 'IllegalStateException' ],
          args: [
            { name: 'x', type: 'X' },
            { name: 'capabilityIds', type: 'String[]' }
          ],
          body: `
            checkRequirementsStatus(x, capabilityIds, GRANTED);
          `
        }));
        cls.methods.push(foam.java.Method.create({
          name: 'checkRequirementsStatus',
          visibility: 'default',
          type: 'void',
          javaThrows: [ 'IllegalStateException' ],
          args: [
            { name: 'x', type: 'X' },
            { name: 'capabilityIds', type: 'String[]' },
            { name: 'status', type: 'CapabilityJunctionStatus' },
          ],
          body: `
            // Marshal payloads into a hashmap
            Map<String, CapablePayload> payloads = new HashMap<String, CapablePayload>();
            for ( CapablePayload payload : getCapablePayloads() ) {
              payloads.put(payload.getCapability(), payload);
            }

            for ( String capId : capabilityIds ) {
              if ( ! payloads.containsKey(capId) ) {
                throw new IllegalStateException(String.format(
                  "Missing payload object for capability '%s'",
                  capId
                ));
              }

              CapablePayload payload = payloads.get(capId);
              if ( payload.getStatus() != status ) {
                throw new IllegalStateException(String.format(
                  "Object does not have %s status for capability '%s'",
                  status,
                  capId
                ));
              }
            }
          `
        }));
        cls.methods.push(foam.java.Method.create({
          name: 'checkRequirementsStatusNoThrow',
          visibility: 'default',
          type: 'boolean',
          args: [
            { name: 'x', type: 'X' },
            { name: 'capabilityIds', type: 'String[]' },
            { name: 'status', type: 'CapabilityJunctionStatus' },
          ],
          body: `
            try {
              checkRequirementsStatus(x, capabilityIds, status);
              return true;
            } catch(IllegalStateException e) {
              return false;
            }
          `
        }));
        cls.methods.push(foam.java.Method.create({
          name: 'getCapablePayloadDAO',
          type: 'foam.dao.DAO',
          visibility: 'default',
          args: [
            { name: 'x', type: 'X' },
          ],
          body: `            
            DAO capablePayloadDAO = new CapableAdapterDAO.Builder(x)
              .setCapable(this)
              .setOf(CapablePayload.getOwnClassInfo())
              .build();

            x = x.put("capablePayloadDAO", capablePayloadDAO);

            // TODO: Look into why rulerdao acts sketchy here and if it can replace CapablePayloadStatusDAO
            DAO CapablePayloadStatusDAO = new CapablePayloadStatusDAO.Builder(x)
              .setDelegate(capablePayloadDAO)
              .setOf(CapablePayload.getOwnClassInfo())
              .build();
              
            return CapablePayloadStatusDAO;
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
