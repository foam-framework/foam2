/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.i18n',
  name: 'ClientCacheTranslationService',
  implements: [ 'foam.i18n.TranslationService' ],

  methods: [
    /*
    {
      name: 'getTranslations',
      args: [ 'String locale' ],
      async: true
    },
    */
    {
      name: 'getTranslation',
      async: true,
      args: [ 'String locale', 'String source' ],
      type: 'String',
      code: function(locale, source) {
        return source + '-' + locale;
      }
    }
  ]
});
