/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.nanos.http',
  name: 'Command',

  documentation: 'Nanos equivelent HTTP methods',

  values: [
    { name: 'SELECT', label: 'SELECT' },
    { name: 'PUT',    label: 'PUT' },
    { name: 'REMOVE', label: 'REMOVE' }
    //{ name: 'find',  label: 'FIND' },
    //{ name: 'help',   label: 'HELP' }
  ]
});
