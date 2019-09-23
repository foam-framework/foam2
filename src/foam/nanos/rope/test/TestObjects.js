/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.rope.test',
  name: 'ROPEUser',

  properties: [
    {
      name: 'id',
      class: 'Long'
    },
    {
      name: 'name',
      class: 'String'
    }
  ]
});

foam.CLASS({
  package: 'foam.nanos.rope.test',
  name: 'ROPEBusiness',

  properties: [
    {
      name: 'id',
      class: 'Long'
    },
    {
      name: 'name',
      class: 'String'
    }
  ]
});

foam.CLASS({
  package: 'foam.nanos.rope.test',
  name: 'ROPEBankAccount',

  properties: [
    {
      name: 'id',
      class: 'Long'
    },
    {
      name: 'name',
      class: 'String'
    }
  ]
});

foam.CLASS({
  package: 'foam.nanos.rope.test',
  name: 'ROPETransaction',

  properties: [
    {
      name: 'id',
      class: 'Long'
    },
    {
      name: 'name',
      class: 'String'
    }
  ]
});


foam.RELATIONSHIP({
  cardinality: '*:*',
  sourceModel: 'foam.nanos.rope.test.ROPEUser',
  targetModel: 'foam.nanos.rope.test.ROPEUser',
  forwardName: 'entities',
  inverseName: 'agents',
  junctionDAOKey: 'ropeAgentJunctionDAO'
});

foam.RELATIONSHIP({
  cardinality: '*:*',
  sourceModel: 'foam.nanos.rope.test.ROPEUser',
  targetModel: 'foam.nanos.rope.test.ROPEUser',
  forwardName: 'partners',
  inverseName: 'partnered',
  junctionDAOKey: 'ropePartnerJunctionDAO'
});

foam.RELATIONSHIP({
  cardinality: '*:*',
  sourceModel: 'foam.nanos.rope.test.ROPEUser',
  targetModel: 'foam.nanos.rope.test.ROPEUser',
  forwardName: 'contacts',
  inverseName: 'owner',
  junctionDAOKey: 'ropeContactDAO'
});

foam.RELATIONSHIP({
  cardinality: '*:*',
  sourceModel: 'foam.nanos.rope.test.ROPEBusiness',
  targetModel: 'foam.nanos.rope.test.ROPEUser',
  forwardName: 'signingOfficers',
  inverseName: 'businessesInWhichThisUserIsASigningOfficer',
  junctionDAOKey: 'ropeSigningOfficerJunctionDAO'
});

foam.RELATIONSHIP({
  cardinality: '1:*',
  sourceModel: 'foam.nanos.rope.test.ROPEUser',
  targetModel: 'foam.nanos.rope.test.ROPEBankAccount',
  forwardName: 'bankaccounts',
  inverseName: 'owner',
  targetDAOKey: 'ropeAccountDAO'
});

foam.RELATIONSHIP({
  cardinality: '1:*',
  sourceModel: 'foam.nanos.rope.test.ROPEBankAccount',
  targetModel: 'foam.nanos.rope.test.ROPETransaction',
  forwardName: 'debits',
  inverseName: 'sourceAccount',
  targetDAOKey: 'ropeTransactionDAO'
});

foam.RELATIONSHIP({
  cardinality: '1:*',
  sourceModel: 'foam.nanos.rope.test.ROPEBankAccount',
  targetModel: 'foam.nanos.rope.test.ROPETransaction',
  forwardName: 'credits',
  inverseName: 'destinationAccount',
  targetDAOKey: 'ropeTransactionDAO'
});
