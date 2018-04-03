/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.nanos.http',
  name: 'Format',

  documentation: 'HTTP response formats.',

  values: [
    { name: 'CSV',   label: 'CSV' },
    { name: 'HTML',  label: 'HTML' },
    { name: 'JSON',  label: 'JSON' },
    { name: 'JSONJ', label: 'JSON/J' },
    { name: 'XML',   label: 'XML'  }
  ]
});
