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
      documentation: 'Our team is currently reviewing. Approvals may take up to 24 hours',
      background: '#E7EAEC',
      color: '#1E1F21'
    },
    {
      name: 'GRANTED',
      label: { en: 'granted', pt: 'concedida'},
      documentation: 'The information you provided has been approved',
      background: '#E2F2DD',
      color: '#19402E'
    },
    {
      name: 'EXPIRED',
      label: { en: 'expired', pt: 'expirada'},
      documentation: 'The information required has changed, or your inputs are no longer valid',
      background: '#F79393',
      color: '#631414'
    },
    {
      name: 'ACTION_REQUIRED',
      label: { en: 'action required', pt: 'ação requerida'},
      documentation: 'Information is missing for required fields',
      background: '#FBE88F',
      color: '#816819'
    },
    {
      name: 'AVAILABLE',
      label: { en: 'available', pt: 'acessível'},
      documentation: 'You are ready to get started',
      background: '#A7BEFF',
      color: '#202341'
    },
    {
      name: 'APPROVED',
      label: { en: 'approved', pt: 'aprovada'},
      documentation: `- not seen by users - Denoting a UCJ requiring review has been approved. It would need to go through the rules of the ucjDAO before
      being set to granted.`,
      background: '#E2F2DD',
      color: '#19402E',
      ordinal: 6
    },
    {
      name: 'PENDING_REVIEW',
      label: { en: 'pending review', pt: 'revisão pendente' },
      documentation: 'The information you provided is pending review',
      background: '#FBE88F',
      color: '#816819'
    },
    {
      name: 'REJECTED',
      label: { en: 'rejected', pt: 'rejeitada'},
      documentation: `- not seen by users - Denoting a junction requiring review has been rejected. Meant to mark items in a FINAL rejected state where it is not 
      expected to go to EXPIRED and have the user fill out more info. Used in the 
      Capable object junctions.`,
      background: '#F79393',
      color: '#631414'
    },
  ]
});
