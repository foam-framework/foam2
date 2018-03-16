/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'Hours',

  documentation: 'Represents open and closing time',

  properties: [
    {
      class: 'Enum',
      of: 'foam.nanos.auth.DayOfWeek',
      name: 'day'
    },
    {
      class: 'Boolean',
      name: 'open'
    },
    {
      class: 'Time',
      name: 'startTime'
    },
    {
      class: 'Time',
      name: 'endTime'
    }
  ]
});
