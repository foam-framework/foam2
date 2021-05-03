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
      color: '/*%WARNING2%*/ #D57D11',
      background: '/*%WARNING5%*/ #FFF4DE',
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
      color: '/*%DESTRUCTIVE2%*/ #A61414',
      background: '/*%DESTRUCTIVE5%*/ #FFE9E7',
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
