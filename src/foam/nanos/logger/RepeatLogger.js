/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 
foam.CLASS({
  package: 'foam.nanos.logger',
  name: 'DiscardLogger',
  extends: 'foam.nanos.logger.ProxyLogger',
  requires: [
    'foam.nanos.logger.LogLevel',
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
          javaType: 'String'
          },
          {
            name: 'setLastLogLevel',
            javaType: 'Boolean'
          },
          {
            name: 'args',
            javaType: 'Object...',
          },

        ],
        javaReturns: 'void',
        javaCode: `
        switch ( logLevelName ) {
          case "debug": {
              setRepeatCount(1);
              setLastUniqueObject(args);
              getDelegate().debug(args);  
              if (setLastLogLevel){
                setLastLogLevel(LogLevel.DEBUG);
              break;
          }
              }
              case "info":  {
                setRepeatCount(1);
                setLastUniqueObject(args);
                getDelegate().info(args);  
                if (setLastLogLevel){
                  setLastLogLevel(LogLevel.INFO);
                }
                break;
              }
              case "warning":  {
                setRepeatCount(1);
                setLastUniqueObject(args);
                getDelegate().warning(args);  
                if (setLastLogLevel){
                  setLastLogLevel(LogLevel.WARNING);
                }
                break;
                
                }     
                case "error":  {
                  setRepeatCount(1);
                  setLastUniqueObject(args);
                  getDelegate().error(args);  
                  if (setLastLogLevel){
                    setLastLogLevel(LogLevel.ERROR);
                  }
                break;
                }
              }
    `  
    },
    {
      name: 'logLastLogRepeats',
   
      javaReturns: 'void',
      javaCode: 
      `
      switch ( getLastLogLevel() ) {
        case DEBUG: {
          getDelegate().debug("The last log was repeated " + getRepeatCount() + " times" );
          break;
        }
        case INFO:  {
          getDelegate().info("The last log was repeated "+ getRepeatCount()  + " times" );
          break;
        }
        case WARNING:  {
          getDelegate().warning("The last log was repeated "+ getRepeatCount()  + " times" );
          break;      
        }        
        case ERROR:  {
          getDelegate().error("The last log was repeated " + getRepeatCount() + " times" );
          break;
        }
      }     
      `


    },

    {
      name: 'repeatLogConstructor',
      args: [ 
        {
        name: 'logLevelName',
        javaType: 'String'
        },
        {
          name: 'args',
          javaType: 'Object...',
        }
      ],
      javaReturns: 'void',
      javaCode: `
        if (! getLastLogLevel().toString().equalsIgnoreCase(logLevelName)){
              if (getRepeatCount() > 1){
                logLastLogRepeats();   
              }
              newLogHandler(logLevelName,true,args);
              return;
            };
            

        if ( getLastUniqueObject() == null){
          newLogHandler(logLevelName,false,args);
          }
            else {
                Object[] o = (Object[]) getLastUniqueObject();
                if ( ! (args.length == o.length ) ){
                  // Different Message
                  if (getRepeatCount() > 1){
                    logLastLogRepeats();   
                  }
                  newLogHandler(logLevelName,false,args);
                }
             
               else{
                  for ( int i = 0; i < args.length; i ++) {
                    if  ( ! ( args[i].equals(o[i]) && !(args[i] instanceof Exception) )  ) {
                      if (getRepeatCount() > 1){
                        logLastLogRepeats();   
                      }
                      newLogHandler(logLevelName,false,args);
                    return;        
                    } 
                  }
                  setRepeatCount(getRepeatCount()+1);
                }
              }
            `
    },
    {
      name: 'debug',
      args:[
        {
          name: 'args',
          javaType: 'Object...',
        }
      ],
      javaReturns: 'void',
      javaCode: `
      String logLevelName = new String("debug");
      repeatLogConstructor(logLevelName,args);
      `
    
    },
    {
      name: 'info',
      args:[
        {
          name: 'args',
          javaType: 'Object...',
        }
      ],
      javaReturns: 'void',
      javaCode: `
      String logLevelName = new String("info");
      repeatLogConstructor(logLevelName,args);
      `
    
    },

    {
      name: 'warning',
      args:[
        {
          name: 'args',
          javaType: 'Object...',
        }
      ],
      javaReturns: 'void',
      javaCode: `
      String logLevelName = new String("warning");
      repeatLogConstructor(logLevelName,args);
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
      String logLevelName = new String("error");
      repeatLogConstructor(logLevelName,args);
      `
    }
  ]
});
 
// abstract out logic for when a new error/ old error is encountered
// implement hashcode to check instead of equals