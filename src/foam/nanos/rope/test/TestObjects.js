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
  extends: 'foam.nanos.rope.test.ROPEUser',

  properties: [
    {
      name: 'organizationName',
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


/**
 * TODO : add foam.RELATIONSHIP BETWEEN : 
 * 1. User - User
 *    sourceModel : ROPEUser
 *    targetModel : ROPEUser
 *    cardinality : *:*
 *    forwardName : entities
 *    inverseName : agents
 *    junctionDAOKey : ropeAgentJunctionDAO
 * 
 * 2. User - User
 *    sourceModel : ROPEUser
 *    targetModel : ROPEUser
 *    cardinality : *:*
 *    forwardName : partners
 *    inverseName : partnered
 *    junctionDAOKey : ropePartnerJunctionDAO
 * 
 * 3. User - User
 *    sourceModel : ROPEUser
 *    targetModel : ROPEUser
 *    cardinality : 1:*
 *    forwardName : contacts
 *    inverseName : owner
 *    junctionDAOKey : ropeContactDAO
 * 
 * 4. User - User
 *    sourceModel : ROPEBusiness
 *    targetModel : ROPEUser
 *    cardinality : *:*
 *    forwardName : signingOfficers
 *    inverseName : businessesInWhichThisUserIsASigningOfficer
 *    junctionDAOKey : ropeSigningOfficerJunctionDAO
 * 
 * 5. User - BankAccount
 *    sourceModel : ROPEUser
 *    targetModel : ROPEBankAccount
 *    cardinality : 1:*
 *    forwardName : bankaccounts
 *    inverseName : owner
 *    junctionDAOKey : ropeAccountDAO
 * 
 * 6. BankAccount - Transaction
 *    sourceModel : ROPEBankAccount
 *    targetModel : ROPETransaction
 *    cardinality : 1:*
 *    forwardName : debits
 *    inverseName : sourceAccount
 *    junctionDAOKey : ropeTransactionDAO
 * 
 * 7. BankAccount - Transaction
 *    sourceModel : ROPEBankAccount
 *    targetModel : ROPETransaction
 *    cardinality : 1:*
 *    forwardName : credits
 *    inverseName : destinationAccount
 *    junctionDAOKey : ropeTransactionDAO
 * 
 */
