foam.CLASS({
  package: 'foam.nanos.servlet',
  name: 'ErrorPageMapping',
  properties: [
    {
      class: 'Int',
      name: 'errorCode'
    },
    {
      class: 'String',
      name: 'exceptionType'
    },
    {
      class: 'String',
      name: 'location'
    }
  ]
});
