foam.INTERFACE({
  package: 'foam.nanos.notification',
  name: 'NotificationSetting',
  methods: [
    {
      name: 'sendNotification',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'user', type: 'foam.nanos.auth.User' },
        { name: 'notification', type: 'foam.nanos.notification.Notification' }
      ]
    }
  ]
});
