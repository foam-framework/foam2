/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'Renewable',

  properties: [
    {
      name: 'isExpired',
      class: 'Boolean',
      javaSetter: `
        isExpired_ = val;
        isExpiredIsSet_ = true;
        if ( isExpired_ ) {
          isInGracePeriod_ = false;
        }
      `
    },
    {
      name: 'isRenewable',
      class: 'Boolean',
      getter: () => { return this.isExpired || this.isInRenewablePeriod || this.isInGracePeriod; },
      javaGetter: `
        return getIsExpired() || getIsInRenewablePeriod() || getIsInGracePeriod();
      `
    },
    {
      name: 'isInRenewablePeriod',
      class: 'Boolean',
      javaSetter: `
        isInRenewablePeriod_ = val;
        isInRenewablePeriodIsSet_ = true;
        if ( isInRenewablePeriod_ ) {
          isExpired_ = false;
          isInGracePeriod_ = false;
        }
      `
    },
    {
      name: 'isInGracePeriod',
      class: 'Boolean',
      javaSetter: `
        isInGracePeriod_ = val;
        isInGracePeriodIsSet_ = true;
        if ( isInGracePeriod_ ) {
          isExpired_ = false;
          isInRenewablePeriod_ = false;
        }
      `
    },
    {
      name: 'expiry',
      class: 'DateTime',
      documentation: `
        The date of expiry for this ucj. After this date, the ucj will stay GRANTED
        for a gracePeriod, or go into EXPIRED status, if no gracePeriod is set.
      `
    },
    {
      name: 'gracePeriod',
      class: 'Int',
      documentation: `
        Number of days left that a user can use the Capability in this ucj after it has expired
      `
    }
  ],

  methods: [
    {
      name: 'getRenewalStatusChanged',
      args: [
        { name: 'old', javaType: 'foam.nanos.crunch.UserCapabilityJunction' }
      ],
      type: 'Boolean',
      javaCode: `
        if ( old.getIsExpired() != getIsExpired() ) return true;
        if ( old.getIsRenewable() != getIsRenewable() ) return true;
        if ( old.getIsInRenewablePeriod() != getIsInRenewablePeriod() ) return true;
        if ( old.getIsInGracePeriod() != getIsInGracePeriod() ) return true;

        return false;
      `
    },
    {
      name: 'resetRenewalStatus',
      javaCode: `
        clearIsInRenewablePeriod();
        clearIsInGracePeriod();
        clearIsExpired();
        clearIsRenewable();
      `
    }
  ]
});
