/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.i18n',
  name: 'ClientTranslationService',

  implements: [ 'foam.i18n.TranslationService' ],

  properties: [
    {
      class: 'Stub',
      of: 'foam.i18n.TranslationService',
      name: 'delegate'
    }
  ]
});
