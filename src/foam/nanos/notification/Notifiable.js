foam.INTERFACE({
  package: 'foam.nanos.notification',
  name: 'Notifiable',

  documentation: `
    A model should implement this interface if its objects can opt into receiving notifications.
  `,

  methods: [
    {
      name: 'doNotify',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'notification', type: 'foam.nanos.notification.Notification' }
      ]
    }
  ]
});
