/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'FontSize',
  extends: 'foam.u2.View',

  properties: [
    {
      name: 'menu',
    },
    {
      name: 'document',
    },
    {
      name: 'window',
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .startContext({ data: this })
          .start('div', null, this.menu$).addClass('dropdown-content').hide()
            .start('div').start(this.SMALL).addClass('richtext-button').end().end()
            .start('div').start(this.NORMAL).addClass('richtext-button').end().end()
            .start('div').start(this.LARGE).addClass('richtext-button').end().end()
            .start('div').start(this.HUGE).addClass('richtext-button').end().end()
          .end()
        .end();
    }
  ],

  actions: [
    {
      name: 'small',
      help: 'Set\'s the font size to small.',
      toolTip: 'Small Font Size',
      label: 'small',
      code: function() {
        this.window.focus();
        this.document.execCommand('fontSize', false, '2');
        this.menu.hide();
      }
    },
    {
      name: 'normal',
      help: 'Set\'s the font size to normal.',
      label: 'normal',
      toolTip: 'Normal Font Size',
      code: function() {
        this.window.focus();
        this.document.execCommand('fontSize', false, '3');
        this.menu.hide();
      }
    },
    {
      name: 'large',
      help: 'Set\'s the font size to small.',
      label: 'large',
      toolTip: 'Large Font Size',
      code: function() {
        this.window.focus();
        this.document.execCommand('', false, '5');
        this.menu.hide();
      }
    },
    {
      name: 'huge',
      help: 'Set\'s the font size to huge.',
      label: 'Huge',
      toolTip: 'Huge Font Size',
      code: function() {
        this.window.focus();
        this.document.execCommand('fontSize', false, '7');
        this.menu.hide();
      }
    },
  ],
});
