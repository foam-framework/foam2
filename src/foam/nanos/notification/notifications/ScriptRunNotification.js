foam.CLASS({
  package: 'foam.nanos.notification.notifications',
  name: 'ScriptRunNotification',
  extends: 'foam.nanos.notification.Notification',

  properties: [
    {
      class: "String",
      name: "scriptId"
    }
  ]
})