foam.CLASS({
  package: 'foam.nanos.alarming',
  name: 'Alarm',

  documentation: 'A config for OM on when an alarm should be raised',

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.mlang.Expressions',
    'foam.nanos.auth.LastModifiedAware',
  ],

  tableColumns: [
    'name',
    'hostname',
    'lastModified',
    'isActive',
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

  properties: [
    {
      class: 'Long',
      name: 'id',
      visibility: 'RO',
    },
    {
      class: 'String',
      name: 'name',
    },
    {
      class: 'String',
      name: 'hostname',
      visibility: 'RO',
      javaFactory: 'return System.getProperty("hostname", "localhost");'
    },
    {
      class: 'Boolean',
      name: 'isActive'
    },
    {
      class: 'Enum',
      of: 'foam.nanos.alarming.AlarmReason',
      name: 'reason'
    },
    {
      class: 'DateTime',
      name: 'created',
      visibility: 'RO'
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'note',
      view: { class: 'foam.u2.tag.TextArea' }
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
