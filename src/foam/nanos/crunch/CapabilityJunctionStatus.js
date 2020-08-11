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
      documentation: `This is for capabilities that are waiting approvals. UCJ has sent out an approval.`,
      background: '#bfae32'
    },
    {
      name: 'GRANTED',
      label: 'granted',
      documentation: `This is for capabilities that have passed all checks.`,
      background: '#32bf5e'
    },
    {
      name: 'EXPIRED',
      label: 'expired',
      documentation: `A cron runs to establish capabilities that are no longer valid and potentially expires a ucj.`,
      background: '#bf3232'
    },
    {
      name: 'ACTION_REQUIRED',
      label: 'action required',
      documentation: `A capability started and requiring user action, should have ucj in this state.`,
      background: '#bf3232',
      color: '#FFFFFF'
    },
    {
      name: 'AVAILABLE',
      label: 'available',
      documentation: `This status is used when there is no UCJ - thus capability available.`,
      background: '#604aff'
    },
    {
      name: 'GRACE_PERIOD',
      label: 'grace period',
      documentation: `This status is used when a UCJ is expired, but the number of graceDaysLeft is greater than 0 `
    },
    {
      name: 'APPROVED',
      label: 'approved',
      documentation: `Denoting a UCJ requiring review has been approved. It would need to go through the rules of the ucjDAO before 
      being set to granted.`,
      background: '#bfae32'
    }
  ]
});
  