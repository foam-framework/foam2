/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.nanos.auth',
  name: 'LifecycleState',

  values: [
    {
      name: 'PENDING',
      label: { en: 'Pending', pt: 'Pendente'},
    },
    {
      name: 'ACTIVE',
      label: { en: 'Active', pt: 'Ativo'},
    },
    {
      name: 'REJECTED',
      label: { en: 'Rejected', pt: 'Rejeitado'},
    },
    {
      name: 'DELETED',
      label: { en: 'Deleted', pt: 'Excluído'},
    }
  ]
});
