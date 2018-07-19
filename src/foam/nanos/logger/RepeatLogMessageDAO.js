/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


foam.CLASS({
  package: 'foam.nanos.logger',
  name: 'RepeatLogMessageDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `catches and consolidates repeated identical log messages`,

  requires: [
    'foam.nanos.logger.LogLevel'
  ],

  properties: [
    {
      class: 'String',
      name: 'previousLogMessage',
    },
    {
      class: 'Int',
      name: 'repeatCount'
    },
    {
      class: 'Enum',
      of: 'foam.nanos.logger.LogLevel',
      name: 'previousLogSeverity',
      factory: function() { return foam.nanos.logger.LogLevel.INFO; }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `      
      LogMessage log = (LogMessage) obj;
      if ( log.getSeverity().equals(getPreviousLogSeverity()) ) {        
        if ( log.getMessage().equals(getPreviousLogMessage()) ) {
          setRepeatCount( getRepeatCount() + 1 );       
          return null;
        } else {
          if ( getRepeatCount() > 1 ) {    
            LogMessage repeatLog = new foam.nanos.logger.LogMessage();
            repeatLog.setSeverity( getPreviousLogSeverity() );
            repeatLog.setMessage("The previous log was repeated " + getRepeatCount() + " times");
            super.put_(x, repeatLog);
          }          
          setPreviousLogMessage( log.getMessage() );
          setRepeatCount(1);
          return super.put_(x, log);
        }
      } else {
        if ( getRepeatCount() > 1 ) {
          LogMessage repeatLog = new foam.nanos.logger.LogMessage() ;
          repeatLog.setSeverity( getPreviousLogSeverity() );
          repeatLog.setMessage("The previous log was repeated " + getRepeatCount() + " times");
          super.put_(x,repeatLog);
        }          
        setPreviousLogSeverity( log.getSeverity() );
        setPreviousLogMessage( log.getMessage() );
        setRepeatCount(1);
        return super.put_(x,log);
      }
      `
    }
  ]
});
