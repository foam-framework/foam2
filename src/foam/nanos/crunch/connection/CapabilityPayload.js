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
    CapabilityPayload is created with an id for a specific requested capability and its
    associated capabilities mapped to required data objects in the specified in its grant path 
  `,

  javaImports: [
    'foam.core.FObject',
    'java.util.HashMap'
  ],

  properties: [
    {
      name: 'id',
      class: 'String',
      documentation: `
        ID of the capability that this CapabilityPayload matches.
      `
    },
    {
      class: 'Map',
      name: 'capabilityDataObjects',
      javaFactory: `
        return new HashMap<String,FObject>();
      `
    }
  ]
});