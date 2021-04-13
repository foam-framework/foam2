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
      background: '#FFFFFF',
      color: '#865300'
    },
    {
      name: 'GRANTED',
      label: { en: 'granted', pt: 'concedida'},
      documentation: 'The information you provided has been approved',
      background: '#FFFFFF',
      color: '#007328',
      glyph: `
      <?xml version="1.0" encoding="UTF-8"?>
      <svg width="40px" height="40px" viewBox="0 0 40 40" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
          <g id="Symbols" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
              <g id="icon/complete/48x48" transform="translate(-4.000000, -4.000000)">
                  <g id="round-check_circle-24px">
                      <polygon id="Path" points="0 0 48 0 48 48 0 48"></polygon>
                      <path d="M18.58,32.58 L11.4,25.4 C10.62,24.62 10.62,23.36 11.4,22.58 C12.18,21.8 13.44,21.8 14.22,22.58 L20,28.34 L33.76,14.58 C34.54,13.8 35.8,13.8 36.58,14.58 C37.36,15.36 37.36,16.62 36.58,17.4 L21.4,32.58 C20.64,33.36 19.36,33.36 18.58,32.58 Z" id="Shape" fill="%FILL%" fill-rule="nonzero"></path>
                  </g>
              </g>
          </g>
      </svg>
      `
    },
    {
      name: 'EXPIRED',
      label: { en: 'expired', pt: 'expirada'},
      documentation: 'The information required has changed, or your inputs are no longer valid',
      background: '#A00B0B',
      color: '#FFFFFF'
    },
    {
      name: 'ACTION_REQUIRED',
      label: { en: 'action required', pt: 'ação requerida'},
      documentation: 'Information is missing for required fields',
      background: '#D57D11',
      color: '#FFFFFF'
    },
    {
      name: 'AVAILABLE',
      label: { en: 'available', pt: 'acessível'},
      documentation: 'You are ready to get started',
      background: '#00B03E',
      color: '#FFFFFF'
    },
    {
      name: 'APPROVED',
      label: { en: 'approved', pt: 'aprovada'},
      documentation: `- not seen by users - Denoting a UCJ requiring review has been approved. It would need to go through the rules of the ucjDAO before
      being set to granted.`,
      background: '#FFFFFF',
      color: '#007328',
      ordinal: 6
    },
    {
      name: 'PENDING_REVIEW',
      label: { en: 'pending review', pt: 'revisão pendente' },
      documentation: 'The information you provided is pending review',
      background: '#FFFFFF',
      color: '/*%WARNING1%*/ #865300'
    },
    {
      name: 'REJECTED',
      label: { en: 'rejected', pt: 'rejeitada'},
      documentation: `- not seen by users - Denoting a junction requiring review has been rejected. Meant to mark items in a FINAL rejected state where it is not 
      expected to go to EXPIRED and have the user fill out more info. Used in the 
      Capable object junctions.`,
      background: '#FFFFFF',
      color: '/*%DESTRUCTIVE2%*/ #A61414'
    },
  ]
});
