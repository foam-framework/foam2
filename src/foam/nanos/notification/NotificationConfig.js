foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'NotificationConfig',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'FObjectArray',
      of: 'SendNotificationSetting',
      name: 'notificationSettings'
    }
  ]
});
