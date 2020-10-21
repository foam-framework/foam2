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
      label: { en: 'pending', pt: 'pendente'},
      documentation: `This is awaiting verification. Capability access may take up to 24hrs.`,
      background: '#bfae32'
    },
    {
      name: 'GRANTED',
      label: { en: 'granted', pt: 'concedida'},
      documentation: `This passed all checks. This Capability has their features unlocked.`,
      background: '#32bf5e'
    },
    {
      name: 'EXPIRED',
      label: { en: 'expired', pt: 'expirada'},
      documentation: `Requirements for this Capability has changed or is no longer valid.`,
      background: '#bf3232'
    },
    {
      name: 'ACTION_REQUIRED',
      label: { en: 'action required', pt: 'ação requerida'},
      documentation: `The requirements for this Capability needs to be met.`,
      background: '#cf6f0a'
    },
    {
      name: 'AVAILABLE',
      label: { en: 'available', pt: 'acessível'},
      documentation: `This Capability is ready to be made available to you.`,
      background: '#604aff'
    },
    {
      name: 'APPROVED',
      label: { en: 'approved', pt: 'aprovada'},
      documentation: `- not seen by users - Denoting a UCJ requiring review has been approved. It would need to go through the rules of the ucjDAO before
      being set to granted.`,
      background: '#bfae32',
      ordinal: 6
    },
    {
      name: 'PENDING_REVIEW',
      label: { en: 'pending review', pt: 'revisão pendente' },
      documentation: `This is waiting for a privileged user review.`,
      background: '#bfae32'
    }
  ]
});
