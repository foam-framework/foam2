/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.nanos.crunch',
  name: 'CapabilityGrantMode',
  documentation: `
    Set grantMode of a capability to MANUAL if you do not wish for the
    capability to be granted automatically by a user action. This is useful
    when an event outside of CRUNCH is expected to grant the capability.
  `,
  values: [
    {
      name: 'AUTOMATIC',
      background: '#8effb2',
      documentation: `
        The capability can be granted by saving a junction with valid data,
        provided it has all of its prerequisites satisfied and the capability
        is available. This action can be performed by any user of the system.
      `
    },
    {
      name: 'MANUAL',
      background: '#ffe48e',
      documentation: `
        The capability will not be automatically granted. It must be granted
        explicitly by a user with permission to grant capabilities, or by a
        rule outside of CRUNCH.

        When performing a manual grant, set the status to APPROVED. This will
        allow prerequisites in PENDING to block granting of the capability
        until they are also APPROVED or GRANTED.
      `
    }
  ]
});
