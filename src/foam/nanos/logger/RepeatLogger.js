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
      name: 'info',
      args:[
        {
          name: 'args',
          javaType: 'Object...',
        }
      ],
      javaReturns: 'void',
      javaCode: `
      if ( getLastLogLevel() != LogLevel.INFO){
          if (getRepeatCount() > 1){
            switch ( getLastLogLevel() ) {
              case DEBUG: {
                getDelegate().debug("previous count repeated " + getRepeatCount() +" times");
                break;
              }
              case INFO:  {
                getDelegate().info("previous count repeated " + getRepeatCount() +" times");
                break;
              }
              case WARNING:  {
                getDelegate().warning("previous count repeated " + getRepeatCount() +" times");
                break;      
              }        
              case ERROR:  {
                getDelegate().error("previous count repeated " + getRepeatCount() +" times");
                break;
              }
            }      
          setRepeatCount(1);
          setLastUniqueObject(args);
          setLastLogLevel(LogLevel.INFO);
          getDelegate().info(args);          
          return;
        };
        }


        if ( getLastUniqueObject() == null){
          setLastUniqueObject(args);
          setRepeatCount(1);  
          getDelegate().info(args);

        }


        else {
          Object[] o = (Object[]) getLastUniqueObject();
          if ( ! (args.length == o.length ) ){
            // Different Message
            if (getRepeatCount() > 1){
              getDelegate().info("previous count repeated " + getRepeatCount() +" times");             
            }
            setLastUniqueObject(args);
            setRepeatCount(1);        
            getDelegate().info(args);
            // System.err.println(getLastUniqueObject());
          }
          else{
            for ( int i = 0; i < args.length; i ++) {
              if  ( ! ( args[i].equals(o[i]) && !(args[i] instanceof Exception) )  ) {
                if (getRepeatCount() > 1){
                  getDelegate().info("previous count repeated " + getRepeatCount() +" times");             
                }
              setLastUniqueObject(args);
              setRepeatCount(1);
              getDelegate().info(args);
              return;        
              } 
            }
            setRepeatCount(getRepeatCount()+1);
          }
        }
      
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
      if ( getLastLogLevel() != LogLevel.ERROR){
          if (getRepeatCount() > 1){
            switch ( getLastLogLevel() ) {
              case DEBUG: {
                getDelegate().debug("previous count repeated " + getRepeatCount() +" times");
                break;
              }
              case INFO:  {
                getDelegate().info("previous count repeated " + getRepeatCount() +" times");
                break;
              }
              case WARNING:  {
                getDelegate().warning("previous count repeated " + getRepeatCount() +" times");
                break;     
              }         
              case ERROR:  {
                getDelegate().error("previous count repeated " + getRepeatCount() +" times");
                break;
              }
            }      
          setRepeatCount(1);
          setLastUniqueObject(args);
          setLastLogLevel(LogLevel.ERROR);
          getDelegate().error(args);
          return;          
          };
        }


        if ( getLastUniqueObject() == null){
          setLastUniqueObject(args);
          setRepeatCount(1);  
          getDelegate().error(args);

        }


        else {
          Object[] o = (Object[]) getLastUniqueObject();
          if ( ! (args.length == o.length ) ){
            // Different Message
            if (getRepeatCount() > 1){
              getDelegate().error("previous count repeated " + getRepeatCount() +" times");             
            }
            setLastUniqueObject(args);
            setRepeatCount(1);        
            getDelegate().error(args);
            // System.err.println(getLastUniqueObject());
          }
          else{
            for ( int i = 0; i < args.length; i ++) {
              if  ( ! ( args[i].equals(o[i]) && !(args[i] instanceof Exception) )  ) {
                if (getRepeatCount() > 1){
                  getDelegate().error("previous count repeated " + getRepeatCount() +" times");             
                }
              setLastUniqueObject(args);
              setRepeatCount(1);
              getDelegate().error(args);
              return;        
              } 
            }
            setRepeatCount(getRepeatCount()+1);
          }
        }
      
       `
    }


  ]
});
 
// abstract out logic for when a new error/ old error is encountered
// implement hashcode to check instead of equals