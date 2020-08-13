/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.connection',
  name: 'FlatCapability',
  extends: 'foam.nanos.crunch.Capability',
  documentation: `
    This capability represents a flattened version of another
    existing capability, and does not mutate when prerequisite
    requirements change - instead it should be deprecated and a
    new FlatCapability should be created.
  `,

  javaImports: [
    'static foam.mlang.MLang.*'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  tableColumns: [
    'id',
    'name',
    'targetCapabilityId'
  ],

  properties: [
    {
      name: 'id',
      class: 'String',
      documentation: 'ID of the ConnectedCapability'
    },
    {
      name: 'targetCapabilityId',
      class: 'String',
      documentation: `
        ID of the capability that this FlatCapability matches.
      `
    },
    {
      name: 'classes',
      class: 'StringArray',
      documentation: `
        Class IDs in order for prerequisites.
        Note: This may later need to become 'List' type and have
          nested lists for Or capabilities.
      `
    },
    {
      name: 'capabilities',
      class: 'List',
      javaType: 'java.util.ArrayList<String>',
      documentation: `
        Capability IDs of prerequisites. This is a parallel array
        to 'classes'.
      `
    }
  ]
});