/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'io.c9.ace',
  name: 'KeyBinding',
  properties: [
    'path'
  ],
  values: [
    {
      path: null,
      name: 'Ace'
    },
    {
      path: 'ace/keyboard/vim',
      name: 'Vim'
    },
    {
      path: 'ace/keyboard/emacs',
      name: 'Emacs'
    },
    {
      path: 'ace/keyboard/sublime',
      name: 'Sublime'
    },
  ]
});
