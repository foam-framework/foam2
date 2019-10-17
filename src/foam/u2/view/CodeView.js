/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'CodeView',
  extends: 'foam.u2.view.ModeAltView',

  documentation: 'A view for foam.core.Code properties.',

  requires: [
    'foam.u2.view.PreView',
    'io.c9.ace.Editor'
  ],

  properties: [
    {
      name: 'readView',
      value: { class: 'foam.u2.view.PreView' }
    },
    {
      name: 'writeView',
      value: { class: 'io.c9.ace.Editor' }
    }
  ],
});
