foam.CLASS({
  package: 'foam.support.model',
  name: 'Message',

  documentation: 'Message Model Class and Properties',

  properties: [
    {
      class: 'Long',
      name: 'senderId'
    },
    {
      class: 'Long',
      name: 'receiverId'
    },
    {
      class: 'Date',
      name: 'dateCreated'
    },
    {
      class: 'String',
      name: 'message'
    },
    {
      class: 'Long',
      name: 'ticketId'
    }
  ]
});