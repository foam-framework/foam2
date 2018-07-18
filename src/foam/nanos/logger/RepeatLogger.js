/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


foam.CLASS({
  package: 'foam.nanos.logger',
  name: 'RepeatLogger',
  extends: 'foam.dao.ProxyDAO',

  requires: [
    'foam.nanos.logger.LogLevel'
  ],

  properties: [
    {
      class: 'String',
      name: 'lastLogMessage',
    },
    {
      class: 'Int',
      name: 'repeatCount'
    },
    {
      class: 'Enum',
      of: 'foam.nanos.logger.LogLevel',
      name: 'lastLogLevel',
      factory: function() { return foam.nanos.logger.LogLevel.INFO; }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `      
      LogMessage log = (LogMessage) obj;
      if ( log.getSeverity().equals(getLastLogLevel()) ) {        
        if ( log.getMessage().equals( getLastLogMessage()) ) {
          setRepeatCount( getRepeatCount() + 1 );       
          return null;
        } else {
          if ( getRepeatCount() > 1 ) {    
            LogMessage repeatLog = new foam.nanos.logger.LogMessage();
            repeatLog.setSeverity( getLastLogLevel() );
            repeatLog.setMessage("The last log was repeated " + getRepeatCount() + " times");
            super.put_(x,repeatLog);
          }          
          setLastLogMessage( log.getMessage() );
          setRepeatCount( 1 );
          return super.put_(x,log);
        }
      } else {
        if ( getRepeatCount() > 1 ) {
          LogMessage repeatLog = new foam.nanos.logger.LogMessage() ;
          repeatLog.setSeverity( getLastLogLevel() );
          repeatLog.setMessage("The last log was repeated " + getRepeatCount() + " times");
          super.put_(x,repeatLog);
        }          
        setLastLogLevel( log.getSeverity() );
        setLastLogMessage( log.getMessage() );
        setRepeatCount( 1 );
        return super.put_(x,log);
      }
      `
    }
  ]
});
