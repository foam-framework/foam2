/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.ENUM({
  package: 'foam.nanos.crunch',
  name: 'BasicCapabilityJunctionStatus',

  documentation: `
    Represents a subset of values for CapabilityJunctionStatus which the
    complete set of values can be reduced to.

    This can simplify status checks when, for example, you want to know
    if a capability is effectively granted but don't need to know the
    exact status.
  `,

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
      name: 'AVAILABLE',
      label: 'available',
      documentation: `This status is used when a capability has had no previous actions and is accessible if you so choose.`,
      background: '#604aff'
    },
  ]
});
