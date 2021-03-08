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
    'foam.nanos.notification.Notification',
    'java.util.HashMap'
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

      if ( ! alarm.getHostname().equals(System.getProperty("hostname", "localhost")) ) {
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

      HashMap args = new HashMap();
      args.put("alarm.name", alarm.getName());
      args.put("alarm.status", alarm.getIsActive() ? "Active" : "Cleared");
      args.put("alarm.severity", alarm.getSeverity().getLabel());
      args.put("alarm.host", alarm.getHostname());
      args.put("alarm.started", alarm.getCreated().toString());
      args.put("alarm.cleared", alarm.getIsActive() ? "" : alarm.getLastModified().toString());
      args.put("alarm.note", alarm.getNote());

      Notification notification = new Notification.Builder(x)
        .setGroupId(getGroup())
        .setSeverity(alarm.getSeverity())
        .setEmailName("alarm")
        .setEmailArgs(args)
        .setBody(body.toString())
        .build();
     ((DAO) x.get("localNotificationDAO")).put(notification);
      return alarm;
      `
    }
  ]
});
