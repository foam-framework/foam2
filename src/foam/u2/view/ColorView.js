/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ColorView',
  extends: 'foam.u2.view.ModeAltView',

  documentation: 'A view for foam.core.Color properties.',

  requires: [
    'foam.u2.TextField',
    'foam.u2.view.ColorPicker',
    'foam.u2.view.DualView',
    'foam.u2.view.ReadColorView'
  ],

  properties: [
    {
      name: 'readView',
      value: { class: 'foam.u2.view.ReadColorView' }
    },
    {
      name: 'writeView',
      value: {
        class: 'foam.u2.view.DualView',
        viewa: 'foam.u2.TextField',
        viewb: { class: 'foam.u2.view.ColorPicker', onKey: true }
      }
    }
  ],
});
