foam.CLASS({
  package: 'foam.flinks.model',
  name: 'Flinks',

  documentation: 'model for Flinks',

  properties:[
    {
      class: 'String',
      name: 'CustomerId'
    }
  ]
});

foam.CLASS({
  package: 'foam.flinks.model',
  name: 'FlinksCall',
  extends: 'foam.flinks.model.Flinks',
  documentation: 'model for Flinks Call',

  properties: [
    {
      class: 'String',
      name: 'RequestId'
    }
  ]
});

foam.CLASS({
  package: 'foam.flinks.model',
  name: 'FlinksAuthRequest',
  extends: 'foam.flinks.model.FlinksCall',

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
  name: 'FlinksTransaction',
  extends: 'foam.flinks.model.FlinksCall',

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
  name: 'FlinksAccount',
  extends: 'foam.flinks.model.FlinksTransaction',

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
  extends: 'foam.flinks.model.FlinksAccount',

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
  name: 'FlinksAccountDetailRequest',
  extends: 'foam.flinks.model.FlinksAccount',

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
      class: 'Map',
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
  extends: 'foam.flinks.model.Flinks',

  documentation: 'model for Flinks multiple authrize request',

  properties: [
    {
      class: 'Array',
      of: 'String',
      name: 'LoginIds'
    }
  ]
});