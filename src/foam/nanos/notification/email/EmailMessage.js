foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'EmailMessage',

  documentation: 'Email message',

  properties: [
    {
      class: 'String',
      name: 'from'
    },
    {
      class: 'String',
      name: 'replyTo'
    },
    {
      class: 'StringArray',
      name: 'to'
    },
    {
      class: 'StringArray',
      name: 'cc',
    },
    {
      class: 'StringArray',
      name: 'bcc'
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