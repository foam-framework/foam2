/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.extra',
  name: 'ReviewCapabilityData',

  messages: [
    { name: 'REVIEW_REQUIRED_ERROR', message: 'All data must be reviewed by a privileged user.' }
  ],

  properties: [
    {
      name: 'reviewed',
      class: 'Boolean',
      validationPredicates: [
        {
          args: ['reviewed'],
          predicateFactory: function(e) {
            return e.EQ(
              foam.nanos.crunch.extra.ReviewCapabilityData.REVIEWED,
              true
            );
          },
          errorMessage: 'REVIEW_REQUIRED_ERROR'
        }
      ]
    }
  ]
});