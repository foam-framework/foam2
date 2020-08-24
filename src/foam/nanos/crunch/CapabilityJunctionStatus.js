/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.ENUM({
  package: 'foam.nanos.crunch',
  name: 'CapabilityJunctionStatus',
  values: [
    {
      name: 'PENDING',
      label: 'pending',
      documentation: `This is for capabilities that are waiting verification. Capability access may take upto 24hrs.`,
      background: '#bfae32'
    },
    {
      name: 'GRANTED',
      label: 'granted',
      documentation: `This is for capabilities that have passed all checks. Capabilities in this status have their features unlocked.`,
      background: '#32bf5e'
    },
    {
      name: 'EXPIRED',
      label: 'expired',
      documentation: `A capability can expire due to a number of factors. The data that was previously collected will be removed or reset and must be re-added or re-approved to gain access.`,
      background: '#bf3232'
    },
    {
      name: 'ACTION_REQUIRED',
      label: 'action required',
      documentation: `A capability started and requires further action to complete.`,
      background: '#cf6f0a'
    },
    {
      name: 'AVAILABLE',
      label: 'available',
      documentation: `This status is used when a capability has had no previous actions and is accessible if you so choose.`,
      background: '#604aff'
    },
    {
      name: 'GRACE_PERIOD',
      label: 'grace period',
      documentation: `This status is used when a capability is expired, but for your benefit we allow a certian set of days to continue accessing the features that are unlocked by this capability.`,
      background: 'grey'
    },
    {
      name: 'APPROVED',
      label: 'approved',
      documentation: `- not seen by users - Denoting a UCJ requiring review has been approved. It would need to go through the rules of the ucjDAO before 
      being set to granted.`,
      background: '#bfae32'
    }
  ]
});
