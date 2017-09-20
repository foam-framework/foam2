/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.cron',
  name: 'CronSchedulerService',
  extends: 'foam.nanos.NanoService',

  methods: [
    {
      name: 'run',
      javaReturns: 'void',
      javaThrows: [ 'java.lang.RuntimeException' ],
      args: []
    }
  ]
});
