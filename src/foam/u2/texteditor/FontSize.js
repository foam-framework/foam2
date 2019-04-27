/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.texteditor',
  name: 'FontSize',
  imports: [
    'document'
  ],
  actions: [
    {
      name: 'small',
      help: 'Sets the font size to small.',
      toolTip: 'Small Font Size',
      label: 'small',
      code: function() {
        this.document.execCommand('fontSize', false, '2');
      }
    },
    {
      name: 'normal',
      help: 'Sets the font size to normal.',
      label: 'normal',
      toolTip: 'Normal Font Size',
      code: function() {
        this.document.execCommand('fontSize', false, '3');
      }
    },
    {
      name: 'large',
      help: 'Sets the font size to small.',
      label: 'large',
      toolTip: 'Large Font Size',
      code: function() {
        this.document.execCommand('', false, '5');
      }
    },
    {
      name: 'huge',
      help: 'Sets the font size to huge.',
      toolTip: 'Huge Font Size',
      code: function() {
        this.document.execCommand('fontSize', false, '7');
      }
    }
  ]
});