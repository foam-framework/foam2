/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.flinks.model',
  name: 'FlinksCall',
  documentation: 'model for Flinks Call',
  abstract: 'true'
});

foam.CLASS({
  package: 'foam.flinks.model',
  name: 'FlinksRequest',
  extends: 'foam.flinks.model.FlinksCall',
  abstract: 'true',

  documentation: 'model for Flinks request',

  properties:[
    {
      class: 'String',
      name: 'CustomerId'
    },
    {
      class: 'String',
      name: 'RequestId'
    }
  ]
});

foam.CLASS({
  package: 'foam.flinks.model',
  name: 'FlinksAuthRequest',
  extends: 'foam.flinks.model.FlinksRequest',

  documentation: 'model for Flinks authorize request',

  properties: [
    {
      class: 'String',
      name: 'LoginId'
    },
    {
      class: 'String',
      name: 'Username'
    },
    {
      class: 'String',
      name: 'Password'
    },
    {
      class: 'String',
      name: 'Institution'
    },
    {
      class: 'String',
      name: 'Language'
    },
    {
      //key: MFA, value: MFA answer 
      class: 'Map',
      name: 'SecurityResponses'
    },
    {
      class: 'Boolean',
      name: 'save'
    },
    {
      class: 'Boolean',
      name: 'ScheduleRefresh'
    },
    {
      class: 'Boolean',
      name: 'DirectRefresh'
    },
    {
      class: 'Boolean',
      name: 'MostRecentCached'
    },
    {
      class: 'Boolean',
      name: 'WithTransactions'
    },
    {
      class: 'Boolean',
      name: 'WithBalance'
    }
  ]
});

foam.CLASS({
  package: 'foam.flinks.model',
  name: 'FlinksTransactionRequest',
  extends: 'foam.flinks.model.FlinksRequest',
  abstract: 'true',

  documentation: 'model for Flinks account request',

  properties: [
    {
      class: 'Boolean',
      name: 'MostRecent'
    },
    {
      class: 'Boolean',
      name: 'MostRecentCached'
    }
  ]
});

foam.CLASS({
  package: 'foam.flinks.model',
  name: 'FlinksAccountRequest',
  extends: 'foam.flinks.model.FlinksTransactionRequest',
  abstract: 'true',

  documentation: 'model for Flinks Transaction',

  properties: [
    {
      class: 'Boolean',
      name: 'WithBalance'
    },
    {
      class: 'Boolean',
      name: 'WithTransactions'
    }
  ]
});

foam.CLASS({
  package: 'foam.flinks.model',
  name: 'FlinksAccountSummaryRequest',
  extends: 'foam.flinks.model.FlinksAccountRequest',

  documentation: 'model for Flinks Account Summary Request',

  properties: [
    {
      class: 'Boolean',
      name: 'DirectRefresh'
    }
  ]
});

foam.CLASS({
  package: 'foam.flinks.model',
  name: 'RefreshDeltaModel',

  documentation: 'model for Flinks Refresh Delta',

  properties: [
    {
      class: 'String',
      name: 'AccountId'
    },
    {
      class: 'String',
      name: 'TransactionId'
    }
  ]
});

foam.CLASS({
  package: 'foam.flinks.model',
  name: 'FlinksAccountDetailRequest',
  extends: 'foam.flinks.model.FlinksAccountRequest',

  documenatation: 'model for Flinks Account Detail Request',

  properties: [
    {
      class: 'Boolean',
      name: 'WithAccountIdentity'
    },
    {
      class: 'String',
      name: 'DateFrom'
    },
    {
      class: 'String',
      name: 'DateTo'
    },
    {
      class: 'Array',
      of: 'String',
      name: 'AccountsFilter'
    },
    {
      class: 'FObjectArray',
      of: 'foam.flinks.model.RefreshDeltaModel',
      name: 'RefreshDelta'
    },
    {
      class: 'String',
      name: 'DaysOfTransactions'
    }
  ]
});

foam.CLASS({
  package: 'foam.flinks.model',
  name: 'FlinksMulAuthRequest',
  extends: 'foam.flinks.model.FlinksCall',

  documentation: 'model for Flinks multiple authrize request',

  properties: [
    {
      class: 'Array',
      of: 'String',
      name: 'LoginIds'
    }
  ]
});

//instance create when HttpStatusCode is not 200, contain all invalid login info
foam.CLASS({
  package: 'foam.flinks.model',
  name: 'FlinksResponse',
  extends: 'foam.flinks.model.FlinksCall',

  documentation: 'model for Flinks Response',

  properties: [
    {
      class: 'Int',
      name: 'HttpStatusCode'
    },
    {
      class: 'String',
      name: 'FlinksCode'
    },
    {
      class: 'String',
      name: 'Message'
    },
    {
      javaType: 'foam.lib.json.UnknownFObjectArray',
      javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      javaJSONParser: 'new foam.lib.json.UnknownFObjectArrayParser()',
      name: 'Links'
    },
    {
      javaType: 'foam.lib.json.UnknownFObjectArray',
      javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      javaJSONParser: 'new foam.lib.json.UnknownFObjectArrayParser()',
      name: 'ValidationDetails'
    },
    {
      class: 'String',
      name: 'RequestId'
    },
    {
      javaType: 'foam.flinks.model.LoginModel',
      javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      javaJSONParser: 'new foam.lib.json.FObjectParser(foam.flinks.model.LoginModel.class)',
      name: 'Login'
    }
  ]
});

foam.CLASS({
  package: 'foam.flinks.model',
  name: 'FlinksAuthResponse',
  extends: 'foam.flinks.model.FlinksResponse',

  documentation: 'model for Flinks success authorized response',

  properties: [
    {
      class: 'String',
      name: 'Institution'
    },
    {
      class: 'FObjectArray',
      of: 'foam.flinks.model.SecurityChallengeModel',
      name: 'SecurityChallenges'
    }
  ]
});

foam.CLASS({
  package: 'foam.flinks.model',
  name: 'FlinksAccountsSummaryResponse',
  extends: 'foam.flinks.model.FlinksResponse',

  documentation: 'model for Flinks accounts summary response',

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.flinks.model.AccountModel',
      name: 'Accounts'
    },
    {
      class: 'String',
      name: 'Institution'
    }
  ]
});

foam.CLASS({
  package: 'foam.flinks.model',
  name: 'FlinksAccountsDetailResponse',
  extends: 'foam.flinks.model.FlinksResponse',

  documentation: 'model for Flinks accounts detail response',

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.flinks.model.AccountWithDetailModel',
      name: 'Accounts'
    }
  ]
});

//instance when Http status code is 200
foam.CLASS({
  package: 'foam.flinks.model',
  name: 'LoginModel',

  documentation: 'model for Flinks Login',

  properties: [
    {
      class: 'String',
      name: 'Username'
    },
    {
      class: 'Boolean',
      name: 'IsScheduledRefresh'
    },
    {
      class: 'String',
      name: 'LastRefresh'
    },
    {
      class: 'String',
      name: 'Id'
    }
  ]
});

foam.CLASS({
  package: 'foam.flinks.model',
  name: 'SecurityChallengeModel',

  documentation: 'model for Flinks Security Challenges',

  properties: [
    {
      class: 'String',
      name: 'Type'
    },
    {
      class: 'String',
      name: 'Prompt'
    }
  ]
});

foam.CLASS({
  package: 'foam.flinks.model',
  name: 'BalanceModel',

  documentation: 'model for Flinks account balance',

  properties: [
    {
      class: 'Double',
      name: 'Available'
    },
    {
      class: 'Double',
      name: 'Current'
    },
    {
      class: 'Double',
      name: 'Limit'
    }
  ]
});

foam.CLASS({
  package: 'foam.flinks.model',
  name: 'AddressModel',

  documentation: 'model for the Flinks address mode',

  properties: [
    {
      class: 'String',
      name: 'CivicAddress'
    },
    {
      class: 'String',
      name: 'City'
    },
    {
      class: 'String',
      name: 'Province'
    },
    {
      class: 'String',
      name: 'PostalCode'
    },
    {
      class: 'String',
      name: 'POBox'
    }
  ]
});

foam.CLASS({
  package: 'foam.flinks.model',
  name: 'HolderModel',

  documentation: 'model for Flinks account holder',

  properties: [
    {
      class: 'String',
      name: 'Name'
    },
    {
      javaType: 'foam.flinks.model.AddressModel',
      javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      javaJSONParser: 'new foam.lib.json.FObjectParser(foam.flinks.model.AddressModel.class)',
      name: 'Address'
    },
    {
      class: 'String',
      name: 'Email'
    },
    {
      class: 'String',
      name: 'PhoneNumber'
    }
  ]
});

foam.CLASS({
  package: 'foam.flinks.model',
  name: 'AccountTransactionModel',

  documentation: 'model for the Flinks account transaction model',

  properties: [
    {
      class: 'String',
      name: 'Date'
    },
    {
      class: 'String',
      name: 'Code'
    },
    {
      class: 'String',
      name: 'Description'
    },
    {
      class: 'Double',
      name: 'Debit'
    },
    {
      class: 'Double',
      name: 'Credit'
    },
    {
      class: 'Double',
      name: 'Balance'
    },
    {
      class: 'String',
      name: 'Id'
    }
  ]
});


foam.CLASS({
  package: 'foam.flinks.model',
  name: 'AccountModel',

  documentation: 'model for Flinks account model',

  properties: [
    {
      class: 'String',
      name: 'Title'
    },
    {
      class: 'String',
      name: 'AccountNumber'
    },
    {
      class: 'String',
      name: 'Category'
    },
    {
      class: 'String',
      name: 'Currency'
    },
    {
      class: 'String',
      name: 'Id'
    },
    //maybe dangerous if property=null or property={}
    {
      javaType: 'foam.flinks.model.BalanceModel',
      javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      javaJSONParser: 'new foam.lib.json.FObjectParser(foam.flinks.model.BalanceModel.class)',
      name: 'Balance'
    }
  ]
});

foam.CLASS({
  package: 'foam.flinks.model',
  name: 'AccountWithDetailModel',
  extends: 'foam.flinks.model.AccountModel',

  documentation: 'model for the Flinks account with detail model',

  properties: [
    {
      javaType: 'foam.flinks.model.HolderModel',
      javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      javaJSONParser: 'new foam.lib.json.FObjectParser(foam.flinks.model.HolderModel.class)',
      name: 'Holder'
    },
    {
      class: 'FObjectArray',
      of: 'foam.flinks.model.AccountTransactionModel',
      name: 'Transactions'
    },
    {
      class: 'String',
      name: 'TransitNumber'
    },
    {
      class: 'String',
      name: 'InstitutionNumber'
    }
  ]
});

foam.CLASS({
  package: 'foam.flinks.model',
  name: 'AccountStatementModel',

  documentation: 'model for the Flinks account statement model',

  properties: [
    {
      class: 'String',
      name: 'UniqueId'
    },
    {
      class: 'String',
      name: 'FileType'
    },
    {
      class: 'String',
      name: 'Base64Bytes'
    }
  ]
});

foam.CLASS({
  package: 'foam.flinks.model',
  name: 'AccountStatementContainerModel',

  documentation: 'model for the Flinks account statment container model',

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.flinks.model.AccountStatementModel',
      name: 'Statements'
    },
    {
      class: 'String',
      name: 'AccountNumber'
    }
  ]
});