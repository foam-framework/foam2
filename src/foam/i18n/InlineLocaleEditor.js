/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.i18n',
  name: 'InlineLocaleEditor',
  extends: 'foam.u2.tag.Input',

  css: `
    ^ { border: 1px solid red; padding: 4px; }
  `,

  requires: [ 'foam.i18n.Locale' ],

  imports: [
    'localeDAO',
    'translationService'
  ],

  properties: [
    {
      name: 'source'
    },
    {
      name: 'defaultText'
    },
    {
      name: 'mode',
      value: foam.u2.DisplayMode.RW
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass());
      this.data$.sub(this.onDataUpdate);
    }
  ],

  listeners: [
    function onDataUpdate() {
      console.log('**********', this.source, this.defaultText, this.data);
      var l = this.Locale.create({
        locale:  foam.lang,
        variant: foam.variant,
        source:  this.source,
        target:  this.data
      });

      this.localeDAO.put(l);

      this.translationService.localeEntries[this.source] = this.data;
    }
  ]
});
