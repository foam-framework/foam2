/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.comics.v2',
  name: 'CRUDEnabledActionsAuth',
  documentation: `
    String arrays of permissions that will be checked on each CRUD action through availablePermissions
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'isEnabled'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.EnabledActionsAuth',
      name: 'enabledActionsAuth',
    }
  ]
});