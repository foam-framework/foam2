foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'SendEmail',
  implements: [ 'foam.nanos.notification.NotificationSetting'],
  methods: [
    {
      name: 'sendNotification',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'notification', type: 'foam.nanos.notification.Notification' },
      ],
      javaCode: `
      return;
        
      `
    }
  ]
});
  