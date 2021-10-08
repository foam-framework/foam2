/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'LastModifiedByAwareMixin',

  implements: [
    'foam.nanos.auth.LastModifiedByAware'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      documentation: 'User who last modified entry',
      storageOptional: true,
      tableCellFormatter: function(value, obj, axiom) {
        this.__subSubContext__.userDAO
          .find(value)
          .then(user => this.add(user ? user.legalName : `ID: ${value}`));
      }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedByAgent',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      documentation: 'Agent acting as User who last modified entry',
      storageOptional: true,
      tableCellFormatter: function(value, obj, axiom) {
        this.__subSubContext__.userDAO
          .find(value)
          .then(user => this.add(user ? user.legalName : `ID: ${value}`));
      }
    }
  ]
});
