/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'FontFace',
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
            .start('div').start(this.SANS_SERIF).addClass('richtext-button').end().end()
            .start('div').start(this.SERIF).addClass('richtext-button').end().end()
            .start('div').start(this.WIDE).addClass('richtext-button').end().end()
            .start('div').start(this.NARROW).addClass('richtext-button').end().end()
            .start('div').start(this.COMIC_SANS).addClass('richtext-button').end().end()
            .start('div').start(this.COURIER_NEW).addClass('richtext-button').end().end()
            .start('div').start(this.GARAMOND).addClass('richtext-button').end().end()
            .start('div').start(this.GEORGIA).addClass('richtext-button').end().end()
            .start('div').start(this.TAHOMA).addClass('richtext-button').end().end()
            .start('div').start(this.TREBUCHET).addClass('richtext-button').end().end()
            .start('div').start(this.VERDANA).addClass('richtext-button').end().end()
          .end()
        .end();
    }
  ],

  actions: [
    {
      name: 'sansSerif',
      help: 'Set\'s the font face.',
      code: function() {
        this.window.focus();
        this.document.execCommand('fontName', false, 'arial, sans-serif');
        this.menu.hide();
      }
    },
    {
      name: 'serif',
      help: 'Set\'s the font face.',
      code: function() {
        this.window.focus();
        this.document.execCommand('fontName', false, 'times new roman, serif');
        this.menu.hide();
      }
    },
    {
      name: 'wide',
      help: 'Set\'s the font face.',
      code: function() {
        this.window.focus();
        this.document.execCommand('fontName', false, 'arial bold, sans-serif');
        this.menu.hide();
      }
    },
    {
      name: 'narrow',
      help: 'Set\'s the font face.',
      code: function() {
        this.window.focus();
        this.document.execCommand('fontName', false, 'arial narrow, sans-serif');
        this.menu.hide();
      }
    },
    {
      name: 'comicSans',
      help: 'Set\'s the font face.',
      code: function() {
        this.window.focus();
        this.document.execCommand('fontName', false, 'comic sans, sans-serif');
        this.menu.hide();
      }
    },
    {
      name: 'courierNew',
      help: 'Set\'s the font face.',
      code: function() {
        this.window.focus();
        this.document.execCommand('fontName', false, 'courier new, monospace');
        this.menu.hide();
      }
    },
    {
      name: 'garamond',
      help: 'Set\'s the font face.',
      code: function() {
        this.window.focus();
        this.document.execCommand('fontName', false, 'garamond, sans-serif');
        this.menu.hide();
      }
    },
    {
      name: 'georgia',
      help: 'Set\'s the font face.',
      code: function() {
        this.window.focus();
        this.document.execCommand('fontName', false, 'georgia, sans-serif');
        this.menu.hide();
      }
    },
    {
      name: 'tahoma',
      help: 'Set\'s the font face.',
      code: function() {
        this.window.focus();
        this.document.execCommand('fontName', false, 'tahoma, sans-serif');
        this.menu.hide();
      }
    },
    {
      name: 'trebuchet',
      help: 'Set\'s the font face.',
      code: function() {
        this.window.focus();
        this.document.execCommand('fontName', false, 'trebuchet ms, sans-serif');
        this.menu.hide();
      }
    },
    {
      name: 'verdana',
      help: 'Set\'s the font face.',
      code: function() {
        this.window.focus();
        this.document.execCommand('fontName', false, 'verdana, sans-serif');
        this.menu.hide();
      }
    },
  ],
});
