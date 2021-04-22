/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'LastModifiedAwareMixin',

  implements: [
    'foam.nanos.auth.LastModifiedAware'
  ],

  properties: [
    {
      class: 'DateTime',
      name: 'lastModified',
      documentation: 'Last modified date',
      storageOptional: true,
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO'
    }
  ]
});
