/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.datetime',
  name: 'Schedule',
  abstract: true,

  documentation: `
    Schedule for tasks which have a start time and no specified end time.
  `,

  methods: [
    {
      name: 'getNextScheduledTime',
      type: 'DateTime'
    }
  ]
});