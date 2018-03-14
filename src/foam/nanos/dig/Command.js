/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.nanos.dig',
  name: 'Command',

  documentation: 'DUG formats: JSON/XML.',

  values: [
    { name: 'select' },
    { name: 'put' },
    { name: 'remove' }
  ]
});
