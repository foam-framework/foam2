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
      color: '/*%DESTRUCTIVE2%*/ #a61414',
      background: '/*%DESTRUCTIVE5%*/ #fbedec',
    },
    {
      name: 'APPROVED',
      label: { en: 'Approved', pt: 'Aprovado'},
      ordinal: 1,
      documentation: 'Request was approved.',
      color: '/*%APPROVAL2%*/ #117a41',
      background: '/*%APPROVAL5%*/ #e2f2dd',
    },
    {
      name: 'REJECTED',
      label: { en: 'Rejected', pt: 'Rejeitado'},
      ordinal: 2,
      documentation: 'Request was rejected.',
      color: '/*%WARNING1%*/ #816819',
      background: '/*%WARNING4%*/ #fbe88f',
    },
    {
      name: 'CANCELLED',
      label: { en: 'Cancelled', pt: 'Cancelado'},
      ordinal: 3,
      documentation: 'Request was cancelled.',
      color: '/*%GREY1%*/ #5e6061',
      background: '/*%GREY4%*/ #e7eaec',
    }
  ]
});
