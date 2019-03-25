/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.texteditor',
  name: 'FontFace',
  imports: [
    'document'
  ],
  actions: [
    {
      name: 'sansSerif',
      code: function() {
        this.document.execCommand('fontName', false, 'arial, sans-serif');
      }
    },
    {
      name: 'serif',
      code: function() {
        this.document.execCommand('fontName', false, 'times new roman, serif');
      }
    },
    {
      name: 'wide',
      code: function() {
        this.document.execCommand('fontName', false, 'arial bold, sans-serif');
      }
    },
    {
      name: 'narrow',
      code: function() {
        this.document.execCommand('fontName', false, 'arial narrow, sans-serif');
      }
    },
    {
      name: 'comicSans',
      code: function() {
        this.document.execCommand('fontName', false, 'comic sans, sans-serif');
      }
    },
    {
      name: 'courierNew',
      code: function() {
        this.document.execCommand('fontName', false, 'courier new, monospace');
      }
    },
    {
      name: 'garamond',
      code: function() {
        this.document.execCommand('fontName', false, 'garamond, sans-serif');
      }
    },
    {
      name: 'georgia',
      code: function() {
        this.document.execCommand('fontName', false, 'georgia, sans-serif');
      }
    },
    {
      name: 'tahoma',
      code: function() {
        this.document.execCommand('fontName', false, 'tahoma, sans-serif');
      }
    },
    {
      name: 'trebuchet',
      code: function() {
        this.document.execCommand('fontName', false, 'trebuchet ms, sans-serif');
      }
    },
    {
      name: 'verdana',
      code: function() {
        this.document.execCommand('fontName', false, 'verdana, sans-serif');
      }
    }
  ]
});