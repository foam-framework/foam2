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
      class: 'Password',
      name: 'password'
    },
    {
      class: 'String',
      name: 'status',
      factory: function(){
        return 'Pending'
      }
    },
    {
      class: 'DateTime',
      name: 'connectedTime'
    }
  ]
});