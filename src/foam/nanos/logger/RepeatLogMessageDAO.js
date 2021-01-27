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
    'foam.log.LogLevel'
  ],

  properties: [
    {
      name: 'previous',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.LogMessage'
    },
    {
      class: 'Int',
      name: 'repeatCount'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      LogMessage log = (LogMessage) obj;
      LogMessage previous = getPrevious();
      if ( previous == null ) {
        setPrevious(log);
        return super.put_(x, log);
      }
      if ( log.getSeverity().equals(previous.getSeverity()) ) {
        if ( log.getMessage().equals(previous.getMessage()) ) {
          setRepeatCount( getRepeatCount() + 1 );
          return null;
        } else {
          if ( getRepeatCount() > 1 ) {
            LogMessage repeatLog = new foam.nanos.logger.LogMessage();
            repeatLog.copyFrom(previous);
            repeatLog.clearId();
            repeatLog.setMessage("The previous log was repeated " + getRepeatCount() + " times");
            super.put_(x, repeatLog);
          }
          setPrevious(log);
          setRepeatCount(1);
          return super.put_(x, log);
        }
      } else {
        if ( getRepeatCount() > 1 ) {
          LogMessage repeatLog = new foam.nanos.logger.LogMessage() ;
          repeatLog.copyFrom(previous);
          repeatLog.clearId();
          repeatLog.setMessage("The previous log was repeated " + getRepeatCount() + " times");
          super.put_(x,repeatLog);
        }
        setPrevious(log);
        setRepeatCount(1);
        return super.put_(x,log);
      }
      `
    }
  ]
});
