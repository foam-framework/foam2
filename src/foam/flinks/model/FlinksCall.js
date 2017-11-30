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
      class: 'String',
      name: 'RequestId'
    },
    {
      javaType: 'foam.lib.json.UnknownFObject',
      javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      javaJSONParser: 'new foam.lib.json.UnknownFObjectParser()',
      name: 'SecurityChallenges'
    },
    {
      class: 'String',
      name: 'Institution'
    }
  ]
})