foam.CLASS({
    package: 'foam.support.model',
    name: 'SupportEmail',

    documentation: 'Support Email',
    
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