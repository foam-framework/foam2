foam.CLASS({
  package: 'foam.flinks.model',
  name: 'FlinksAuthRequest',

  documentation: 'Flinks request infomation.',

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
      name: 'RequestId'
    },
    {
      class: 'String',
      name: 'Language'
    },
    {
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
    },
    {
      class: 'String',
      name: 'CustomerId'
    }
  ]
});