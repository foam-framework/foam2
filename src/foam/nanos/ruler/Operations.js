/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.nanos.ruler',
  name: 'Operations',
  documentation: 'Type of operation to be specified for a rule.',

  values: [
    {
      name: 'CREATE',
      label: 'Create',
      documentation: 'Operation applied on dao.put when the object is new.'
    },
    {
      name: 'UPDATE',
      label: 'Update',
      documentation: 'Operation applied on dao.put when the object is not new.'
    },
    {
      name: 'REMOVE',
      label: 'Remove',
      documentation: 'Operation applied on dao.remove.'
    },
    {
      name: 'CREATE_OR_UPDATE',
      label: 'Create/Update',
      documentation: 'Operation applied on dao.put'
    }
  ]
});
