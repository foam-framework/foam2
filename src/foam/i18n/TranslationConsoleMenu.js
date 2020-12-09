/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.i18n',
  name: 'TranslationConsoleMenu',
  extends: 'foam.u2.Element',

  css: `
    ^ { padding: 200px; }
  `,

  requires: [
    'foam.i18n.TranslationConsole'
  ],

  methods: [
    function initE() {
      foam.i18n.TranslationConsole.OPEN();
      this.
        start().
          addClass(this.myClass()).
          add('The Translation Console has opened in a new tab.').
        end();
    }
  ]
});
