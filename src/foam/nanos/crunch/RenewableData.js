/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'RenewableData',

  documentation: `
    Capability data that may expire and require renewal by a user should extend this class.
  `,

  sections: [
    {
      name: 'reviewDataSection',
      isAvailable: function(renewable) { return renewable; }
    }
  ],

  messages: [
    { name: 'REVIEW_ERROR', message: 'Need to certify data reviewed' }
  ],

  properties: [
    {
      name: 'renewable',
      class: 'Boolean',
      section: 'reviewDataSection',
      hidden: true
    },
    {
      name: 'reviewed',
      class: 'Boolean',
      section: 'reviewDataSection',
      validationPredicates: [
        {
          args: ['renewable', 'reviewed'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(foam.nanos.crunch.RenewableData.RENEWABLE, false),
              e.AND(
                e.EQ(foam.nanos.crunch.RenewableData.RENEWABLE, true),
                e.EQ(foam.nanos.crunch.RenewableData.REVIEWED, true)
              )
            )
          },
          errorMessage: 'REVIEW_ERROR'
        }
      ]
    },
    {
      name: 'dataConfiguredExpiry',
      class: 'Boolean',
      hidden: true,
      readPermissionRequired: true,
      writePermissionRequired: true
    },
    {
      name: 'expiry',
      class: 'Date',
      hidden: true
    }
  ]
});
