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
      name: 'SCHEDULED',
      label: 'Scheduled',
      ordinal: 0,
      color: '/*%WARNING1%*/ #816819',
      background: '/*%WARNING4%*/ #fbe88f'
    },
    {
      name: 'UNSCHEDULED',
      label: 'Unscheduled',
      ordinal: 1,
      color: '/*%GREY1%*/ #5e6061',
      background: '/*%GREY4%*/ #e7eaec',
    },
    {
      name: 'RUNNING',
      label: 'Running',
      ordinal: 2,
      color: '/*%APPROVAL2%*/ #117a41',
      background: '/*%APPROVAL5%*/ #e2f2dd',
    },
    {
      name: 'ERROR',
      label: 'Error',
      ordinal: 3,
      color: '/*%DESTRUCTIVE2%*/ #a61414',
      background: '/*%DESTRUCTIVE5%*/ #fbedec'
    }
  ]
});
