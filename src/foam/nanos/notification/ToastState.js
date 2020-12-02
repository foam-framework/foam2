/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.nanos.notification',
  name: 'ToastState',

  documentation: 'Enum for state of toast notification.',

  values: [
    {
      name: 'NONE',
      label: 'None'
    },
    {
      name: 'REQUESTED',
      label: 'Requested'
    },
    {
      name: 'DISPLAYED',
      label: 'Displayed'
    }
  ]
});
