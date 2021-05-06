/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.alarming',
  name: 'Alarm',

  documentation: 'A config for OM on when an alarm should be raised',

  implements: [
    'foam.mlang.Expressions',
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.medusa.Clusterable'
  ],

  tableColumns: [
    'name',
    'hostname',
    'severity',
    'isActive',
    'lastModified',
    'stop',
    'start'
  ],

  requires: [
    'foam.dao.AbstractDAO',
    'foam.nanos.alarming.AlarmReason',
    'foam.nanos.alarming.MonitoringReport'
  ],

  imports: [
    'alarmDAO',
    'monitoringReportDAO'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  public Alarm(String name) {
    this(name, true);
  }

  public Alarm(String name, boolean isActive) {
    setName(name);
    setIsActive(isActive);
  }

  public Alarm(String name, AlarmReason reason) {
    setName(name);
    setIsActive(true);
    setReason(reason);
  }

  public Alarm(String name, foam.log.LogLevel severity, AlarmReason reason) {
    setName(name);
    setIsActive(true);
    setSeverity(severity);
    setReason(reason);
  }
          `
        }));
      }
    }
  ],

  ids: [
    'name',
    'hostname'
  ],

  properties: [
    {
      class: 'String',
      name: 'name',
      createVisibility: 'RW',
      updateVisibility: 'RO',
      tableWidth: 200
    },
    {
      class: 'String',
      name: 'hostname',
      visibility: 'RO',
      javaFactory: 'return System.getProperty("hostname", "localhost");'
    },
    {
      class: 'Enum',
      of: 'foam.log.LogLevel',
      name: 'severity',
      value: 'WARN'
    },
    {
      class: 'Boolean',
      name: 'isActive'
    },
    {
      class: 'Enum',
      of: 'foam.nanos.alarming.AlarmReason',
      name: 'reason',
      value: 'UNSPECIFIED',
      createVisibility: 'RW',
      updateVisibility: 'RO'
    },
    {
      class: 'DateTime',
      name: 'created',
      visibility: 'RO'
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      label: 'Since',
      visibility: 'RO',
      tableWidth: 150,
      includeInDigest: false,
      storageOptional: true
    },
    {
      class: 'String',
      name: 'note',
      view: { class: 'foam.u2.tag.TextArea' },
      createVisibility: 'RW',
      updateVisibility: 'RO'
    },
    {
      class: 'Boolean',
      name: 'clusterable',
      value: false,
      includeInDigest: false
    }
  ],

  actions: [
    {
      name: 'stop',
      label: 'Stop Alarm',
      code: function() {
        let self = this;
        this.note = '';
        this.isActive = false;
        this.reason = this.AlarmReason.NONE;
        this.alarmDAO.put(this);
        this.alarmDAO.cmd(this.AbstractDAO.RESET_CMD);

        this.monitoringReportDAO.find(this.EQ(this.MonitoringReport.NAME, this.name)).then((monitorReport)=> {
          if ( monitorReport ) {
            monitorReport.startCount = 0;
            monitorReport.endCount = 0;
            monitorReport.timeoutCount = 0;
            self.monitoringReportDAO.put(monitorReport);
          }
        });
      }
    },
    {
      name: 'start',
      label: 'Start Alarm',
      code: function() {
        this.isActive = true;
        this.reason = this.AlarmReason.MANUAL;
        this.alarmDAO.put(this);
        this.alarmDAO.cmd(this.AbstractDAO.RESET_CMD);
      }
    }
  ]
});
