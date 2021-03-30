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
      label: { en: 'Create', pt: 'Crio'},
      documentation: 'Operation applied on dao.put when the object is new.'
    },
    {
      name: 'UPDATE',
      label: { en: 'Update', pt: 'Atualizar'},
      documentation: 'Operation applied on dao.put when the object is not new.'
    },
    {
      name: 'REMOVE',
      label: { en: 'Remove', pt: 'Retirar'},
      documentation: 'Operation applied on dao.remove.'
    },
    {
      name: 'CREATE_OR_UPDATE',
      label: 'Create/Update',
      label: { en: 'Create/Update', pt: 'Crio/Atualizar'},
      documentation: 'Operation applied on dao.put'
    },
    {
      name: 'READ',
      label: 'read',
      documentation: 'Operation applied on dao.read'
    }
  ]
});
