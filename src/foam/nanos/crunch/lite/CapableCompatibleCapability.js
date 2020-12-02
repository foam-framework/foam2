/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.crunch.lite',
  name: 'CapableCompatibleCapability',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.crunch.CapabilityJunctionStatus'
  ],

  documentation: `
    This interface implements methods required the rules which apply to
    CapablePayload DAOs. For example, 'getPrereqsChainedStatus' as
    implemented by Capability or MinMaxCapability applies only to UCJ payloads,
    so a different method (getCapableChainedStatus) is needed.
  `,

  methods: [
    {
      name: 'getCapableChainedStatus',
      type: 'CapabilityJunctionStatus',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'capablePayloadDAO',
          type: 'DAO'
        },
        {
          name: 'payload',
          type: 'CapablePayload'
        }
      ],
    }
  ]
});