/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.ENUM({
  package: 'foam.nanos.approval',
  name: 'ApprovalStatus',

  values: [
    {
      name: 'REQUESTED',
      label: { en: 'Requested', pt: 'Requeridos'},
      ordinal: 0,
      documentation: 'Request pending.',
      color: '/*%WARNING2%*/ #a61414',
      background: '/*%WARNING5%*/ #fbedec',
    },
    {
      name: 'APPROVED',
      label: { en: 'Approved', pt: 'Aprovado'},
      ordinal: 1,
      documentation: 'Request was approved.',
      color: '/*%APPROVAL1%*/ #117a41',
      background: '/*%APPROVAL5%*/ #e2f2dd',
    },
    {
      name: 'REJECTED',
      label: { en: 'Rejected', pt: 'Rejeitado'},
      ordinal: 2,
      documentation: 'Request was rejected.',
      color: '/*%DESTRUCTIVE2%*/ #816819',
      background: '/*%DESTRUCTIVE5%*/ #fbe88f',
    },
    {
      name: 'CANCELLED',
      label: { en: 'Cancelled', pt: 'Cancelado'},
      ordinal: 3,
      documentation: 'Request was cancelled.',
      color: '/*%GREY1%*/ #5e6061',
      background: '/*%GREY5%*/ #e7eaec',
    }
  ]
});
