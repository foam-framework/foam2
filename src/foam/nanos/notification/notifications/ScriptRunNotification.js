/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

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
