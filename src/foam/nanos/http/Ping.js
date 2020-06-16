/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.http',
  name: 'Ping',

  properties: [
    {
      name: 'hostname',
      class: 'String',
      javaFactory: 'return System.getProperty("hostname", "localhost");'
    },
    {
      name: 'startTime',
      class: 'Long',
      factory: function() { return new Date().getTime(); },
      javaFactory: 'return System.currentTimeMillis();'
    },
    {
      name: 'echoTime',
      class: 'Long',
    },
    {
      name: 'endTime',
      class: 'Long',
    },
    {
      name: 'latency',
      class: 'Long',
      factory: function() {
        if ( this.endTime > 0 ) {
          return this.endTime - this.startTime;
        }
        return new Date().getTime() - this.startTime();
      },
      javaFactory: `
      long endTime = getEndTime();
      if ( endTime == 0L ) {
        endTime = System.currentTimeMillis();
      }
      return endTime - getStartTime();
      `
    }
  ],

  // methods: [
  //   {
  //     name: 'toString',
  //     code: function() { return this.hostname + ' : ' + this.latency; },
  //     javaCode: 'return this.getHostname() + " : " + this.getLatency();'
  //   }
  // ]
});
