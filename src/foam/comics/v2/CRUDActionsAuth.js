/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.comics.v2',
  name: 'CRUDActionsAuth',
  documentation: `
    String arrays of permissions that will be checked on each CRUD action thorugh availablePermissions
  `,

  properties: [
    {
      class: 'StringArray',
      name: 'create',
      documentation: `
        Permission will be read as defined (e.g. object.create will be read as object.create)
      `,
    },
    {
      class: 'StringArray',
      name: 'update',
      documentation: `
        If a permission includes % it will be replaced with the id of the object 
        otherwise it will be read as defined
        (e.g. object.update on object id 12 will be read as object.update)
        (e.g. object.update.% on object id 12 will be read as object.update.12)
      `,
    },
    {
      class: 'StringArray',
      name: 'delete',
      documentation: `
        If a permission includes % it will be replaced with the id of the object 
        otherwise it will be read as defined
        (e.g. object.delete on object id 12 will be read as object.delete)
        (e.g. object.delete.% on object id 12 will be read as object.delete.12)
      `,
    }
  ]
}); 
