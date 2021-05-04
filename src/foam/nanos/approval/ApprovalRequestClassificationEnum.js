/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.ENUM({
  package: 'foam.nanos.approval',
  name: 'ApprovalRequestClassificationEnum',

  values: [
    {
      name: 'GENERIC_BUSINESS_VALIDATOR',
      label: 'Generic Business Validator',
      ordinal: 0
    },
    {
      name: 'BUSINESS_IDENTITYMIND_MERCHANT_KYC',
      label: 'Business IdentityMind Merchant KYC',
      ordinal: 1
    },
    {
      name: 'TRANSACTION_IDENTITYMIND_TRANSFER',
      label: 'Transaction IdentityMind Transfer',
      ordinal: 2
    },
    {
      name: 'BENEFICIAL_OWNER_DOW_JONES',
      label: 'Beneficial Owner Dow Jones R&C',
      ordinal: 3
    },
    {
      name: 'BUSINESS_DOW_JONES',
      label: 'Business Dow Jones R&C',
      ordinal: 4
    },
    {
      name: 'BUSINESS_DIRECTOR_DOW_JONES',
      label: 'Business Director Dow Jones R&C',
      ordinal: 5
    },
    {
      name: 'BUSINESS_ONBOARDING_DOW_JONES',
      label: 'Business Onboarding Dow Jones Entity KYC',
      ordinal: 6
    },
    {
      name: 'SIGNING_OFFICER_SECUREFACT_SIDNI',
      label: 'Signing Officer SecureFact SIDni',
      ordinal: 7
    },
    {
      name: 'SIGNING_OFFICER_DOW_JONES',
      label: 'Signing Officer Dow Jones R&C',
      ordinal: 8
    },
    {
      name: 'BUSINESS_ONBOARDING_SECUREFACT_LEV',
      label: 'Business Onboarding SecureFact LEV',
      ordinal: 9
    },
    {
      name: 'MANUAL_USER_DOW_JONES',
      label: 'Manual User Dow Jones R&C',
      ordinal: 10
    },
    {
      name: 'MANUAL_USER_SECUREFACT_SIDNI',
      label: 'Manual User SecureFact SIDni',
      ordinal: 11
    },
    {
      name: 'MANUAL_USER_IDENTITYMIND',
      label: 'Manual User IdentityMind (Acuant)',
      ordinal: 12
    },
    {
      name: 'MANUAL_BUSINESS_DOW_JONES',
      label: 'Manual Business Dow Jones R&C',
      ordinal: 13
    },
    {
      name: 'BUSINESS_SECUREFACT_LEV',
      label: 'Business SecureFact LEV',
      ordinal: 14
    },
    {
      name: 'BUSINESS_IDENTITYMIND_KYC',
      label: 'Business IdentityMind KYC (Acuant)',
      ordinal: 15
    },
    {
      name: 'COMPLIANCE_CAPABILITY_GRANTED',
      label: 'Compliance capability granted',
      ordinal: 16
    },
    {
      name: 'GENERIC_SIGNING_OFFICER_VALIDATION',
      label: 'Generic Signing Officer Validator',
      ordinal: 17
    },
    {
      name: 'USER_DOW_JONES',
      label: 'User Dow Jones R&C',
      ordinal: 18
    },
    {
      name: 'USER_IDENTITYMIND_CONSUMER_KYC',
      label: 'User IdentityMind Consumer KYC',
      ordinal: 19
    },
    {
      name: 'KOTAK_MANUAL_FX_COMPLETED',
      label: 'Kotak Manual FX Transaction Completion',
      ordinal: 20
    },
    {
      name: 'EXCHAGE_LIMIT_EXCEEDED',
      label: 'Exchange Limit Exceeded',
      ordinal: 21
    },
    {
      name: 'AFEX_BUSINESS',
      label: 'AFEX Business',
      ordinal: 22
    },
    {
      name: 'PAYEE_PAYER_DOW_JONES_TRANSACTION',
      label: 'Payee/Payer Dow Jones Transaction',
      ordinal: 23
    },
    {
      name: 'USER_SECUREFACT_SIDNI',
      label: 'User SecureFact SIDni',
      ordinal: 24
    },
    {
      name: 'TESTING_APPROVAL_SYSTEM',
      label: 'testing approval system',
      ordinal: 25
    },
    {
      name: 'COMPLIANCE_TRANSACTION',
      label: 'Compliance Transaction',
      ordinal: 26
    },
    {
      name: 'CAPABLE_CREATED_APPROVAL',
      label: 'Capable Created Approval',
      ordinal: 27
    },
    {
      name: 'APPROVABLE_REQUEST',
      label: 'Approvable Request',
      ordinal: 28
    },
    {
      name: 'SUDO_TICKET_APPROVAL',
      label: 'Sudo Ticket Approval',
      ordinal: 29
    },
    {
      name: 'NATURE_CODE_APPROVAL',
      label: 'Nature Code Approval',
      ordinal: 30
    },
    {
      name: 'ACCOUNT_ROLE_APPROVAL',
      label: 'Account Role Approval',
      ordinal: 31
    },
    {
      name: 'ACCOUNT_APPROVABLE_REQUEST',
      label: 'Account Approvable Request',
      ordinal: 32
    },
    {
      name: 'TRANSACTION_REQUEST',
      label: 'Transaction Approval Request',
      ordinal: 33
    }
  ]
});
