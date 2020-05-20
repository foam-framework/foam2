foam.CLASS({
  package: 'foam.nanos.alarming',
  name: 'AlarmAndMonitoring',

  documentation: 'Raises an alarm if certain conditions are met',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'java.util.Date',
    'foam.nanos.analytics.Candlestick',
    'foam.nanos.logger.Logger',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          DAO configDAO = (DAO) x.get("alarmConfigDAO");
          MonitoringReport report = (MonitoringReport) obj;
          AlarmConfig config = (AlarmConfig) configDAO.find(EQ(AlarmConfig.NAME, report.getName()));
          
          if ( config == null || ! config.getEnabled() ) {
            return;
          }
          DAO omDAO = (DAO) x.get("om1minDAO");
          Date currentCloseTime = new Date();
          currentCloseTime.setSeconds(0);
          Candlestick receiveResponses = (Candlestick) omDAO.orderBy(new foam.mlang.order.Desc(Candlestick.CLOSE_TIME)).find(
            EQ(Candlestick.KEY, config.getPostRequest())
          );
          Candlestick sentRequest = (Candlestick) omDAO.orderBy(new foam.mlang.order.Desc(Candlestick.CLOSE_TIME)).find(
            EQ(Candlestick.KEY, config.getPreRequest())
          );
      
          Candlestick timeout = (Candlestick) omDAO.orderBy(new foam.mlang.order.Desc(Candlestick.CLOSE_TIME)).find(
            EQ(Candlestick.KEY, config.getTimeOutRequest())
          );
          DAO alarmDAO = (DAO) x.get("alarmDAO");
          Alarm alarm = (Alarm) alarmDAO.find(EQ(Alarm.NAME, config.getName()));
          if ( alarm == null ) {
            alarm = new Alarm.Builder(x)
              .setName(config.getName())
              .setIsActive(false)
              .build();
          } else {
            alarm = (Alarm) alarm.fclone();
          }
          boolean updateAlarm = false;
          // check to see if the sent candlestick is the latest one
          if ( sentRequest != null && Math.abs(sentRequest.getCloseTime().getTime() - currentCloseTime.getTime()) < config.getCycleTime() ) {
            updateAlarm = true;
            report.setStartCount(report.getStartCount() + (int) sentRequest.getCount());
          }
          // check to see if the response candlestick is the latest one
          if ( receiveResponses != null && Math.abs(receiveResponses.getCloseTime().getTime() - currentCloseTime.getTime()) < config.getCycleTime() ) {
              updateAlarm = true;
              report.setEndCount(report.getEndCount() + (int) receiveResponses.getCount());
          }
          if ( config.getMonitorType() == MonitorType.CREDENTIALS  && updateAlarm ) {
            alarm = AlarmAndMonitoring.this.checkCredentials(x, config, report, alarm);
            alarmDAO.put(alarm);
            return;
          }
          if ( timeout != null && (Math.abs(timeout.getCloseTime().getTime() - currentCloseTime.getTime()) < config.getCycleTime()) ) {
              updateAlarm = true;
              report.setTimeoutCount(report.getTimeoutCount() + (int) timeout.getCount());
          }
          if ( ! updateAlarm ) {
            return;
          }
          if ( report.getTimeoutCount() != 0 && report.getStartCount() != 0  && ((float) report.getTimeoutCount() /(float) report.getStartCount()) > (float) config.getTimeoutValue() / 100 ) {
            if ( ! alarm.getIsActive() || !( alarm.getReason() == AlarmReason.TIMEOUT) ) {
              alarm.setReason(AlarmReason.TIMEOUT);
              alarm.setIsActive(true);
            }
          } else if ( report.getStartCount() != 0  && report.getEndCount() != 0  && ((float) report.getEndCount() /(float) report.getStartCount()) < (float) config.getAlarmValue() / 100 ) {
            if ( ! alarm.getIsActive() || !( alarm.getReason() == AlarmReason.CONGESTION) ) {        
              alarm.setReason(AlarmReason.CONGESTION);
              alarm.setIsActive(true);
            }
          } else {
            if ( alarm.getIsActive() ) {
              report.setStartCount(0);
              report.setEndCount(0);
              report.setTimeoutCount(0);
              alarm.setReason(AlarmReason.NONE);
              alarm.setIsActive(false);
            }
          }
          alarmDAO.put(alarm);
        }
      }, "Alarm And Monitoring");
      `
    },
    {
      name: 'checkCredentials',
      type: 'foam.nanos.alarming.Alarm',
      args: [
        {
          type: 'Context',
          name: 'x',
        },
        {
          type: 'foam.nanos.alarming.AlarmConfig',
          name: 'config'
        },
        {
          type: 'foam.nanos.alarming.MonitoringReport',
          name: 'report',
        },
        {
          type: 'foam.nanos.alarming.Alarm',
          name: 'alarm'
        }
      ],
      javaCode: `
      if ( report.getStartCount() != 0  && report.getEndCount() != 0  && ((float) report.getEndCount() /(float) report.getStartCount()) < (float) config.getAlarmValue() / 100 ) {
        if ( ! alarm.getIsActive() || !( alarm.getReason() == AlarmReason.CREDENTIALS) ) {        
          alarm.setReason(AlarmReason.CREDENTIALS);
          alarm.setIsActive(true);
        }
      }  else if ( report.getStartCount() != 0  && report.getEndCount() == 0  ) {
        alarm.setReason(AlarmReason.CREDENTIALS);
        alarm.setIsActive(true);
      } else {
        if ( alarm.getIsActive() ) {
          report.setStartCount(0);
          report.setEndCount(0);
          report.setTimeoutCount(0);
          alarm.setReason(AlarmReason.NONE);
          alarm.setIsActive(false);
        }
      }
      return alarm;
      `
    }
  ]

});
