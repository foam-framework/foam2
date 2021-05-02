/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.auth',
  name: 'CreatedByAware',

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      documentation: 'User who created the entry'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent',
      documentation: 'Agent acting as User who created the entry',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO'
    }
  ]
});

/**
 * This refinement is necessary because of the way the class loader works.
 * There wasn't a way in which User could implement CreatedByAware and the
 * CreatedByAware interface to have a reference property without doing this refinement
 */
foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'UserCreatedByAwareRefinement',
  refines: 'foam.nanos.auth.User',

  implements: [
    'foam.nanos.auth.CreatedByAware'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      documentation: 'User who created the entry',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      section: 'userInformation',
      gridColumns: 6
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent',
      documentation: 'Agent acting as User who created the entry',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      section: 'userInformation',
      gridColumns: 6
    }
  ]
});
