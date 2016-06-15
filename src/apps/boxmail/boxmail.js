foam.CLASS({
  package: 'boxmail',
  name: 'Message',
  extends: 'foam.box.Message',

  properties: [
    {
      name: 'id'
    },
    {
      class: 'String',
      name: 'subject'
    },
    {
      class: 'String',
      name: 'body'
    }
  ]
});
