/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.nanos.dao',
  name: 'Operation',
  documentation: `
    Descriptive values of DAO interface methods translated into basic CRUD operations.
    DAO operations are abstracted enough to warrant the requirements of defining typical
    basic operations of persistent storage.
    
    Example being that a DAO updating an object would call the same DAO method when creating
    an object (dao.put). You can view default DAO operations in foam.dao.DOP.js
    FOAM likes to differentiate between these abstracted methods and basic CRUD operations,
    like with Rules and Authorizers, where actions and logic relate better to CRUD.
  `,

  values: [
    {
      name: 'CREATE',
      label: 'Create',
      documentation: `
        Operation applied when creating a new object in a DAO. (dao.put when the object is new)
      `
    },
    {
      name: 'UPDATE',
      label: 'Update',
      documentation: `
        Operation applied when updating an object in a DAO. (dao.put when the object is not new)
      `
    },
    {
      name: 'REMOVE',
      label: 'Remove',
      documentation:  `
        Operation applied when removing an object in a DAO. (dao.remove or removeAll)
      `
    },
    {
      name: 'CREATE_OR_UPDATE',
      label: 'Create/Update',
      documentation: `
        Operation applied when creating or updating an object in a DAO. (dao.put)
      `
    },
    {
      name: 'READ',
      label: 'Read',
      documentation: `
        Operation applied when reading an object in a DAO. (dao.find or select)
      `
    }
  ]
});
