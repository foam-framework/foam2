/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.comics.v2',
  name: 'CRUDEnabledActionsAuth',
  documentation: `
    A config which can take in customized front-end permission checks for actions 
    using the isEnabled method on action. Is wired up through DAOMenu2 by using the
    DAOControllerConfig. 
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
