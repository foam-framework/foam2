/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.nanos.dig',
  name: 'Format',

  documentation: 'DIG/DUG formats.',

  values: [
    { name: 'CSV',   label: 'CSV' },
    { name: 'HTML',  label: 'HTML' },
    { name: 'JSON',  label: 'JSON' },
    { name: 'JSONJ', label: 'JSON/J' },
    { name: 'XML',   label: 'XML'  }
  ]
});
