/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


foam.CLASS({
  package: 'foam.nanos.logger',
  name: 'RepeatLogger',
  extends: 'foam.nanos.logger.ProxyLogger',
  requires: [
    'foam.nanos.logger.LogLevel'
  ],

  properties: [
    {
      class: 'Object',
      name: 'lastUniqueObject',
      value: null
    },
    {
      class: 'Int',
      name: 'repeatCount',
      value: 0
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
      name: 'newLogHandler',
      args: [ 
        {
          name: 'logLevelName',
          javaType: 'Enum'
        },
        {
          name: 'updateLastLogLevel',
          javaType: 'Boolean'
        },
        {
          name: 'args',
          javaType: 'Object...'
        },
      ],
      javaReturns: 'void',
      javaCode: `
  setRepeatCount(1);
  setLastUniqueObject(args);
  switch ( LogLevel.values()[logLevelName.ordinal()] ) {
    case DEBUG: 
      getDelegate().debug(args);  
      if ( updateLastLogLevel ){
        setLastLogLevel(LogLevel.DEBUG);
      }
      break;
    case INFO:
      getDelegate().info(args);  
      if ( updateLastLogLevel ){
        setLastLogLevel(LogLevel.INFO);
      }
      break;
    case WARNING:
      getDelegate().warning(args);  
      if ( updateLastLogLevel ){
        setLastLogLevel(LogLevel.WARNING);
      }
      break;    
    case ERROR:
      getDelegate().error(args);  
      if ( updateLastLogLevel ){
        setLastLogLevel(LogLevel.ERROR);
      }
      break;
  }
`  
    },
    {
      name: 'logLastLogRepeats',
      javaReturns: 'void',
      javaCode: 
      `
  String logCountMessage = "The last log was repeated " + getRepeatCount() + " times" ; 
  
  switch ( getLastLogLevel() ) {
    case DEBUG:
      getDelegate().debug( logCountMessage );
      break;
    case INFO:
      getDelegate().info( logCountMessage );
      break;
    case WARNING: 
      getDelegate().warning( logCountMessage );
      break;             
    case ERROR: 
      getDelegate().error( logCountMessage );
      break;
  }     
`
    },
    {
      name: 'repeatLogFilter',
      args: [ 
        {
          name: 'logLevelName',
          javaType: 'Enum'
        },
        {
          name: 'args',
          javaType: 'Object...'
        }
      ],
      synchronized: true,
      javaReturns: 'void',
      javaCode: `
  if ( getLastLogLevel().ordinal() != logLevelName.ordinal() ) {
    if ( getRepeatCount() > 1 ) {
      logLastLogRepeats();   
    }
    newLogHandler(logLevelName, true, args);
    return;
  };
  
  if ( getLastUniqueObject() == null ) {
    newLogHandler(logLevelName,false,args);
  } else {
    Object[] o = (Object[]) getLastUniqueObject();
    if ( ! (args.length == o.length ) ) {
      if ( getRepeatCount() > 1 ) {
        logLastLogRepeats();   
      }
      newLogHandler(logLevelName,false,args);
    } else {
      for ( int i = 0 ; i < args.length ; i++ ) {
        if ( ! ( args[i].equals(o[i]) && !(args[i] instanceof Exception) ) ) {
          if ( getRepeatCount() > 1 ) {
            logLastLogRepeats();   
          }
          newLogHandler(logLevelName, false, args);
          return;        
        } 
      }
      setRepeatCount( getRepeatCount() + 1 );
    }
  }
`
    },
    {
      name: 'debug',
      args:[
        {
          name: 'args',
          javaType: 'Object...'
        }
      ],
      javaReturns: 'void',
      javaCode: `
  Enum logLevelName = LogLevel.DEBUG;
  repeatLogFilter(logLevelName, args);
  `   
    },
    {
      name: 'info',
      args:[
        {
          name: 'args',
          javaType: 'Object...'
        }
      ],
      javaReturns: 'void',
      javaCode: `
  Enum logLevelName = LogLevel.INFO;
  repeatLogFilter(logLevelName, args);
`
    },
    {
      name: 'warning',
      args:[
        {
          name: 'args',
          javaType: 'Object...'
        }
      ],
      javaReturns: 'void',
      javaCode: `
  Enum logLevelName = LogLevel.WARNING;
  repeatLogFilter(logLevelName, args);
`
    },
    {
      name: 'error',
      args:[
        {
          name: 'args',
          javaType: 'Object...',
        }
      ],
      javaReturns: 'void',
      javaCode: `
  Enum logLevelName = LogLevel.ERROR;
  repeatLogFilter(logLevelName, args);
`
    }
  ]
});
