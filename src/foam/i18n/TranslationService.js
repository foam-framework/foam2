/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.i18n',
  name: 'TranslationService',

  methods: [
    {
      name: 'getTranslations',
      args: [ 'String locale' ],
      async: true,
      javaType: 'foam.i18n.Locale[]'
    },
    {
      name: 'getTranslation',
      async: true,
      args: [ 'String locale', 'String source' ],
//      javaType: 'foam.i18n.Locale'
type: 'String'
    }
  ]
});
