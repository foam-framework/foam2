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
        name: 'last_unique_object',
      },
      {
        class: 'Int',
        name: 'repeat_count',
      }
    ],
  
    methods: [
      {
        name: 'check_repeats',
        args: [
          {
            name: 'new_object',
            javaType: 'Object'
          }
        ],
        javaReturns: 'void',
        javaCode: `
          if ( len(new_object) != len(luo) OR hashcode(new_object)!= hc(luo) ) {
            // checking if object is new should be its own function maybe?
            print "repeated #{repeat_count} times"
            repeat_count = 0
            last_unique_object = new_object
            pass new_object to getDelegate()
            }
          else( its a repeat ) {
            repeat_count += 1
            }
          `
      }
    ]
  
  });
  
  