foam.CLASS({
  package: 'foam.nanos.alarming',
  name: 'MonitoringReport',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name',
      documentation: 'Name of the om'
    },
    {
      class: 'Int',
      name: 'startCount',
    },
    {
      class: 'Int',
      name: 'endCount',
    },
    {
      class: 'Int',
      name: 'timeoutCount',
    }
  ],

});
