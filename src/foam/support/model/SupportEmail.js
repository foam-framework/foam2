foam.CLASS({
  package: 'foam.support.model',
  name: 'SupportEmail',

  properties:[
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'email'
    },
    {
      class: 'String',
      name: 'status'
    },
    {
      class: 'Date',
      name: 'connectedTime'
    }
  ]
});