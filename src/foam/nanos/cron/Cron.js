/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cron',
  name: 'Cron',
  extends: 'foam.nanos.script.Script',

  properties: [
    {
      class: 'Int',
      name: 'minute'
    },
    {
      class: 'Int',
      name: 'hour'
    },
    {
      class: 'Int',
      name: 'day'
    },
    {
      class: 'Int',
      name: 'month'
    },
    {
      class: 'Int',
      name: 'weekday'
    }
  ]
});
