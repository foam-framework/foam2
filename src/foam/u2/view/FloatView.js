/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'FloatView',
  extends: 'foam.u2.view.ModeAltView',

  documentation: 'A view for foam.core.Float properties.',

  requires: [
    'foam.u2.FloatView',
    'foam.u2.view.ValueView'
  ],

  properties: [
    {
      name: 'readView',
      value: { class: 'foam.u2.view.ValueView' }
    },
    {
      name: 'writeView',
      value: { class: 'foam.u2.FloatView' }
    }
  ],
});
