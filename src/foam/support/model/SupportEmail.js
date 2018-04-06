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
      name: 'status',
      factory: function(){
        return 'Pending'
      }
    },
    {
      class: 'Date',
      name: 'connectedTime'
    },
    {
      class: 'Long',
      name: 'userId'
    },
    {
      class: 'Password',
      name: 'password'
    }
  ]
});