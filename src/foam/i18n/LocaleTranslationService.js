/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.i18n',
  name: 'LocaleTranslationService',
  implements: [ 'foam.i18n.TranslationService' ],

  methods: [
    {
      name: 'getTranslations',
      javaCode: `
        System.err.println("*********************************** getTranslations");
        return null;
      `
    },
    {
      name: 'getTranslation',
      javaCode: `
      System.err.println("*********************************** getTranslation");
      return "foobar";
      `
    }
  ]
});
