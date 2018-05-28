foam.CLASS({
  package: 'foam.nanos.notification.notifications',
  name: 'NotificationScript',
  extends: 'foam.nanos.notification.Notification',

  properties: [
    {
      class: "FObjectProperty",
      name: "script"
    }
  ]
})