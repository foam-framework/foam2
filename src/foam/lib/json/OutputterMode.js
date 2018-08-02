/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.lib.json',
  name: 'OutputterMode',

  documentation: 'Defines the mode for JSON Outputter',

  values: [
    {
      name: 'NETWORK',
      label: 'Network'
    },
    {
      name: 'STORAGE',
      label: 'Storage'
    },
    {
      name: 'FULL',
      label: 'Full'
    }
  ]
});
