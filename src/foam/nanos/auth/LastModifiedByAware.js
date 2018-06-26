/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'LastModifiedByAware',

  properties: [
    {
      class: 'Long',
      name: 'lastModifiedBy',
      documentation: 'Reference to User id who last modified the entry'
    }
  ]
});
