/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.nanos.ruler',
  name: 'RuleHistoryStatus',
  documentation: 'Represents status of a rule history.',

  values: [
    {
      name: 'UNSCHEDULED',
      label: 'Unscheduled',
      documentation: 'Indicates rule history is unscheduled.'
    },
    {
      name: 'SCHEDULED',
      label: 'Scheduled',
      documentation: 'Indicates rule history is scheduled.'
    },
    {
      name: 'RUNNING',
      label: 'Running',
      documentation: 'Indicates rule history is being run.'
    },
    {
      name: 'FINISHED',
      label: 'Finished',
      documentation: 'Indicates rule history finished running.'
    },
    {
      name: 'ERROR',
      label: 'Error',
      documentation: 'Indicates error when running rule history.'
    }
  ]
});
