/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 
foam.CLASS({
  package: 'foam.nanos.logger',
  name: 'DiscardLogger',
  extends: 'foam.nanos.logger.ProxyLogger',
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
        if ( getLastUniqueObject() == null){
          setLastUniqueObject(args);
          setRepeatCount(1);  
          getDelegate().info(args);
          System.err.println(getRepeatCount());
        }
        else {
          Object[] o = (Object[]) getLastUniqueObject();
          if ( ! (args.length == o.length ) ){
            if (getRepeatCount() > 1){
              getDelegate().info("previous count repeated " + getRepeatCount() +" times");             
            }
            setLastUniqueObject(args);
            setRepeatCount(1);        
            getDelegate().info(args);
            System.err.println(getLastUniqueObject());
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
    }

  ]
});
 
// abstract out logic for when a new error/ old error is encountered
// implement hashcode to check instead of equals