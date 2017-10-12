foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'ClientEmailService',

  properties: [
    {
      class: 'Stub',
      of: 'foam.nanos.notification.email.EmailService',
      name: 'delegate'
    }
  ]
});