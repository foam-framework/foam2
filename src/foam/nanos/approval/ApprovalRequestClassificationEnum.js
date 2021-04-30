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
      label: 'Generic Business Validator'
    },
    {
      name: 'BUSINESS_IDENTITYMIND_MERCHANT_KYC',
      label: 'Business IdentityMind Merchant KYC'
    },
    {
      name: 'TRANSACTION_IDENTITYMIND_TRANSFER',
      label: 'Transaction IdentityMind Transfer'
    },
    {
      name: 'BENEFICIAL_OWNER_DOW_JONES',
      label: 'Beneficial Owner Dow Jones R&C'
    },
    {
      name: 'BUSINESS_DOW_JONES',
      label: 'Business Dow Jones R&C'
    },
    {
      name: 'BUSINESS_DIRECTOR_DOW_JONES',
      label: 'Business Director Dow Jones R&C'
    },
    {
      name: 'BUSINESS_ONBOARDING_DOW_JONES',
      label: 'Business Onboarding Dow Jones Entity KYC'
    },
    {
      name: 'SIGNING_OFFICER_SECUREFACT_SIDNI',
      label: 'Signing Officer SecureFact SIDni'
    },
    {
      name: 'SIGNING_OFFICER_DOW_JONES',
      label: 'Signing Officer Dow Jones R&C'
    },
    {
      name: 'BUSINESS_ONBOARDING_SECUREFACT_LEV',
      label: 'Business Onboarding SecureFact LEV'
    },
    {
      name: 'MANUAL_USER_DOW_JONES',
      label: 'Manual User Dow Jones R&C'
    },
    {
      name: 'MANUAL_USER_SECUREFACT_SIDNI',
      label: 'Manual User SecureFact SIDni'
    },
    {
      name: 'MANUAL_USER_IDENTITYMIND',
      label: 'Manual User IdentityMind (Acuant)'
    },
    {
      name: 'MANUAL_BUSINESS_DOW_JONES',
      label: 'Manual Business Dow Jones R&C'
    },
    {
      name: 'BUSINESS_SECUREFACT_LEV',
      label: 'Business SecureFact LEV'
    },
    {
      name: 'BUSINESS_IDENTITYMIND_KYC',
      label: 'Business IdentityMind KYC (Acuant)'
    },
    {
      name: 'COMPLIANCE_CAPABILITY_GRANTED',
      label: 'Compliance capability granted'
    },
    {
      name: 'GENERIC_SIGNING_OFFICER_VALIDATION',
      label: 'Generic Signing Officer Validator'
    },
    {
      name: 'USER_DOW_JONES',
      label: 'User Dow Jones R&C'
    },
    {
      name: 'USER_IDENTITYMIND_CONSUMER_KYC',
      label: 'User IdentityMind Consumer KYC'
    },
    {
      name: 'KOTAK_MANUAL_FX_COMPLETED',
      label: 'Kotak Manual FX Transaction Completion'
    },
    {
      name: 'EXCHAGE_LIMIT_EXCEEDED',
      label: 'Exchange Limit Exceeded'
    },
    {
      name: 'AFEX_BUSINESS',
      label: 'AFEX Business'
    },
    {
      name: 'PAYEE_PAYER_DOW_JONES_TRANSACTION',
      label: 'Payee/Payer Dow Jones Transaction'
    },
    {
      name: 'USER_SECUREFACT_SIDNI',
      label: 'User SecureFact SIDni'
    },
    {
      name: 'TESTING_APPROVAL_SYSTEM',
      label: 'testing approval system'
    },
    {
      name: 'COMPLIANCE_TRANSACTION',
      label: 'Compliance Transaction'
    },
    {
      name: 'CAPABLE_CREATED_APPROVAL',
      label: 'Capable Created Approval'
    },
    {
      name: 'APPROVABLE_REQUEST',
      label: 'Approvable Request'
    },
    {
      name: 'SUDO_TICKET_APPROVAL',
      label: 'Sudo Ticket Approval'
    },
    {
      name: 'NATURE_CODE_APPROVAL',
      label: 'Nature Code Approval'
    },
    {
      name: 'ACCOUNT_ROLE_APPROVAL',
      label: 'Account Role Approval'
    },
    {
      name: 'ACCOUNT_APPROVABLE_REQUEST',
      label: 'Account Approvable Request'
    }
  ]
});
