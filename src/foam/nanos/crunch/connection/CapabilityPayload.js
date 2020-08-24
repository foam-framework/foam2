/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.connection',
  name: 'CapabilityPayload',
  documentation: `
    TODO: Update
    This capability represents a flattened version of another
    existing capability, and does not mutate when prerequisite
    requirements change - instead it should be deprecated and a
    new FlatCapability should be created.
  `,

  properties: [
    {
      name: 'id',
      class: 'String'
    },
    {
      name: 'targetCapabilityId',
      class: 'String',
      documentation: `
        ID of the capability that this CapabilityPayload matches.
      `
    },
    {
      name: 'capabilityDataObjects',
      class: 'Array',
      documentation: `
        Data Objects in order for prerequisites.
        Note: This may later need to become 'List' type and have
          nested lists for Or capabilities.
      `
    },
    {
      name: 'capabilities',
      class: 'StringArray',
      documentation: `
        Capability IDs of prerequisites. This is a parallel array
        to 'classes'.
      `
    }
  ]
});