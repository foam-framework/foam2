/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.auth',
  name: 'LastModifiedByAware',

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      documentation: 'User who last modified entry'
    }
  ]
});

/**
 * This refinement is necessary because of the way the class loader works.
 * There wasn't a way in which User could implement LastModifiedByAware and the
 * LastModifiedAware interface to have a reference property without doing this refinement 
 */
foam.CLASS({
  refines: 'foam.nanos.auth.User',

  implements: [
    'foam.nanos.auth.LastModifiedByAware'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      documentation: 'User who last modified entry'
    }
  ]
});
