/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.nanos.script',
  name: 'ScriptStatus',
  values: [
    {
      name:'SCHEDULED',
      label: 'Scheduled'
    },
    {
      name:'UNSCHEDULED',
      label: 'Unscheduled'
    },
    {
      name:'RUNNING',
      label: 'Running'
    },
    {
      name: 'ERROR',
      label: 'Error'
    }
  ]
});
