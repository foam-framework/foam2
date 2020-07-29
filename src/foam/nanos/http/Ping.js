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
      name: 'pm',
      class: 'FObjectProperty',
      of: 'foam.nanos.pm.PM'
    },
    // {
    //   name: 'startTime',
    //   class: 'Long',
    //   factory: function() { return new Date().getTime(); },
    //   javaFactory: 'return System.currentTimeMillis();'
    // },
    // {
    //   name: 'echoTime',
    //   class: 'Long',
    // },
    // {
    //   name: 'endTime',
    //   class: 'Long',
    // },
    // {
    //   name: 'latency',
    //   class: 'Long',
    //   factory: function() {
    //     if ( this.endTime > 0 ) {
    //       return this.endTime - this.startTime;
    //     }
    //     return new Date().getTime() - this.startTime();
    //   },
    //   javaFactory: `
    //   long endTime = getEndTime();
    //   if ( endTime == 0L ) {
    //     endTime = System.currentTimeMillis();
    //   }
    //   return endTime - getStartTime();
    //   `
    // }
  ],
  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  public Ping(foam.core.X x, String hostname) {
    setHostname(hostname);
    // setPm(foam.nanos.pm.PM.create(x, this.getOwnClassInfo(), hostname));
    setPm(new foam.nanos.pm.PM(this.getOwnClassInfo(), hostname));
  }
         `
        }));
      }
    }
  ]
});
