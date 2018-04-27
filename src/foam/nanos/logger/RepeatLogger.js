/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
    package: 'foam.nanos.logger',
    name: 'RepeatLogger',
    extends: 'foam.nanos.logger.ProxyLogger',

    documentation: `takes a stream of log objects, passes unique objects to 
                    proxylogger, otherwise counts and prints number of repeats`,
   
    properties: [
      {
        class: 'Object',
        name: 'lastUniqueObject',
      },
      {
        class: 'int',
        name: 'repeatCount',
      }
    ],
  
    methods: [
      {
        name: 'infoCheckRepeats',
        args: [
          {
            name: 'args',
            javaType: 'Object...'
          }
        ],
        javaReturns: 'void',
        javaCode: `
          if ( ! repeatedLog(lastUniqueObject,args) ) {
            if (repeatCount > 1){
              getDelegate.info("the last message was repeated" + repeatCount + "times")
            }
          repeatCount = 1
          lastUniqueObject = args
          getDelegate().info(args)
          else {
            repeatCount++
            }
          `
      },
      {....
      },
      {
        name: 'repeatedLog',
        args:[
          {
            class: 'Object...',
            name: 'Object1'
          },
          {
            class: 'Object...',
            name: 'Object2'
          }
        ],
        javaReturns: 'boolean',
        javaCode: `
        return (Object1.length == Object2.length) || 
           (Object1.hashCode() == Object2.hashCode())
        `

      }
    ]
  
  });
  
  