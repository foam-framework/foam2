/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.auth',
  name: 'LastModifiedAware',

  properties: [
    {
      class: 'DateTime',
      name: 'lastModified',
      documentation: 'Last modified date'
    }
  ]
});
