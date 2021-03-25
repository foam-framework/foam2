/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ThemeRefinements',
  refines: 'foam.nanos.theme.Theme',

  properties: [
    {
      documentation: 'When true, 2FA will be enforced if AppConfig.MODE == PRODUCTION, otherwise it will generate a warning banner',
      name: 'twoFactorEnabled',
      class: 'Boolean',
      section: 'administration'
    }
  ]
});
