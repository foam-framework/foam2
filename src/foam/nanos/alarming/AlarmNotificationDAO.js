/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.alarming',
  name: 'AlarmNotificationDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Generate Notification for WARN or ERROR Alarms.`,

  javaImports: [
    'foam.dao.DAO',
    'foam.log.LogLevel',
    'foam.nanos.notification.Notification'
  ],

  properties: [
    {
      name: 'group',
      class: 'Reference',
      of: 'foam.nanos.auth.Group',
      value: 'noc'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      Alarm old = (Alarm) getDelegate().find_(x, ((Alarm)obj).getId());
      Alarm alarm = (Alarm) getDelegate().put_(x, obj);
      if ( ! alarm.getClusterable() ||
           ( old != null &&
             old.getIsActive() == alarm.getIsActive() ) ||
           ( ( old == null ||
               old.getSeverity().getOrdinal() < LogLevel.WARN.getOrdinal() ) &&
               alarm.getSeverity().getOrdinal() < LogLevel.WARN.getOrdinal() ) ) {
        return alarm;
      }

      // create body for non-email notifications
      StringBuilder body = new StringBuilder();
      body.append("name: ");
      body.append(alarm.getName());
      body.append("\\nstatus: ");
      body.append(alarm.getIsActive() ? "Active": "Cleared");
      body.append("\\nseverity: ");
      body.append(alarm.getSeverity().getLabel());
      body.append("\\nhost: ");
      body.append(alarm.getHostname());
      body.append("\\nstarted: ");
      body.append(alarm.getCreated().toString());
      body.append("\\ncleared: ");
      if ( ! alarm.getIsActive() ) {
        body.append(alarm.getLastModified().toString());
      }
      body.append("\\ninfo: ");
      body.append(alarm.getNote());

      Notification notification = new Notification.Builder(x)
        .setGroupId(getGroup())
        .setSeverity(alarm.getSeverity())
        .setEmailName("alarm")
        .setEmailArgs(java.util.Map.of(
                         "alarm.name", alarm.getName(),
                         "alarm.status", alarm.getIsActive() ? "Active" : "Cleared",
                         "alarm.severity", alarm.getSeverity().getLabel(),
                         "alarm.host", alarm.getHostname(),
                         "alarm.started", alarm.getCreated().toString(), // TODO format
                         "alarm.cleared", alarm.getIsActive() ? "" : alarm.getLastModified().toString(),
                         "alarm.note", alarm.getNote()
                       ))
        .setBody(body.toString())
        .build();
     ((DAO) x.get("localNotificationDAO")).put(notification);
      return alarm;
      `
    }
  ]
});
