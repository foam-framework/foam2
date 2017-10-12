foam.INTERFACE({
  package: 'foam.nanos.notification.email',
  name: 'EmailService',
  extends: 'foam.nanos.NanoService',

  methods: [
    {
      name: 'sendEmail',
      javaReturns: 'void',
      returns: 'Promise',
      javaThrows: [
        'javax.mail.MessagingException'
      ],
      args: [
        {
          name: 'emailMessage',
          javaType: 'foam.nanos.notification.email.EmailMessage'
        }
      ]
    }
  ]
});