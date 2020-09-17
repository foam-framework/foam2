/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.connection',
  name: 'ConnectedCapability',

  javaImports: [
    'static foam.mlang.MLang.*'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  tableColumns: [
    'id',
    'flatCapability'
  ],

  properties: [
    {
      name: 'id',
      class: 'String',
      documentation: 'ID of the ConnectedCapability'
    },
    {
      name: 'flatCapability',
      class: 'Reference',
      of: 'foam.nanos.crunch.connection.FlatCapability',
      targetDAOKey: 'flatCapabilityDAO',
      documentation: `
        ID of the FlatCapability being submitted.
      `
    },
    {
      name: 'data',
      class: 'Array',
      documentation: `
        Data objects corresponding to 'classes' of the FlatCapability.
        A RuntimeException is thrown if the array length doesn't match or
        if the object classes are incorrect.
      `
    }
  ]
});